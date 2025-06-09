const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { parseKanjiData } = require('./kanji-data');
const { parseWordData } = require('./word-data');

const db = new sqlite3.Database(path.join(__dirname, 'kanji.db'));

// Initialize database
const initDB = () => {
  db.serialize(() => {
    // Create kanji table
    db.run(`
      CREATE TABLE IF NOT EXISTS kanji (
        id INTEGER PRIMARY KEY,
        character TEXT NOT NULL UNIQUE,
        meaning TEXT NOT NULL,
        grade INTEGER NOT NULL, -- The school grade the kanji is typically taught in
        level INTEGER DEFAULT 0,
        last_reviewed TIMESTAMP,
        review_count INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1 -- 1 for enabled, 0 for disabled
      )
    `);

    // Create words table
    db.run(`
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY,
        word TEXT NOT NULL UNIQUE,
        reading TEXT NOT NULL,
        meaning TEXT NOT NULL,
        level INTEGER DEFAULT 0,
        last_reviewed TIMESTAMP,
        review_count INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1 -- 1 for enabled, 0 for disabled
      )
    `);

    // Create word_kanji table (for future expansion)
    db.run(`
      CREATE TABLE IF NOT EXISTS word_kanji (
        word_id INTEGER,
        kanji_id INTEGER,
        FOREIGN KEY (word_id) REFERENCES words (id),
        FOREIGN KEY (kanji_id) REFERENCES kanji (id),
        PRIMARY KEY (word_id, kanji_id)
      )
    `);

    // Create review_history table
    db.run(`
      CREATE TABLE IF NOT EXISTS review_history (
        id INTEGER PRIMARY KEY,
        item_type TEXT NOT NULL,
        item_id INTEGER NOT NULL,
        result BOOLEAN NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add enabled column to existing tables if it doesn't exist
    db.all("PRAGMA table_info(kanji)", (err, columns) => {
      if (!err && !columns.find(col => col.name === 'enabled')) {
        db.run('ALTER TABLE kanji ADD COLUMN enabled INTEGER DEFAULT 1');
      }
    });

    db.all("PRAGMA table_info(words)", (err, columns) => {
      if (!err && !columns.find(col => col.name === 'enabled')) {
        db.run('ALTER TABLE words ADD COLUMN enabled INTEGER DEFAULT 1');
      }
    });
  });
};

// Insert or update kanji data
const insertSampleData = () => {
  // Returns an array of kanji in the format:
  // { character: <漢字>, meaning: <kanji meaning>, grade: <grade> }
  const allKanji = parseKanjiData();
  
  // Use a transaction for better performance
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // First insert all new kanji
    const insertKanji = db.prepare('INSERT OR IGNORE INTO kanji (character, meaning, grade) VALUES (?, ?, ?)');
    
    allKanji.forEach(kanji => {
      insertKanji.run([kanji.character, kanji.meaning, kanji.grade], (err) => {
        if (err) console.error('Error inserting kanji:', err, kanji);
      });
    });
    
    insertKanji.finalize();
    
    // Then update meanings for all kanji
    const updateKanji = db.prepare('UPDATE kanji SET meaning = ? WHERE character = ?');
    
    allKanji.forEach(kanji => {
      updateKanji.run([kanji.meaning, kanji.character], (err) => {
        if (err) console.error('Error updating kanji meaning:', err, kanji);
      });
    });
    
    updateKanji.finalize();
    
    db.run('COMMIT');
  });
};

// Insert or update word data
const insertWordData = () => {
  // Returns an array of words in the format:
  // { word: <言葉>, reading: <word reading>, meaning: <word meaning> }
  const allWords = parseWordData();

  // Use a transaction for better performance
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // First insert all new words
    const insertWord = db.prepare('INSERT OR IGNORE INTO words (word, reading, meaning) VALUES (?, ?, ?)');
    
    allWords.forEach(word => {
      // Handle reading array (some words have multiple readings)
      const reading = Array.isArray(word.reading) ? word.reading.join(', ') : word.reading;
      
      insertWord.run([word.word, reading, word.meaning], (err) => {
        if (err) console.error('Error inserting word:', err, word);
      });
    });
    
    insertWord.finalize();
    
    // Then update meanings for all words
    const updateWord = db.prepare('UPDATE words SET meaning = ?, reading = ? WHERE word = ?');
    
    allWords.forEach(word => {
      // Handle reading array (some words have multiple readings)
      const reading = Array.isArray(word.reading) ? word.reading.join(', ') : word.reading;
      
      updateWord.run([word.meaning, reading, word.word], (err) => {
        if (err) console.error('Error updating word:', err, word);
      });
    });
    
    updateWord.finalize();
    
    db.run('COMMIT');
  });
};

// Initialize DB with sample data
const initialize = () => {
  initDB();
  insertSampleData();
  insertWordData();
};

module.exports = {
  db,
  initialize
};
