import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Study = () => {
  const navigate = useNavigate();
  const [selectedGrades, setSelectedGrades] = useState([1, 2]);
  const [limit, setLimit] = useState(10);
  const [mode, setMode] = useState('meaning-to-kanji');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGradeChange = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const handleStartStudy = async () => {
    if (selectedGrades.length === 0) {
      setError('Please select at least one grade level.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Navigate to quiz page with selected parameters
      navigate(`/quiz`, { 
        state: { 
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

  return (
    <div>
      <div className="card">
        <h2>Study Settings</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label>Select Study Content:</label>
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
        
        <div className="form-group">
          <label htmlFor="limit">Number of Kanji to Study:</label>
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
          <select
            id="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="meaning-to-kanji">Meaning to Kanji</option>
            <option value="kanji-to-meaning">Kanji to Meaning</option>
          </select>
        </div>
        
        <button onClick={handleStartStudy} disabled={loading}>
          {loading ? 'Loading...' : 'Start Studying'}
        </button>
      </div>
    </div>
  );
};

export default Study;