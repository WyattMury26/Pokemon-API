const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./middleware/auth');
require('dotenv').config();

// Import Models
const Pokemon = require('./models/Pokemon');
const Trainer = require('./models/Trainer');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Allows your HTML to talk to the API
app.use(express.json()); // Allows the server to read JSON
app.use(express.static(__dirname)); // Serves your CSS/Images from the main folder
app.use('/api/v1/auth', require('./routes/auth'));

// Define the Port (Important for Render!)
const PORT = process.env.PORT || 10000;

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => console.log("❌ Database connection error:", err));

// --- HOME ROUTE ---
// This sends your index.html when you visit the main link
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- GET TRAINER PROFILE ---
app.get('/api/v1/trainers/:userId', async (req, res) => {
    try {
        // Find all pokemon belonging to the ID passed in the URL
        const trainerPokemon = await Pokemon.find({ user: req.params.userId })
            .populate('user', 'username'); 
        
        // If we found pokemon, the first one contains the trainer info
        const username = trainerPokemon.length > 0 ? trainerPokemon[0].user.username : "Unknown Trainer";

        res.json({
            username: username,
            team: trainerPokemon
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- POKEMON ROUTES ---

// Search all pokemon
// --- REPLACE IT WITH THIS ---
app.get('/api/v1/pokemon', auth, async (req, res) => {
  try {
    // We add the filter { user: req.user.id } just like your search route has!
    const allPokemon = await Pokemon.find({ user: req.user.id }); 
    res.json(allPokemon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search for Pokemon by type or stats (Secured)
app.get('/api/v1/search', auth, async (req, res) => { // 1. Added 'auth' bouncer
    try {
        const { type, minAttack } = req.query;
        let query = {};
        
        // 2. This is the "Privacy Lock"
        // It ensures the search ONLY looks at the logged-in user's team
        query.user = req.user.id; 

        if (type) query.types = type;
        if (minAttack) query['base_stats.attack'] = { $gte: minAttack };

        const results = await Pokemon.find(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific Pokemon by name (Secured)
// 1. ADD 'auth' HERE ->
app.get('/api/v1/pokemon/:name', auth, async (req, res) => {
    try {
        const pokemon = await Pokemon.findOne({ 
            name: { $regex: new RegExp("^" + req.params.name + "$", "i") },
            user: req.user.id // 2. ADD THIS LINE HERE
        });

        if (!pokemon) return res.status(404).json({ message: "Pokémon not found" });
        res.json(pokemon);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new Pokemon
app.post('/api/v1/pokemon', auth, async (req, res) => {
    try {
        // --- THIS IS THE CRUCIAL PART ---
        // Instead of just using (req.body), we 'spread' it (...)
        // and manually insert the User ID from the token!
        const newPokemon = new Pokemon({
            ...req.body,       // Name, Types, Sprite, etc., from Thunder Client
            user: req.user.id  // This tags the Pokemon with your ID from the bouncer (auth middleware)
        });
        // --------------------------------

        const savedPokemon = await newPokemon.save();
        res.status(201).json(savedPokemon);
    } catch (err) {
        res.status(400).json({ message: "Error creating Pokémon", error: err.message });
    }
});

// --- DELETE A POKEMON (Release) ---
app.delete('/api/v1/pokemon/:id', auth, async (req, res) => {
    try {
        // Find the pokemon by ID AND make sure it belongs to the logged-in user
        const pokemon = await Pokemon.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!pokemon) {
            return res.status(404).json({ message: "Pokémon not found or unauthorized" });
        }

        res.json({ message: "Pokémon released successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- GLOBAL LEAGUE ROUTE (Public) ---
// Note: We don't use the 'auth' middleware here so anyone can see the league!
// --- GLOBAL LEAGUE ROUTE (Public) ---
app.get('/api/v1/league', async (req, res) => {
    try {
        // .populate('user', 'username') tells the DB to fetch the 
        // username from the User collection based on the ID stored in the Pokemon
        const allPokemon = await Pokemon.find().populate('user', 'username'); 
        
        res.json(allPokemon);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`🚀 API is live at port ${PORT}`);
});