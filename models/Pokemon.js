const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
    id: Number,
    name: String,
    nickname: String,
    types: [String],
    base_stats: {
        hp: Number,
        attack: Number,
        defense: Number
    },
    sprite: String,
    isCaught: Boolean,

      user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
});

module.exports = mongoose.model('Pokemon', pokemonSchema);