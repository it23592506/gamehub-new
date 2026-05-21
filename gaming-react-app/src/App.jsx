import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Games from './pages/Games';
import Categories from './pages/Categories';
import Favorites from './pages/Favorites';
import About from './pages/About';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdvancedGames from './pages/AdvancedGames';
import GamePlayer from './components/games/GamePlayer';
import InstallPrompt from './components/InstallPrompt';
import { useSearch } from './hooks/useSearch';
import { gamesData } from './data/games';
import { searchGames } from './utils/gameUtils';
import './App.css';
import './placeholder-styles.css';

function App() {
  const { searchTerm, setSearchTerm } = useSearch(gamesData, searchGames);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Full-screen game routes */}
            <Route path="/game/:id" element={<GamePlayer />} />
            
            {/* Authentication routes (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Main layout routes */}
            <Route path="/*" element={
              <Layout onSearchChange={setSearchTerm} searchTerm={searchTerm}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/advanced-games" element={<AdvancedGames />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<div className="container" style={{padding: '4rem 1rem', textAlign: 'center'}}>404 - Page Not Found</div>} />
                </Routes>
              </Layout>
            } />
          </Routes>
          <InstallPrompt />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
