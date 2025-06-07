import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Study = () => {
  const navigate = useNavigate();
  const [selectedGrades, setSelectedGrades] = useState([0, 1, 2]);
  const [limit, setLimit] = useState(20);
  const [mode, setMode] = useState('meaning-to-kanji');
  const [studyType, setStudyType] = useState('kanji');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studyType === 'kanji') {
      setSelectedGrades([0, 1, 2]);
      setLimit(20);
      setMode('meaning-to-kanji');
    } else if (studyType === 'words') {
      setSelectedGrades([]);
      setLimit(10);
      setMode('meaning-to-word');
    }
  }, [studyType])

  const handleGradeChange = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const handleStartStudy = async () => {
    if (studyType === 'kanji' && selectedGrades.length === 0) {
      setError('Please select at least one grade level.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Navigate to quiz page with selected parameters
      navigate(`/quiz`, { 
        state: { 
          studyType,
          grades: selectedGrades, 
          limit: limit, 
          mode: mode 
        } 
      });
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const getStudyModes = () => {
    if (studyType === 'kanji') {
      return (
        <select
          id="mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="meaning-to-kanji">Meaning to Kanji</option>
          <option value="kanji-to-meaning">Kanji to Meaning</option>
        </select>
      );
    } else if (studyType === 'words') {
      return (
        <select
          id="mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="reading-to-word">Reading to Word</option>
          <option value="word-to-reading">Word to Reading</option>
          <option value="meaning-to-word">Meaning to Word</option>
          <option value="word-to-meaning">Word to Meaning</option>
        </select>
      );
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Study Settings</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="studyType">What would you like to study?</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                id="study-kanji"
                name="study-type"
                value="kanji"
                checked={studyType === 'kanji'}
                onChange={() => setStudyType('kanji')}
              />
              <label htmlFor="study-kanji">Kanji</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                id="study-words"
                name="study-type"
                value="words"
                checked={studyType === 'words'}
                onChange={() => setStudyType('words')}
              />
              <label htmlFor="study-words">Words</label>
            </div>
          </div>
        </div>
        
        {studyType === 'kanji' && (
          <div className="form-group">
            <label>Select Kanji Grades:</label>
            <div className="grade-selector">
              <div className="grade-checkbox">
                <input
                  type="checkbox"
                  id="grade-0"
                  checked={selectedGrades.includes(0)}
                  onChange={() => handleGradeChange(0)}
                />
                <label htmlFor="grade-0">Kana</label>
              </div>
              {[1, 2, 3, 4, 5].map(grade => (
                <div key={grade} className="grade-checkbox">
                  <input
                    type="checkbox"
                    id={`grade-${grade}`}
                    checked={selectedGrades.includes(grade)}
                    onChange={() => handleGradeChange(grade)}
                  />
                  <label htmlFor={`grade-${grade}`}>Grade {grade}</label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="limit">Number of Items to Study:</label>
          <input
            type="number"
            id="limit"
            min="1"
            max="50"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="mode">Study Mode:</label>
          {getStudyModes()}
        </div>
        
        <button onClick={handleStartStudy} disabled={loading}>
          {loading ? 'Loading...' : 'Start Studying'}
        </button>
      </div>
    </div>
  );
};

export default Study;