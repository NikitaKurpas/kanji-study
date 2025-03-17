import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KanjiDisplay from './KanjiDisplay';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || { results: [] };
  
  // Calculate statistics
  const totalKanji = results.length;
  const correctAnswers = results.filter(item => item.correct).length;
  const accuracy = totalKanji > 0 ? Math.round((correctAnswers / totalKanji) * 100) : 0;
  
  // Group results by correct/incorrect
  const incorrectResults = results.filter(item => !item.correct);
  
  return (
    <div>
      <div className="card">
        <h2>Quiz Results</h2>
        
        <div className="result-summary">
          <h3>Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{totalKanji}</div>
              <div className="stat-label">Total Kanji</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">{correctAnswers}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
        </div>
        
        {incorrectResults.length > 0 && (
          <div>
            <h3>Incorrect Answers</h3>
            <p>These kanji have been reset to level 0 and will appear more frequently in future quizzes:</p>
            
            <div className="result-list">
              {incorrectResults.map((item, index) => (
                <div key={index} className="result-item incorrect">
                  <KanjiDisplay character={item.character} />
                  <div className="result-details">
                    <div><strong>Meaning:</strong> {item.meaning}</div>
                    <div><strong>Grade:</strong> {item.grade}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/study')}>New Quiz</button>
          <button className="secondary" onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    </div>
  );
};

export default Results;