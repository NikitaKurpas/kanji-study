import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const WordList = () => {
  const [wordList, setWordList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toggleLoading, setToggleLoading] = useState(new Set());
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch('/api/words');
        
        if (!response.ok) {
          throw new Error('Failed to fetch word list');
        }
        
        const data = await response.json();
        setWordList(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchWords();
  }, []);
  
  const filterWords = () => {
    let filtered = wordList;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(term) || 
        word.reading.toLowerCase().includes(term) || 
        word.meaning.toLowerCase().includes(term)
      );
    }
    
    // Filter by level
    if (filter === 'unlearned') {
      filtered = filtered.filter(word => word.level === 0);
    } else if (filter === 'learning') {
      filtered = filtered.filter(word => word.level > 0 && word.level < 5);
    } else if (filter === 'mastered') {
      filtered = filtered.filter(word => word.level === 5);
    }
    
    // Filter by review history
    if (reviewFilter === 'never') {
      filtered = filtered.filter(word => word.last_reviewed === null);
    } else if (reviewFilter === 'last24h') {
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      filtered = filtered.filter(word => {
        if (!word.last_reviewed) return false;
        const reviewDate = new Date(word.last_reviewed);
        return reviewDate >= oneDayAgo;
      });
    } else if (reviewFilter === 'day-to-week') {
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(word => {
        if (!word.last_reviewed) return false;
        const reviewDate = new Date(word.last_reviewed);
        return reviewDate < oneDayAgo && reviewDate >= oneWeekAgo;
      });
    } else if (reviewFilter === 'week-to-month') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      filtered = filtered.filter(word => {
        if (!word.last_reviewed) return false;
        const reviewDate = new Date(word.last_reviewed);
        return reviewDate < oneWeekAgo && reviewDate >= oneMonthAgo;
      });
    } else if (reviewFilter === 'older') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      filtered = filtered.filter(word => {
        if (!word.last_reviewed) return false;
        const reviewDate = new Date(word.last_reviewed);
        return reviewDate < oneMonthAgo;
      });
    }
    
    return filtered;
  };
  
  const handleEditWord = (wordId) => {
    navigate(`/words/edit/${wordId}`);
  };

  const toggleWordEnabled = async (wordId, event) => {
    event.stopPropagation(); // Prevent navigation to edit page
    setToggleLoading(prev => new Set(prev).add(wordId));
    
    try {
      const response = await fetch(`/api/words/${wordId}/toggle-enabled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle word status');
      }
      
      const updatedWord = await response.json();
      
      // Update the word list with the new enabled status
      setWordList(prev => prev.map(word => 
        word.id === wordId ? updatedWord : word
      ));
    } catch (error) {
      console.error('Error toggling word status:', error);
      setError(error.message);
    } finally {
      setToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordId);
        return newSet;
      });
    }
  };

  const bulkSetEnabled = async (enabled) => {
    const filteredIds = filterWords().map(word => word.id);
    
    try {
      const response = await fetch('/api/words/bulk-set-enabled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordIds: filteredIds,
          enabled: enabled
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to bulk update word status');
      }
      
      // Update the word list with the new enabled status
      setWordList(prev => prev.map(word => 
        filteredIds.includes(word.id) ? { ...word, enabled: enabled ? 1 : 0 } : word
      ));
    } catch (error) {
      console.error('Error bulk updating word status:', error);
      setError(error.message);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading word list...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  const filteredWords = filterWords();
  
  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Words List</h2>
          <Link to="/words/add" className="btn-primary">Add New Word</Link>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginRight: '1rem', flex: 1 }}>
              <label htmlFor="filter">Filter by Level:</label>
              <select 
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="unlearned">Unlearned (Level 0)</option>
                <option value="learning">Learning (Level 1-4)</option>
                <option value="mastered">Mastered (Level 5)</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="reviewFilter">Filter by Review History:</label>
              <select 
                id="reviewFilter"
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
              >
                <option value="all">All Words</option>
                <option value="never">Never Reviewed</option>
                <option value="last24h">Reviewed within Last 24h</option>
                <option value="day-to-week">Reviewed 1 Day to 1 Week Ago</option>
                <option value="week-to-month">Reviewed 1 Week to 1 Month Ago</option>
                <option value="older">Reviewed More Than 1 Month Ago</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by word, reading or meaning"
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p>Showing {filteredWords.length} words</p>
            <div>
              <button 
                onClick={() => bulkSetEnabled(true)}
                className="success"
                style={{ marginRight: '0.5rem' }}
                disabled={filteredWords.length === 0}
              >
                Enable All Filtered
              </button>
              <button 
                onClick={() => bulkSetEnabled(false)}
                className="warning"
                disabled={filteredWords.length === 0}
              >
                Disable All Filtered
              </button>
            </div>
          </div>
          
          <div className="word-grid">
            {filteredWords.map(word => (
              <div 
                key={word.id} 
                className={`word-item ${word.enabled === 0 ? 'disabled' : ''}`}
                onClick={() => handleEditWord(word.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="word">{word.word}</div>
                <div className="reading">{word.reading}</div>
                <div className="meaning">{word.meaning}</div>
                <div className="level-indicator">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`level-dot ${i < word.level ? 'active' : ''}`}
                    />
                  ))}
                </div>
                <button
                  onClick={(e) => toggleWordEnabled(word.id, e)}
                  className={`toggle ${word.enabled ? 'enabled' : 'disabled'}`}
                  disabled={toggleLoading.has(word.id)}
                  title={word.enabled ? 'Disable for reviews' : 'Enable for reviews'}
                >
                  {toggleLoading.has(word.id) ? '...' : (word.enabled ? '✓' : '✗')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordList;