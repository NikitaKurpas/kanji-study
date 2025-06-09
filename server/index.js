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

// Toggle kanji enabled status
app.post('/api/kanji/:id/toggle-enabled', async (req, res) => {
  try {
    const kanjiId = parseInt(req.params.id);
    if (isNaN(kanjiId)) {
      return res.status(400).json({ error: 'Invalid kanji ID' });
    }
    
    const result = await kanjiRepository.toggleKanjiEnabled(kanjiId);
    res.json(result);
  } catch (error) {
    console.error('Error toggling kanji enabled status:', error);
    res.status(500).json({ error: 'Failed to toggle kanji enabled status' });
  }
});

// Bulk enable/disable kanji
app.post('/api/kanji/bulk-set-enabled', async (req, res) => {
  try {
    const { kanjiIds, enabled } = req.body;
    
    if (!Array.isArray(kanjiIds) || enabled === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await kanjiRepository.bulkSetKanjiEnabled(kanjiIds, enabled);
    res.json(result);
  } catch (error) {
    console.error('Error bulk setting kanji enabled status:', error);
    res.status(500).json({ error: 'Failed to bulk set kanji enabled status' });
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

// Get a single word by ID
app.get('/api/words/:id', async (req, res) => {
  try {
    const wordId = parseInt(req.params.id);
    if (isNaN(wordId)) {
      return res.status(400).json({ error: 'Invalid word ID' });
    }

    const word = await wordRepository.getWordById(wordId);
    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }
    
    res.json(word);
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ error: 'Failed to fetch word' });
  }
});

// Add a new word
app.post('/api/words', async (req, res) => {
  try {
    const { word, reading, meaning } = req.body;
    
    if (!word || !reading || !meaning) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await wordRepository.addWord(word, reading, meaning);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding word:', error);
    res.status(500).json({ error: 'Failed to add word' });
  }
});

// Update an existing word
app.put('/api/words/:id', async (req, res) => {
  try {
    const wordId = parseInt(req.params.id);
    const { word, reading, meaning } = req.body;
    
    if (isNaN(wordId) || !word || !reading || !meaning) {
      return res.status(400).json({ error: 'Missing or invalid parameters' });
    }
    
    const result = await wordRepository.updateWord(wordId, word, reading, meaning);
    res.json(result);
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({ error: error.message || 'Failed to update word' });
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

// Toggle word enabled status
app.post('/api/words/:id/toggle-enabled', async (req, res) => {
  try {
    const wordId = parseInt(req.params.id);
    if (isNaN(wordId)) {
      return res.status(400).json({ error: 'Invalid word ID' });
    }
    
    const result = await wordRepository.toggleWordEnabled(wordId);
    res.json(result);
  } catch (error) {
    console.error('Error toggling word enabled status:', error);
    res.status(500).json({ error: 'Failed to toggle word enabled status' });
  }
});

// Bulk enable/disable words
app.post('/api/words/bulk-set-enabled', async (req, res) => {
  try {
    const { wordIds, enabled } = req.body;
    
    if (!Array.isArray(wordIds) || enabled === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const result = await wordRepository.bulkSetWordsEnabled(wordIds, enabled);
    res.json(result);
  } catch (error) {
    console.error('Error bulk setting words enabled status:', error);
    res.status(500).json({ error: 'Failed to bulk set words enabled status' });
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