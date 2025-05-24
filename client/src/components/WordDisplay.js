import React from "react";

import KanjiDisplay from "./KanjiDisplay";

const WordDisplay = ({ word }) => {
  return (
    <div className="word-character-display">
      {word.split("").map((char) => (
        <KanjiDisplay character={char} key={char} />
      ))}
    </div>
  );
};

export default WordDisplay;