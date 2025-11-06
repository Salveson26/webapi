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
    console.warn('Invalid contents array:', req.body);
    return res.status(400).json({ reply: 'Missing or invalid contents array.' });
  }

  console.log('Incoming payload:', JSON.stringify(req.body, null, 2));

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      req.body,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    console.log('Raw Gemini response:', JSON.stringify(response.data, null, 2));

    const candidates = response.data?.candidates;
    const parts = candidates?.[0]?.content?.parts;
    const reply = parts?.[0]?.text;

    if (reply) {
      return res.json({ reply });
    } else {
      console.warn('No reply found in Gemini response:', response.data);
      return res.json({ reply: 'No reply found.' });
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error';
    console.error('Gemini API error:', errorMessage);

    // ✅ Always return valid JSON with a reply field
    return res.status(500).json({
      reply: `Gemini API error: ${errorMessage}`
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Gemini proxy running on port ${PORT}`));