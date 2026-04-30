const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
    // The person sending the offer
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // The person receiving the offer
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // The Pokémon being offered by the sender
    offeredPokemon: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon', required: true },
    // The Pokémon the sender wants from the receiver
    wantedPokemon: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon', required: true },
    // The status of the deal
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', TradeSchema);