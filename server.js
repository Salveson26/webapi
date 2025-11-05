const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = 'AIzaSyA0yTr1uc-voEbiJizWFcSMvhsU6QWj2Bc';
const MODEL = 'gemini-1.5-flash';

app.post('/gemini', async (req, res) => {
  const contents = req.body.contents;
  if (!contents || !Array.isArray(contents)) {
    return res.status(400).json({ error: 'Missing or invalid contents array' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
    res.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ error: 'Failed to reach Gemini API' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Gemini proxy running on port ${PORT}`));
