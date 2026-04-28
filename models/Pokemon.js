const mongoose = require('mongoose');
const auth = require('../middleware/auth');

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
    isCaught: { type: Boolean, default: true},

      user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    
    capturedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pokemon', pokemonSchema);