import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Rocket, 
  Award, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Twitter, 
  Linkedin,
  ArrowRight,
  Heart,
  Code,
  Palette,
  Zap
} from 'lucide-react';
import './About.css';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const milestones = [
    {
      year: "2025",
      title: "GameHub Founded",
      description: "Started with a vision to create the ultimate gaming platform"
    },
    {
      year: "2025",
      title: "Beta Launch",
      description: "Released our beta version with core gaming features and community tools"
    },
    {
      year: "2025",
      title: "1K+ Games",
      description: "Built our initial game library with carefully curated titles"
    },
    {
      year: "2026",
      title: "Mobile App Launch",
      description: "Expanded to mobile platforms for gaming on the go"
    }
  ];

  const values = [
    {
      icon: <Target className="value-icon" />,
      title: "Quality First",
      description: "We curate only the best games to ensure exceptional gaming experiences for our community."
    },
    {
      icon: <Users className="value-icon" />,
      title: "Community Driven",
      description: "Our platform is built around fostering connections and shared experiences among gamers."
    },
    {
      icon: <Rocket className="value-icon" />,
      title: "Innovation",
      description: "We constantly evolve and implement cutting-edge technologies to enhance user experience."
    },
    {
      icon: <Heart className="value-icon" />,
      title: "Passion",
      description: "Gaming is our passion, and we pour that enthusiasm into everything we create."
    }
  ];

  const stats = [
    { number: "15+", label: "Games Available", icon: "🎮" },
    { number: "1M+", label: "Happy Players", icon: "👥" },
    { number: "50K+", label: "Daily Sessions", icon: "📊" },
    { number: "99.9%", label: "Uptime", icon: "⚡" }
  ];

  return (
    <motion.div 
      className="about-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div className="hero-content" variants={itemVariants}>
            <h1 className="page-title">About GameHub</h1>
            <p className="page-subtitle">
              We're passionate gamers building the ultimate gaming destination 
              for players around the world
            </p>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="hero-stat">
                  <span className="stat-icon">{stat.icon}</span>
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <motion.div className="mission-content" variants={itemVariants}>
            <div className="mission-text">
              <h2 className="section-title">Our Mission</h2>
              <p className="mission-description">
                To create an inclusive, innovative gaming platform that connects players 
                worldwide and provides access to the best gaming experiences. We believe 
                gaming brings people together, fosters creativity, and creates lasting memories.
              </p>
              <p className="mission-description">
                Our goal is to make gaming accessible to everyone, regardless of their 
                background or experience level. We're building more than just a platform – 
                we're creating a community where gamers can discover, play, and connect.
              </p>
            </div>
            <div className="mission-visual">
              <div className="visual-grid">
                <div className="visual-item">
                  <Code className="visual-icon" />
                  <span>Technology</span>
                </div>
                <div className="visual-item">
                  <Palette className="visual-icon" />
                  <span>Design</span>
                </div>
                <div className="visual-item">
                  <Zap className="visual-icon" />
                  <span>Performance</span>
                </div>
                <div className="visual-item">
                  <Heart className="visual-icon" />
                  <span>Community</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <motion.div className="section-header" variants={itemVariants}>
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle">
              The principles that guide everything we do
            </p>
          </motion.div>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                className="value-card"
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {value.icon}
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="container">
          <motion.div className="section-header" variants={itemVariants}>
            <h2 className="section-title">Our Journey</h2>
            <p className="section-subtitle">
              Key milestones in our mission to revolutionize gaming
            </p>
          </motion.div>
          
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <motion.div 
                key={index} 
                className="timeline-item"
                variants={itemVariants}
              >
                <div className="timeline-marker">
                  <span className="timeline-year">{milestone.year}</span>
                </div>
                <div className="timeline-content">
                  <h3 className="timeline-title">{milestone.title}</h3>
                  <p className="timeline-description">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="container">
          <motion.div className="technology-content" variants={itemVariants}>
            <div className="tech-info">
              <h2 className="section-title">Built with Modern Technology</h2>
              <p className="tech-description">
                GameHub is built using cutting-edge web technologies to ensure 
                fast, reliable, and engaging user experiences across all devices.
              </p>
              <div className="tech-features">
                <div className="tech-feature">
                  <Award className="feature-icon" />
                  <span>Progressive Web App</span>
                </div>
                <div className="tech-feature">
                  <Zap className="feature-icon" />
                  <span>Lightning Fast Performance</span>
                </div>
                <div className="tech-feature">
                  <Users className="feature-icon" />
                  <span>Mobile-First Design</span>
                </div>
              </div>
            </div>
            <div className="tech-stack">
              <h3>Technology Stack</h3>
              <div className="tech-tags">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Vite</span>
                <span className="tech-tag">Framer Motion</span>
                <span className="tech-tag">CSS Grid</span>
                <span className="tech-tag">PWA</span>
                <span className="tech-tag">JavaScript</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <motion.div className="contact-content" variants={itemVariants}>
            <div className="contact-info">
              <h2 className="section-title">Get in Touch</h2>
              <p className="contact-description">
                Have questions, suggestions, or just want to say hello? 
                We'd love to hear from you!
              </p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <div className="contact-text">
                    <span className="contact-label">Email</span>
                    <span className="contact-value">gamehubweb@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-cta">
              <h3>Ready to Start Gaming?</h3>
              <p>Join our community of passionate gamers today!</p>
              <Link to="/games" className="btn btn-primary">
                Explore Games
                <ArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;