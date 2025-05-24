import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import KanjiDisplay from "./KanjiDisplay";

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studyType, grades, limit, mode } = location.state || {};

  // Validation logic
  const isValidState = validateParameters(studyType, grades, limit, mode);

  const [itemList, setItemList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!isValidState) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await fetchItems(studyType, grades, limit, mode);
        setItemList(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    })();
  }, [isValidState, studyType, grades, limit, mode]);

  const handleAnswer = async (correct) => {
    const currentItem = itemList[currentIndex];

    try {
      // Send the result to the API
      updateLevel(studyType, currentItem.id, correct);

      // Add to results
      setQuizResults([...quizResults, { ...currentItem, correct }]);

      // Move to next item or finish quiz
      if (currentIndex < itemList.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setRevealed(false); // Reset revealed state for next item
      } else {
        // Quiz completed, navigate to results
        navigate("/results", {
          state: {
            studyType,
            results: [...quizResults, { ...currentItem, correct }],
          },
        });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  if (!isValidState) {
    return (
      <div className="card">
        <h2>Invalid Quiz Settings</h2>
        <p>
          The quiz settings are invalid or missing. Please return to the study
          settings page and try again.
        </p>
        <button onClick={() => navigate("/study")}>
          Back to Study Settings
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading {studyType}...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (itemList.length === 0) {
    return (
      <div className="card">
        <h2>No {studyType === "kanji" ? "Kanji" : "Words"} Available</h2>
        <p>
          There are no {studyType} available for the selected criteria. Please
          try with different settings.
        </p>
        <button onClick={() => navigate("/study")}>
          Back to Study Settings
        </button>
      </div>
    );
  }

  const currentItem = itemList[currentIndex];

  return (
    <div>
      <div className="card">
        <h2>
          Quiz {currentIndex + 1} of {itemList.length}
        </h2>

        {studyType === "kanji" ? (
          <KanjiCard
            item={currentItem}
            mode={mode}
            revealed={revealed}
            onReveal={handleReveal}
          />
        ) : (
          <WordCard
            item={currentItem}
            mode={mode}
            revealed={revealed}
            onReveal={handleReveal}
          />
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
  );
};

export default Quiz;

const KanjiCard = ({ item, mode, revealed, onReveal: handleReveal }) => {
  return (
    <div className="kanji-card">
      {mode === "meaning-to-kanji" ? (
        <>
          <div className="kanji-meaning">{item.meaning}</div>
          {revealed && <KanjiDisplay character={item.character} />}
        </>
      ) : (
        <>
          <KanjiDisplay character={item.character} />
          {revealed ? (
            <div className="kanji-meaning">{item.meaning}</div>
          ) : null}
        </>
      )}

      {!revealed && (
        <button className="reveal" onClick={handleReveal}>
          Reveal {mode === "meaning-to-kanji" ? "Kanji" : "Meaning"}
        </button>
      )}
    </div>
  );
};

const WordCard = ({ item, mode, revealed, onReveal: handleReveal }) => {
  let questionContent, answerContent;

  if (mode === "reading-to-word") {
    questionContent = <div className="word-reading front">{item.reading}</div>;
    answerContent = (
      <div>
        <div className="word-text">{item.word}</div>
        <div className="word-meaning secondary">{item.meaning}</div>
      </div>
    );
  } else if (mode === "word-to-reading") {
    questionContent = <div className="word-text front">{item.word}</div>;
    answerContent = (
      <div>
        <div className="word-reading">{item.reading}</div>
        <div className="word-meaning secondary">{item.meaning}</div>
      </div>
    );
  } else if (mode === "meaning-to-word") {
    questionContent = <div className="word-meaning front">{item.meaning}</div>;
    answerContent = (
      <div>
        <div className="word-text">{item.word}</div>
        <div className="word-reading secondary">{item.reading}</div>
      </div>
    );
  } else if (mode === "word-to-meaning") {
    questionContent = <div className="word-text front">{item.word}</div>;
    answerContent = (
      <div>
        <div className="word-meaning">{item.meaning}</div>
        <div className="word-reading secondary">{item.reading}</div>
      </div>
    );
  }

  return (
    <div className="word-card">
      {questionContent}
      {revealed && answerContent}

      {!revealed && (
        <button className="reveal" onClick={handleReveal}>
          Reveal Answer
        </button>
      )}
    </div>
  );
};

const validateParameters = (studyType, grades, limit, mode) => {
  const validStudyTypes = ["kanji", "words"];
  const validKanjiModes = ["kanji-to-meaning", "meaning-to-kanji"];
  const validWordModes = [
    "reading-to-word",
    "word-to-reading",
    "meaning-to-word",
    "word-to-meaning",
  ];

  const isValidStudyType = validStudyTypes.includes(studyType);
  const isValidMode =
    studyType === "kanji"
      ? validKanjiModes.includes(mode)
      : validWordModes.includes(mode);
  const isValidGrades =
    Array.isArray(grades) &&
    grades.length > 0 &&
    grades.every((g) => Number.isInteger(g) && g > 0);
  const isValidLimit = Number.isInteger(limit) && limit > 0;

  const isValidState =
    isValidStudyType &&
    isValidMode &&
    (studyType === "kanji" ? isValidGrades : true) &&
    isValidLimit;

  return isValidState;
};

const fetchItems = async (studyType, grades, limit, mode) => {
  let response;

  if (studyType === "kanji") {
    // prettier-ignore
    response = await fetch(`/api/kanji/review?grades=${grades.join(",")}&limit=${limit}&mode=${mode}`
      );
  } else if (studyType === "words") {
    // prettier-ignore
    response = await fetch(`/api/words/review?limit=${limit}&mode=${mode}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${studyType} for review`);
  }

  const data = await response.json();

  console.info(`Fetched ${data.length} ${studyType} items for review`);

  return data;
};

const updateLevel = async (studyType, currentItemId, correct) => {
  const endpoint =
    studyType === "kanji"
      ? "/api/kanji/update-level"
      : "/api/words/update-level";

  const idField = studyType === "kanji" ? "kanjiId" : "wordId";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      [idField]: currentItemId,
      correct,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${studyType} level`);
  }
};
