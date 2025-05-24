import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import components
import Home from './components/Home';
import Study from './components/Study';
import Quiz from './components/Quiz';
import KanjiList from './components/KanjiList';
import WordList from './components/WordList';
import WordForm from './components/WordForm';
import Stats from './components/Stats';
import Results from './components/Results';

function App() {
  return (
    <div className="app">
      <header>
        <h1>Japanese Study</h1>
      </header>
      
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/study">Study</Link></li>
          <li><Link to="/kanji">Kanji List</Link></li>
          <li><Link to="/words">Words List</Link></li>
          <li><Link to="/stats">Stats</Link></li>
        </ul>
      </nav>
      
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/study" element={<Study />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/kanji" element={<KanjiList />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/words/add" element={<WordForm />} />
          <Route path="/words/edit/:id" element={<WordForm />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;