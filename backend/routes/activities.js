const express = require('express');
const axios = require('axios');
const router = express.Router();

let accessToken = '';

const getAmadeusToken = async () => {
  const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  accessToken = response.data.access_token;
};

router.get('/', async (req, res) => {
  const { lat = '12.9716', lng = '77.5946' } = req.query;

  try {
    if (!accessToken) await getAmadeusToken();
    const response = await axios.get('https://test.api.amadeus.com/v1/shopping/activities', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: { latitude: lat, longitude: lng },
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Activity fetch failed' });
  }
});

module.exports = router;
