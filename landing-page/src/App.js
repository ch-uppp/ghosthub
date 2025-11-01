import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroPage from './components/HeroPage';
import ConfigPage from './components/ConfigPage';
import './App.css';

function App() {
  return (
    <Router>
      <div data-testid="app">
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/configure" element={<ConfigPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
