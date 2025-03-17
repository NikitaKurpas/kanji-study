const fs = require("fs");
const path = require("path");
const { db } = require("./db");

// Function to parse kanji.md file
function parseKanjiMdFile() {
  const filePath = path.join(__dirname, "kanji.md");
  const content = fs.readFileSync(filePath, "utf8");

  // Regular expressions to match grade sections and kanji characters
  const gradeRegex = /## (\w+) grade\s+([^\n#]+)/g;
  const result = {};

  let match;
  while ((match = gradeRegex.exec(content)) !== null) {
    const gradeName = match[1].toLowerCase();
    const gradeNumber = getGradeNumber(gradeName);

    if (gradeNumber) {
      // Extract all kanji characters from the section
      const kanjiText = match[2].trim();
      const kanjiList = kanjiText.split(" ").filter((k) => k.trim());

      result[gradeNumber] = kanjiList;
    }
  }

  return result;
}

// Convert grade name to number
function getGradeNumber(gradeName) {
  const gradeMap = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
  };

  return gradeMap[gradeName];
}

// Get all kanji from database
function getKanjiFromDatabase() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT character, grade FROM kanji ORDER BY grade, character",
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

// Main verification function
async function verifyKanji() {
  try {
    // Parse kanji from markdown file
    const kanjiByGrade = parseKanjiMdFile();
    console.log(
      `Parsed ${
        Object.values(kanjiByGrade).flat().length
      } kanji from markdown file`
    );

    // Get kanji from database
    const dbKanji = await getKanjiFromDatabase();
    console.log(`Found ${dbKanji.length} kanji in database`);

    // Create lookup map for database kanji
    const dbKanjiMap = {};
    dbKanji.forEach((k) => {
      dbKanjiMap[k.character] = k.grade;
    });

    // Check for missing kanji
    const missingKanji = [];
    const incorrectGradeKanji = [];

    Object.entries(kanjiByGrade).forEach(([grade, kanjiList]) => {
      const gradeNum = parseInt(grade, 10);

      kanjiList.forEach((kanji) => {
        if (!dbKanjiMap.hasOwnProperty(kanji)) {
          missingKanji.push({ kanji, grade: gradeNum });
        } else if (dbKanjiMap[kanji] !== gradeNum) {
          incorrectGradeKanji.push({
            kanji,
            expectedGrade: gradeNum,
            actualGrade: dbKanjiMap[kanji],
          });
        }
      });
    });

    // Check for extra kanji in database
    const mdKanjiSet = new Set(Object.values(kanjiByGrade).flat());
    const extraKanji = dbKanji.filter((k) => !mdKanjiSet.has(k.character));

    // Print results
    console.log("\n=== Verification Results ===");

    if (missingKanji.length === 0 && incorrectGradeKanji.length === 0) {
      console.log(
        "✅ All kanji from markdown file are present in the database with correct grades!"
      );
    } else {
      if (missingKanji.length > 0) {
        console.log(`❌ Missing ${missingKanji.length} kanji in database:`);
        missingKanji.forEach((k) => {
          console.log(`   - ${k.kanji} (Grade ${k.grade})`);
        });
      }

      if (incorrectGradeKanji.length > 0) {
        console.log(
          `❌ ${incorrectGradeKanji.length} kanji with incorrect grade:`
        );
        incorrectGradeKanji.forEach((k) => {
          console.log(
            `   - ${k.kanji}: Expected Grade ${k.expectedGrade}, Found Grade ${k.actualGrade}`
          );
        });
      }
    }

    if (extraKanji.length > 0) {
      console.log(
        `\nℹ️ Found ${extraKanji.length} extra kanji in database that are not in markdown file.`
      );
      if (extraKanji.length < 20) {
        extraKanji.forEach((k) => {
          console.log(`   - ${k.character} (Grade ${k.grade})`);
        });
      }
    }
  } catch (error) {
    console.error("Error during verification:", error);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Run the verification
verifyKanji();
