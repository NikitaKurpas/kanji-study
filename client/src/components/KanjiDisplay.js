import React, { useState } from "react";

// Helper function to convert kanji to its hex Unicode value padded to 5 chars
const kanjiToHex = (kanji) => {
  const codePoint = kanji.codePointAt(0).toString(16);
  return codePoint.padStart(5, "0");
};

// Component to display kanji with SVG fallback to system font
const KanjiDisplay = ({ character }) => {
  const [imgError, setImgError] = useState(false);
  const svgPath = `/kanji/${kanjiToHex(character)}.svg`;

  // TODO: display kana from https://github.com/zhengkyl/strokesvg

  return imgError ? (
    <div className="kanji-character system-font">{character}</div>
  ) : (
    <div className="kanji-character">
      <img
        src={svgPath}
        alt={character}
        onError={() => setImgError(true)}
        className="kanji-svg"
      />
    </div>
  );
};

export default KanjiDisplay;
