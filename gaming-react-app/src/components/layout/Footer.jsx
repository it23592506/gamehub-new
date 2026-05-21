import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    games: [
      { name: 'Action Games', path: '/games?category=action' },
      { name: 'RPG Games', path: '/games?category=rpg' },
      { name: 'Racing Games', path: '/games?category=racing' },
      { name: 'Puzzle Games', path: '/games?category=puzzle' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' }
    ]
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-section footer-brand">
            <Link to="/" className="footer-logo">
              <Gamepad2 className="logo-icon" />
              <span className="logo-text">GameHub</span>
            </Link>
            <p className="footer-description">
              Your ultimate destination for the best gaming experience. 
              Discover, play, and connect with gamers worldwide.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <Youtube />
              </a>
            </div>
          </div>

          {/* Games Links */}
          <div className="footer-section">
            <h3 className="footer-title">Games</h3>
            <ul className="footer-links">
              {footerLinks.games.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contact</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Mail className="contact-icon" />
                <span>gamehubweb@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="newsletter-section">
          <h3>Stay Updated</h3>
          <p>Subscribe to get the latest games and updates</p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} GameHub. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;