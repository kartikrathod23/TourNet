const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const city = req.query.city || 'Goa';

    const response = await axios.get(
      `https://api.makcorps.com/free/makcorps-hotel-prices?city=${city}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MAKCORPS_API_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Hotel API fetch failed' });
  }
});

module.exports = router;
