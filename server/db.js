const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { parseKanjiData } = require('./kanji-data');

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
        review_count INTEGER DEFAULT 0
      )
    `);

    // Create words table (for future expansion)
    db.run(`
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY,
        word TEXT NOT NULL UNIQUE,
        reading TEXT NOT NULL,
        meaning TEXT NOT NULL,
        level INTEGER DEFAULT 0,
        last_reviewed TIMESTAMP,
        review_count INTEGER DEFAULT 0
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

// Initialize DB with sample data
const initialize = () => {
  initDB();
  insertSampleData();
};

module.exports = {
  db,
  initialize
};
