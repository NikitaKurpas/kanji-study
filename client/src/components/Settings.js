import React from 'react';

function Settings() {
  const handleResetStats = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all review statistics? This will reset all levels, review counts, and review dates for both kanji and words. This action cannot be undone.'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch('/api/reset-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset stats');
      }

      alert('Review statistics have been reset successfully!');
    } catch (error) {
      console.error('Error resetting stats:', error);
      alert('Failed to reset stats. Please try again.');
    }
  };

  return (
    <div className="settings">
      <h1>Settings</h1>
      <div className="settings-section">
        <h2>Reset Data</h2>
        <p>
          Reset all your progress and review statistics. This will set all kanji and word levels back to 0, 
          clear review dates, and reset review counts. The kanji and word lists themselves will not be affected.
        </p>
        <button 
          className="reset-button" 
          onClick={handleResetStats}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
        >
          Reset Review Stats
        </button>
      </div>
    </div>
  );
}

export default Settings;