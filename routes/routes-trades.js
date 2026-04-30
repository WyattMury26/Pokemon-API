const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Trade = require('../models/Trade'); // This connects to the file you just made!
const Pokemon = require('../models/Pokemon');

router.post('/', auth, async (req, res) => {
    try {
        const { offeredPokemonId, wantedPokemonId } = req.body;
        const targetPoke = await Pokemon.findById(wantedPokemonId);
        
        if (!targetPoke) return res.status(404).json({ msg: "Target Pokemon not found" });

        const newTrade = new Trade({
            sender: req.user.id,
            receiver: targetPoke.user, 
            offeredPokemon: offeredPokemonId,
            wantedPokemon: wantedPokemonId
        });

        const trade = await newTrade.save();
        res.json(trade);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;