import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './WordForm.css';

const WordForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    word: '',
    reading: '',
    meaning: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  
  // Fetch word data if in edit mode
  useEffect(() => {
    const fetchWordData = async () => {
      if (!isEditMode) return;
      
      try {
        const response = await fetch(`/api/words/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch word data');
        }
        
        const wordData = await response.json();
        setFormData({
          word: wordData.word,
          reading: wordData.reading,
          meaning: wordData.meaning
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchWordData();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Simple validation
    if (!formData.word || !formData.reading || !formData.meaning) {
      setSubmitError('All fields are required');
      return;
    }
    
    try {
      const url = isEditMode ? `/api/words/${id}` : '/api/words';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save word');
      }
      
      // Navigate back to the word list
      navigate('/words');
    } catch (error) {
      setSubmitError(error.message);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading word data...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="word-form-container">
      <div className="card">
        <h2>{isEditMode ? 'Edit Word' : 'Add New Word'}</h2>
        
        {submitError && (
          <div className="error-message">{submitError}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="word">Word:</label>
            <input
              type="text"
              id="word"
              name="word"
              value={formData.word}
              onChange={handleChange}
              placeholder="Enter the Japanese word"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reading">Reading:</label>
            <input
              type="text"
              id="reading"
              name="reading"
              value={formData.reading}
              onChange={handleChange}
              placeholder="Enter the reading (hiragana/katakana)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="meaning">Meaning:</label>
            <textarea
              id="meaning"
              name="meaning"
              value={formData.meaning}
              onChange={handleChange}
              placeholder="Enter the English meaning"
              rows={3}
            />
          </div>
          
          <div className="button-group">
            <button type="button" onClick={() => navigate('/words')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditMode ? 'Update Word' : 'Add Word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WordForm;