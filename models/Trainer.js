const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    name: String,
    region: String,
    badges: Number,
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon' }]
});

module.exports = mongoose.model('Trainer', trainerSchema);