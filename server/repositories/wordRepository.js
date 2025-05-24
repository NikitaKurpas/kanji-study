const { db } = require('../db');

// Get all words with their levels
const getAllWords = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM words ORDER BY word', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Get a single word by ID
const getWordById = (wordId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM words WHERE id = ?', [wordId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

// Get words for review based on limit
const getWordsForReview = (limit, mode) => {
  return new Promise((resolve, reject) => {
    // We prioritize words with lower levels and those that haven't been reviewed recently
    // We use a weighted random selection influenced by the level
    const query = `
      SELECT * FROM words
      ORDER BY 
        (level * 2) - 
        (CASE 
          WHEN last_reviewed IS NULL THEN 1
          ELSE (julianday('now') - julianday(last_reviewed)) * 0.5
        END) ASC,
        RANDOM()
      LIMIT ?
    `;
    
    db.all(query, [limit], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Add a new word
const addWord = (word, reading, meaning) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO words (word, reading, meaning, level, review_count) VALUES (?, ?, ?, 0, 0)',
      [word, reading, meaning],
      function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, word, reading, meaning, level: 0, review_count: 0 });
      }
    );
  });
};

// Update an existing word
const updateWord = (wordId, word, reading, meaning) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE words SET word = ?, reading = ?, meaning = ? WHERE id = ?',
      [word, reading, meaning, wordId],
      function(err) {
        if (err) return reject(err);
        
        // If successful, return the updated word
        if (this.changes > 0) {
          resolve({ id: wordId, word, reading, meaning });
        } else {
          reject(new Error('Word not found or no changes made'));
        }
      }
    );
  });
};

// Update word level after review
const updateWordLevel = (wordId, correct) => {
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION', () => {
      // Update the word level
      const levelUpdate = correct 
        ? 'UPDATE words SET level = MIN(level + 1, 5), last_reviewed = CURRENT_TIMESTAMP, review_count = review_count + 1 WHERE id = ?'
        : 'UPDATE words SET level = 0, last_reviewed = CURRENT_TIMESTAMP, review_count = review_count + 1 WHERE id = ?';
      
      db.run(levelUpdate, [wordId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return reject(err);
        }
        
        // Add to review history
        db.run(
          'INSERT INTO review_history (item_type, item_id, result) VALUES (?, ?, ?)',
          ['word', wordId, correct ? 1 : 0],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            
            db.run('COMMIT');
            resolve({ id: wordId, correct });
          }
        );
      });
    });
  });
};

// Get statistics for word reviews
const getWordStats = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) as total_words,
        SUM(CASE WHEN level = 0 THEN 1 ELSE 0 END) as level_0,
        SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) as level_1,
        SUM(CASE WHEN level = 2 THEN 1 ELSE 0 END) as level_2,
        SUM(CASE WHEN level = 3 THEN 1 ELSE 0 END) as level_3,
        SUM(CASE WHEN level = 4 THEN 1 ELSE 0 END) as level_4,
        SUM(CASE WHEN level = 5 THEN 1 ELSE 0 END) as level_5,
        COUNT(DISTINCT CASE WHEN last_reviewed IS NOT NULL THEN id END) as studied_words,
        (SELECT COUNT(*) FROM review_history WHERE item_type = 'word') as total_reviews,
        (SELECT COUNT(*) FROM review_history WHERE item_type = 'word' AND result = 1) as correct_reviews
      FROM words
    `;
    
    db.get(query, (err, row) => {
      if (err) return reject(err);
      
      // Calculate accuracy percentage
      const accuracy = row.total_reviews > 0 
        ? Math.round((row.correct_reviews / row.total_reviews) * 100) 
        : 0;
      
      resolve({
        ...row,
        accuracy
      });
    });
  });
};

module.exports = {
  getAllWords,
  getWordById,
  getWordsForReview,
  addWord,
  updateWord,
  updateWordLevel,
  getWordStats
};