import React, { useState, useEffect } from "react";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading stats...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div>
      <KanjiStats stats={stats.kanji} />
      <WordStats stats={stats.words} />
    </div>
  );
};

export default Stats;

const KanjiStats = ({ stats }) => {
  return (
    <>
      <div className="card stats-card">
        <h2>Kanji Progress</h2>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.total_kanji_only}</div>
            <div className="stat-label">Total Kanji</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.total_kana}</div>
            <div className="stat-label">Total Kana</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.studied_kanji}</div>
            <div className="stat-label">Kanji Studied</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.studied_kana}</div>
            <div className="stat-label">Kana Studied</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.total_reviews}</div>
            <div className="stat-label">Total Reviews</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.accuracy}%</div>
            <div className="stat-label">Overall Accuracy</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Kana/Kanji by Level</h2>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.level_0}</div>
            <div className="stat-label">Level 0</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_1}</div>
            <div className="stat-label">Level 1</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_2}</div>
            <div className="stat-label">Level 2</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_3}</div>
            <div className="stat-label">Level 3</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_4}</div>
            <div className="stat-label">Level 4</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_5}</div>
            <div className="stat-label">Level 5 (Mastered)</div>
          </div>
        </div>
      </div>
    </>
  );
};

const WordStats = ({ stats }) => {
  return (
    <>
      <div className="card stats-card">
        <h2>Words Progress</h2>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.total_words}</div>
            <div className="stat-label">Total Words</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.studied_words}</div>
            <div className="stat-label">Words Studied</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.total_reviews}</div>
            <div className="stat-label">Total Reviews</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.accuracy}%</div>
            <div className="stat-label">Overall Accuracy</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Words by Level</h2>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.level_0}</div>
            <div className="stat-label">Level 0</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_1}</div>
            <div className="stat-label">Level 1</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_2}</div>
            <div className="stat-label">Level 2</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_3}</div>
            <div className="stat-label">Level 3</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_4}</div>
            <div className="stat-label">Level 4</div>
          </div>

          <div className="stat-item">
            <div className="stat-value">{stats.level_5}</div>
            <div className="stat-label">Level 5 (Mastered)</div>
          </div>
        </div>
      </div>
    </>
  );
};
