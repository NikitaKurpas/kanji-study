const { db } = require('../db');

// Get all kanji with their levels
const getAllKanji = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM kanji ORDER BY grade, character', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Get kanji by grades
const getKanjiByGrades = (grades) => {
  return new Promise((resolve, reject) => {
    const placeholders = grades.map(() => '?').join(',');
    const query = `SELECT * FROM kanji WHERE grade IN (${placeholders}) ORDER BY grade, character`;
    
    db.all(query, grades, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Get kanji for review based on grades and limit
const getKanjiForReview = (grades, limit, mode) => {
  return new Promise((resolve, reject) => {
    const placeholders = grades.map(() => '?').join(',');

    // We prioritize kanji with lower levels and those that haven't been reviewed recently
    // We use a weighted random selection influenced by the level
    // Only include enabled kanji for review
    const query = `
      SELECT * FROM kanji
      WHERE grade IN (${placeholders}) AND enabled = 1
      ORDER BY 
        (level * 2) - 
        (CASE 
          WHEN last_reviewed IS NULL THEN 1
          ELSE (julianday('now') - julianday(last_reviewed)) * 0.5
        END) ASC,
        RANDOM()
      LIMIT ?
    `;
    
    db.all(query, [...grades, limit], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Update kanji level after review
const updateKanjiLevel = (kanjiId, correct) => {
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION', () => {
      // Update the kanji level
      const levelUpdate = correct 
        ? 'UPDATE kanji SET level = MIN(level + 1, 5), last_reviewed = CURRENT_TIMESTAMP, review_count = review_count + 1 WHERE id = ?'
        : 'UPDATE kanji SET level = 0, last_reviewed = CURRENT_TIMESTAMP, review_count = review_count + 1 WHERE id = ?';
      
      db.run(levelUpdate, [kanjiId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return reject(err);
        }
        
        // Add to review history
        db.run(
          'INSERT INTO review_history (item_type, item_id, result) VALUES (?, ?, ?)',
          ['kanji', kanjiId, correct ? 1 : 0],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            
            db.run('COMMIT');
            resolve({ id: kanjiId, correct });
          }
        );
      });
    });
  });
};

// Get statistics for kanji reviews
const getKanjiStats = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) as total_kanji,
        SUM(CASE WHEN grade = 0 THEN 1 ELSE 0 END) as total_kana,
        SUM(CASE WHEN grade > 0 THEN 1 ELSE 0 END) as total_kanji_only,
        SUM(CASE WHEN level = 0 THEN 1 ELSE 0 END) as level_0,
        SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) as level_1,
        SUM(CASE WHEN level = 2 THEN 1 ELSE 0 END) as level_2,
        SUM(CASE WHEN level = 3 THEN 1 ELSE 0 END) as level_3,
        SUM(CASE WHEN level = 4 THEN 1 ELSE 0 END) as level_4,
        SUM(CASE WHEN level = 5 THEN 1 ELSE 0 END) as level_5,
        COUNT(DISTINCT CASE WHEN last_reviewed IS NOT NULL AND grade = 0 THEN id END) as studied_kana,
        COUNT(DISTINCT CASE WHEN last_reviewed IS NOT NULL AND grade > 0 THEN id END) as studied_kanji,
        COUNT(DISTINCT CASE WHEN last_reviewed IS NOT NULL THEN id END) as studied_total,
        (SELECT COUNT(*) FROM review_history WHERE item_type = 'kanji') as total_reviews,
        (SELECT COUNT(*) FROM review_history WHERE item_type = 'kanji' AND result = 1) as correct_reviews
      FROM kanji
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

// Toggle kanji enabled status
const toggleKanjiEnabled = (kanjiId) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE kanji SET enabled = 1 - enabled WHERE id = ?',
      [kanjiId],
      function(err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error('Kanji not found'));
        
        // Get the updated kanji to return the new enabled status
        db.get('SELECT * FROM kanji WHERE id = ?', [kanjiId], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      }
    );
  });
};

// Bulk enable/disable kanji based on IDs
const bulkSetKanjiEnabled = (kanjiIds, enabled) => {
  return new Promise((resolve, reject) => {
    const placeholders = kanjiIds.map(() => '?').join(',');
    const query = `UPDATE kanji SET enabled = ? WHERE id IN (${placeholders})`;
    
    db.run(query, [enabled ? 1 : 0, ...kanjiIds], function(err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
};

module.exports = {
  getAllKanji,
  getKanjiByGrades,
  getKanjiForReview,
  updateKanjiLevel,
  getKanjiStats,
  toggleKanjiEnabled,
  bulkSetKanjiEnabled
};
