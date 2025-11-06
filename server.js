const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = 'AIzaSyA0yTr1uc-voEbiJizWFcSMvhsU6QWj2Bc';
const MODEL = 'models/gemini-2.5-flash';

app.post('/gemini', async (req, res) => {
  const contents = req.body.contents;
  if (!contents || !Array.isArray(contents)) {
    return res.status(400).json({ error: 'Missing or invalid contents array' });
  }

  console.log('Incoming payload:', JSON.stringify(req.body, null, 2));

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      req.body,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 seconds
      }
    );

    console.log('Raw Gemini response:', JSON.stringify(response.data, null, 2));

    const candidates = response.data?.candidates;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      console.warn('No candidates in Gemini response:', response.data);
      return res.json({ reply: 'No reply found.' });
    }

    const parts = candidates[0]?.content?.parts;
    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      console.warn('No parts in Gemini response:', response.data);
      return res.json({ reply: 'No reply found.' });
    }

    const reply = parts[0]?.text || 'No reply found.';

    // Optional debug mode: return raw response if ?debug=true
    if (req.query.debug === 'true') {
      return res.json({ raw: response.data });
    }

    res.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to reach Gemini API' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Gemini proxy running on port ${PORT}`));