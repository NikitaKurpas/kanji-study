import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import KanjiDisplay from "./KanjiDisplay";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studyType = "kanji", results } = location.state || {
    studyType: "kanji",
    results: [],
  };

  // Calculate statistics
  const totalItems = results.length;
  const correctAnswers = results.filter((item) => item.correct).length;
  const accuracy =
    totalItems > 0 ? Math.round((correctAnswers / totalItems) * 100) : 0;

  // Group results by correct/incorrect
  const incorrectResults = results.filter((item) => !item.correct);

  return (
    <div>
      <div className="card">
        <h2>Quiz Results</h2>

        <div className="result-summary">
          <h3>Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{totalItems}</div>
              <div className="stat-label">
                Total {studyType === "kanji" ? "Kanji" : "Words"}
              </div>
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
            <p>
              These {studyType === "kanji" ? "kanji" : "words"} have been reset
              to level 0 and will appear more frequently in future quizzes:
            </p>

            {studyType === "kanji" ? (
              <IncorrectKanjiItems items={incorrectResults} />
            ) : (
              <IncorrectWordItems items={incorrectResults} />
            )}
          </div>
        )}

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <button onClick={() => navigate("/study")}>New Quiz</button>
          <button className="secondary" onClick={() => navigate("/")}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;

const IncorrectKanjiItems = ({ items }) => {
  return (
    <div className="result-list">
      {items.map((item, index) => (
        <div key={index} className="result-item incorrect">
          <KanjiDisplay character={item.character} />
          <div className="result-details">
            <div>
              <strong>Meaning:</strong> {item.meaning}
            </div>
            {item.grade !== undefined && (
              <div>
                <strong>Grade:</strong>{" "}
                {item.grade === 0 ? "Kana" : `Grade ${item.grade}`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const IncorrectWordItems = ({ items }) => {
  return (
    <div className="result-list">
      {items.map((item, index) => (
        <div key={index} className="result-item incorrect">
          <div className="word-display">{item.word}</div>
          <div className="result-details">
            <div>
              <strong>Reading:</strong> {item.reading}
            </div>
            <div>
              <strong>Meaning:</strong> {item.meaning}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
