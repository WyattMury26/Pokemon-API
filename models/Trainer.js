const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    // This connects the Trainer to the User account
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // You can keep 'name' as a nickname, or remove it and just use the username
    name: String, 
    region: String,
    badges: Number,
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon' }]
});

module.exports = mongoose.model('Trainer', trainerSchema);