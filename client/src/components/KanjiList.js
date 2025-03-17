import React, { useState, useEffect } from 'react';

const KanjiList = () => {
  const [kanjiList, setKanjiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedGrades, setSelectedGrades] = useState([1, 2, 3, 4, 5]);
  
  useEffect(() => {
    const fetchKanji = async () => {
      try {
        const response = await fetch('/api/kanji');
        
        if (!response.ok) {
          throw new Error('Failed to fetch kanji list');
        }
        
        const data = await response.json();
        setKanjiList(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchKanji();
  }, []);
  
  const handleGradeChange = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };
  
  const filterKanji = () => {
    let filtered = kanjiList;
    
    // Filter by grade
    if (selectedGrades.length > 0 && selectedGrades.length < 5) {
      filtered = filtered.filter(kanji => selectedGrades.includes(kanji.grade));
    }
    
    // Filter by level
    if (filter === 'unlearned') {
      filtered = filtered.filter(kanji => kanji.level === 0);
    } else if (filter === 'learning') {
      filtered = filtered.filter(kanji => kanji.level > 0 && kanji.level < 5);
    } else if (filter === 'mastered') {
      filtered = filtered.filter(kanji => kanji.level === 5);
    }
    
    return filtered;
  };
  
  if (loading) {
    return <div className="loading">Loading kanji list...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  const filteredKanji = filterKanji();
  
  return (
    <div>
      <div className="card">
        <h2>Kanji List</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginRight: '1rem', flex: 1 }}>
              <label htmlFor="filter">Filter by Level:</label>
              <select 
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="unlearned">Unlearned (Level 0)</option>
                <option value="learning">Learning (Level 1-4)</option>
                <option value="mastered">Mastered (Level 5)</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Filter by Grade:</label>
            <div className="grade-selector">
              {[1, 2, 3, 4, 5].map(grade => (
                <div key={grade} className="grade-checkbox">
                  <input
                    type="checkbox"
                    id={`list-grade-${grade}`}
                    checked={selectedGrades.includes(grade)}
                    onChange={() => handleGradeChange(grade)}
                  />
                  <label htmlFor={`list-grade-${grade}`}>Grade {grade}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <p>Showing {filteredKanji.length} kanji</p>
          
          <div className="kanji-grid">
            {filteredKanji.map(kanji => (
              <div key={kanji.id} className="kanji-item">
                <div className="character">{kanji.character}</div>
                <div className="meaning">{kanji.meaning}</div>
                <div className="grade">Grade {kanji.grade}</div>
                <div className="level-indicator">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`level-dot ${i < kanji.level ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanjiList;