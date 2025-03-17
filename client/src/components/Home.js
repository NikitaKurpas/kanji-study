import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
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
      <div className="card">
        <h2>Welcome to Kanji Study</h2>
        <p>
          This application helps you study Japanese kanji characters based on their elementary school grades.
          You can select which sets to study, how many kanji to review, and track your progress over time.
        </p>
        
        <div className="stats-grid" style={{ marginTop: '2rem' }}>
          <div className="stat-item">
            <div className="stat-value">{stats?.studied_kanji || 0}</div>
            <div className="stat-label">Kanji Studied</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{stats?.total_reviews || 0}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{stats?.accuracy || 0}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>Quick Start</h2>
        <p>Choose one of the following options:</p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/study">
            <button>Start Studying</button>
          </Link>
          
          <Link to="/kanji">
            <button className="secondary">Browse Kanji</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;