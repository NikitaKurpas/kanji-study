const express = require('express');
const cors = require('cors');
const { initialize } = require('./db');
const kanjiRepository = require('./repositories/kanjiRepository');
const wordRepository = require('./repositories/wordRepository');

// Initialize the database
initialize();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Get all kanji
app.get('/api/kanji', async (req, res) => {
  try {
    const kanji = await kanjiRepository.getAllKanji();
    res.json(kanji);
  } catch (error) {
    console.error('Error fetching kanji:', error);
    res.status(500).json({ error: 'Failed to fetch kanji' });
  }
});

// Get kanji by grades
app.get('/api/kanji/grades', async (req, res) => {
  try {
    const grades = req.query.grades ? req.query.grades.split(',').map(Number) : [1, 2, 3, 4, 5];
    const kanji = await kanjiRepository.getKanjiByGrades(grades);
    res.json(kanji);
  } catch (error) {
    console.error('Error fetching kanji by grades:', error);
    res.status(500).json({ error: 'Failed to fetch kanji by grades' });
  }
});

// Get kanji for review
app.get('/api/kanji/review', async (req, res) => {
  try {
    const grades = req.query.grades ? req.query.grades.split(',').map(Number) : [1, 2, 3, 4, 5];
    const limit = parseInt(req.query.limit) || 10;
    const mode = req.query.mode || 'meaning-to-kanji'; // or kanji-to-meaning
    
    const kanji = await kanjiRepository.getKanjiForReview(grades, limit, mode);
    res.json(kanji);
  } catch (error) {
    console.error('Error fetching kanji for review:', error);
    res.status(500).json({ error: 'Failed to fetch kanji for review' });
  }
});

// Update kanji level after review
app.post('/api/kanji/update-level', async (req, res) => {
  try {
    const { kanjiId, correct } = req.body;
    
    if (kanjiId === undefined || correct === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await kanjiRepository.updateKanjiLevel(kanjiId, correct);
    res.json(result);
  } catch (error) {
    console.error('Error updating kanji level:', error);
    res.status(500).json({ error: 'Failed to update kanji level' });
  }
});

// Get kanji stats
app.get('/api/stats/kanji', async (req, res) => {
  try {
    const stats = await kanjiRepository.getKanjiStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching kanji stats:', error);
    res.status(500).json({ error: 'Failed to fetch kanji stats' });
  }
});

// Get all words
app.get('/api/words', async (req, res) => {
  try {
    const words = await wordRepository.getAllWords();
    res.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({ error: 'Failed to fetch words' });
  }
});

// Get words for review
app.get('/api/words/review', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const mode = req.query.mode || 'reading-to-word'; // or word-to-reading, meaning-to-word
    
    const words = await wordRepository.getWordsForReview(limit, mode);
    res.json(words);
  } catch (error) {
    console.error('Error fetching words for review:', error);
    res.status(500).json({ error: 'Failed to fetch words for review' });
  }
});

// Update word level after review
app.post('/api/words/update-level', async (req, res) => {
  try {
    const { wordId, correct } = req.body;
    
    if (wordId === undefined || correct === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await wordRepository.updateWordLevel(wordId, correct);
    res.json(result);
  } catch (error) {
    console.error('Error updating word level:', error);
    res.status(500).json({ error: 'Failed to update word level' });
  }
});

// Get word stats
app.get('/api/stats/words', async (req, res) => {
  try {
    const stats = await wordRepository.getWordStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching word stats:', error);
    res.status(500).json({ error: 'Failed to fetch word stats' });
  }
});

// Get combined stats
app.get('/api/stats', async (req, res) => {
  try {
    const kanjiStats = await kanjiRepository.getKanjiStats();
    const wordStats = await wordRepository.getWordStats();
    
    res.json({
      kanji: kanjiStats,
      words: wordStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});