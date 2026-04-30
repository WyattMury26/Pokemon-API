const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offeredPokemon: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon', required: true },
    wantedPokemon: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', TradeSchema);