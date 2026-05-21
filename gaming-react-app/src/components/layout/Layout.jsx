import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children, onSearchChange, searchTerm }) => {
  return (
    <div className="app-layout">
      <Header onSearchChange={onSearchChange} searchTerm={searchTerm} />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;