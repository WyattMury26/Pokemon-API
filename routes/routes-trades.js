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

// @route   PUT api/v1/trades/:id/accept
// @desc    Accept a trade and swap owners
router.put('/:id/accept', auth, async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) return res.status(404).json({ msg: "Trade not found" });
        if (trade.receiver.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

        // 1. Swap the 'user' field on both Pokemon documents
        await Pokemon.findByIdAndUpdate(trade.offeredPokemon, { user: trade.receiver });
        await Pokemon.findByIdAndUpdate(trade.wantedPokemon, { user: trade.sender });

        // 2. Update trade status
        trade.status = 'accepted';
        await trade.save();

        res.json({ msg: "Trade successful! Your teams have been updated." });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;