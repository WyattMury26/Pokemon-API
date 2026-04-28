const express = require('express');
const mongoose = require('mongoose');
const Pokemon = require('./models/Pokemon');
const Trainer = require('./models/Trainer');
require('dotenv').config();
const cors = require('cors'); // Add this

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // This allows the server to read JSON data

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)

// This block MUST be here for the message to show up
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => console.log("❌ Database connection error:", err));

  app.use(cors());              // Add this right before your routes;

// --- POKEMON ROUTES ---

// Add this new route to search all pokemon
app.get('/api/v1/pokemon', async (req, res) => {
  try {
    const allPokemon = await Pokemon.find();
    res.json(allPokemon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1. Search for Pokemon by type or stats
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

// 2. Get a specific Pokemon by name
app.get('/api/v1/pokemon/:name', async (req, res) => {
  try {
    // This 'i' makes it case-insensitive so 'charmander' and 'Charmander' both work
    const pokemon = await Pokemon.findOne({ 
      name: { $regex: new RegExp("^" + req.params.name + "$", "i") } 
    });

    if (!pokemon) {
      return res.status(404).json({ message: "Pokémon not found" });
    }

    res.json(pokemon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Create a new Pokemon
app.post('/api/v1/pokemon', async (req, res) => {
  try {
    const newPokemon = new Pokemon({
      id: req.body.id,
      name: req.body.name,
      types: req.body.types,
      base_stats: req.body.base_stats,
      sprite: req.body.sprite || "https://example.com/default.png"
    });
    const savedPokemon = await newPokemon.save();
    res.status(201).json(savedPokemon);
  } catch (err) {
    res.status(400).json({ message: "Error creating Pokémon", error: err.message });
  }
});

// 4. Catch/Nickname a Pokemon
app.patch('/api/v1/pokemon/:name/catch', async (req, res) => {
  try {
    const updated = await Pokemon.findOneAndUpdate(
      { name: req.params.name.toLowerCase() },
      { isCaught: true, nickname: req.body.nickname },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Pokémon not found" });
    res.json({ message: `You caught ${updated.name}!`, data: updated });
  } catch (err) {
    res.status(400).json({ message: "Capture failed" });
  }
});

// --- TRAINER ROUTES ---

// 5. Create a Trainer
app.post('/api/v1/trainers', async (req, res) => {
  try {
    const trainer = new Trainer({
      name: req.body.name,
      region: req.body.region
    });
    const saved = await trainer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Error creating trainer" });
  }
});

// 6. Add a Pokemon to a Trainer's team
app.patch('/api/v1/trainers/:trainerName/add', async (req, res) => {
  try {
    const pokemon = await Pokemon.findOne({ name: req.body.pokemonName.toLowerCase() });
    if (!pokemon) return res.status(404).json({ message: "Pokemon not found" });

    const trainer = await Trainer.findOneAndUpdate(
      { name: req.params.trainerName },
      { $push: { team: pokemon._id } },
      { new: true }
    ).populate('team');

    res.json(trainer);
  } catch (err) {
    res.status(400).json({ message: "Could not add to team" });
  }
});

// This tells Express how to handle the "PUT" request you're sending
app.put('/api/v1/pokemon/:name', async (req, res) => {
    try {
        // We use { name: req.params.name } to find Charmander in the DB
        const updatedPokemon = await Pokemon.findOneAndUpdate(
            { name: req.params.name }, 
            req.body, 
            { new: true }
        );

        if (!updatedPokemon) {
            return res.status(404).json({ message: "Pokemon not found in database" });
        }

        res.json(updatedPokemon);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE a Pokémon by name
app.delete('/api/v1/pokemon/:name', async (req, res) => {
  try {
    const deletedPokemon = await Pokemon.findOneAndDelete({ 
      name: new RegExp('^' + req.params.name + '$', 'i') 
    });
    
    if (!deletedPokemon) return res.status(404).json({ message: "Pokémon not found" });
    
    res.json({ message: `${deletedPokemon.name} was released back into the wild!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- SERVER START ---
// Note: You need mongoose.connect() here for this to actually save data!
const PORT = process.env.PORT || 10000; // Use Render's port OR 10000 as a backup

app.listen(PORT, () => {
    console.log(`🚀 API is live at https://pokemon-api-2llp.onrender.com`);
});