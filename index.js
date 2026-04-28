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

// --- POKEMON ROUTES ---

// Search all pokemon
app.get('/api/v1/pokemon', async (req, res) => {
  try {
    const allPokemon = await Pokemon.find();
    res.json(allPokemon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search for Pokemon by type or stats
app.get('/api/v1/search', async (req, res) => {
  try {
    const { type, minAttack } = req.query;
    let query = {};
    if (type) query.types = type;
    if (minAttack) query['base_stats.attack'] = { $gte: minAttack };

    const results = await Pokemon.find(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific Pokemon by name
app.get('/api/v1/pokemon/:name', auth, async (req, res) => {
  try {
    const pokemon = await Pokemon.findOne({ 
      name: { $regex: new RegExp("^" + req.params.name + "$", "i") } 
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

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`🚀 API is live at port ${PORT}`);
});