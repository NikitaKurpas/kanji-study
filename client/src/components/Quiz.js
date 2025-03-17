import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { grades, limit, mode } = location.state || {
    grades: [1],
    limit: 10,
    mode: "meaning-to-kanji",
  };

  const [kanjiList, setKanjiList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const fetchKanji = async () => {
      try {
        const response = await fetch(
          `/api/kanji/review?grades=${grades.join(
            ","
          )}&limit=${limit}&mode=${mode}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch kanji for review");
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
  }, [grades, limit, mode]);

  const handleAnswer = async (correct) => {
    const currentKanji = kanjiList[currentIndex];

    try {
      // Send the result to the API
      const response = await fetch("/api/kanji/update-level", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kanjiId: currentKanji.id,
          correct,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update kanji level");
      }

      // Add to results
      setQuizResults([...quizResults, { ...currentKanji, correct }]);

      // Move to next kanji or finish quiz
      if (currentIndex < kanjiList.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setRevealed(false); // Reset revealed state for next kanji
      } else {
        // Quiz completed, navigate to results
        navigate("/results", {
          state: { results: [...quizResults, { ...currentKanji, correct }] },
        });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  if (loading) {
    return <div className="loading">Loading kanji...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (kanjiList.length === 0) {
    return (
      <div className="card">
        <h2>No Kanji Available</h2>
        <p>
          There are no kanji available for the selected criteria. Please try
          with different grade levels.
        </p>
        <button onClick={() => navigate("/study")}>
          Back to Study Settings
        </button>
      </div>
    );
  }

  const currentKanji = kanjiList[currentIndex];

  return (
    <div>
      <div className="card">
        <h2>
          Quiz {currentIndex + 1} of {kanjiList.length}
        </h2>

        <div className="kanji-card">
          {mode === "meaning-to-kanji" ? (
            <>
              <div className="kanji-meaning">{currentKanji.meaning}</div>
              {revealed ? (
                <div className="kanji-character">{currentKanji.character}</div>
              ) : null}
            </>
          ) : (
            <>
              <div className="kanji-character">{currentKanji.character}</div>
              {revealed ? (
                <div className="kanji-meaning">{currentKanji.meaning}</div>
              ) : null}
            </>
          )}

          {!revealed && (
            <button className="reveal" onClick={handleReveal}>
              Reveal {mode === "meaning-to-kanji" ? "Kanji" : "Meaning"}
            </button>
          )}

          <div className="quiz-controls">
            <button className="incorrect" onClick={() => handleAnswer(false)}>
              Incorrect
            </button>
            <button className="correct" onClick={() => handleAnswer(true)}>
              Correct
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
