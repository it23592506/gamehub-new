import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Trophy, 
  Calendar, 
  Clock, 
  Heart, 
  Star, 
  Edit3, 
  Camera,
  Mail,
  Lock,
  Bell,
  Gamepad2,
  BarChart3,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { gamesData } from '../data/games';
import GameCard from '../components/games/GameCard';
import './Profile.css';

const Profile = () => {
  const { favorites } = useFavorites();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Gaming Master',
    email: 'gamer@gamehub.com',
    avatar: 'https://via.placeholder.com/150x150/00d4ff/ffffff?text=GM',
    joinDate: '2024-01-15',
    bio: 'Passionate gamer who loves exploring new worlds and challenging gameplay.',
    location: 'San Francisco, CA',
    website: 'https://mygamingblog.com'
  });

  const [settings, setSettings] = useState({
    notifications: {
      newGames: true,
      reviews: true,
      achievements: false,
      newsletters: true
    },
    privacy: {
      profileVisible: true,
      showStats: true,
      showFavorites: true
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      autoplay: false
    }
  });

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

  // Calculate user statistics
  const userStats = useMemo(() => {
    const favoriteGames = gamesData.filter(game => favorites.includes(game.id));
    const totalRating = favoriteGames.reduce((sum, game) => sum + game.rating, 0);
    const categories = [...new Set(favoriteGames.map(game => game.category))];
    
    return {
      totalFavorites: favorites.length,
      averageRating: favoriteGames.length > 0 ? (totalRating / favoriteGames.length).toFixed(1) : 0,
      categoriesExplored: categories.length,
      gamesPlayed: Math.floor(Math.random() * 50) + 20, // Simulated
      hoursPlayed: Math.floor(Math.random() * 200) + 100, // Simulated
      achievements: Math.floor(Math.random() * 15) + 5, // Simulated
      joinedDaysAgo: Math.floor((new Date() - new Date(userProfile.joinDate)) / (1000 * 60 * 60 * 24))
    };
  }, [favorites, userProfile.joinDate]);

  // Generate recent activity (simulated)
  const recentActivity = [
    { type: 'favorite', game: 'Snake Game', timestamp: '2 hours ago' },
    { type: 'played', game: 'Tetris', timestamp: '1 day ago' },
    { type: 'achievement', title: 'First Victory', timestamp: '2 days ago' },
    { type: 'favorite', game: 'Pac-Man', timestamp: '3 days ago' },
    { type: 'played', game: 'Space Invaders', timestamp: '5 days ago' }
  ];

  // Generate achievements (simulated)
  const achievements = [
    { 
      id: 1, 
      title: 'Game Explorer', 
      description: 'Played 10 different games', 
      icon: '🎮', 
      unlocked: true,
      date: '2024-12-01'
    },
    { 
      id: 2, 
      title: 'Favorite Collector', 
      description: 'Added 5 games to favorites', 
      icon: '❤️', 
      unlocked: favorites.length >= 5,
      date: favorites.length >= 5 ? '2024-12-15' : null
    },
    { 
      id: 3, 
      title: 'Daily Player', 
      description: 'Play for 7 consecutive days', 
      icon: '🔥', 
      unlocked: true,
      date: '2024-12-10'
    },
    { 
      id: 4, 
      title: 'Category Master', 
      description: 'Explore all game categories', 
      icon: '🏆', 
      unlocked: userStats.categoriesExplored >= 6,
      date: userStats.categoriesExplored >= 6 ? '2024-12-20' : null
    },
    { 
      id: 5, 
      title: 'Community Member', 
      description: 'Member for 30 days', 
      icon: '🌟', 
      unlocked: userStats.joinedDaysAgo >= 30,
      date: userStats.joinedDaysAgo >= 30 ? '2024-11-15' : null
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={20} /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart size={20} /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const handleProfileUpdate = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingUpdate = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const favoriteGames = gamesData.filter(game => favorites.includes(game.id));

  return (
    <motion.div 
      className="profile-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Header */}
      <section className="profile-header">
        <div className="container">
          <motion.div className="profile-banner" variants={itemVariants}>
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <img src={userProfile.avatar} alt={userProfile.name} />
                <button className="avatar-edit-btn">
                  <Camera size={16} />
                </button>
              </div>
              
              <div className="profile-info">
                <div className="profile-name-section">
                  {editMode ? (
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      className="profile-name-input"
                    />
                  ) : (
                    <h1 className="profile-name">{userProfile.name}</h1>
                  )}
                  <button 
                    className="edit-profile-btn"
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
                
                {editMode ? (
                  <textarea
                    value={userProfile.bio}
                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                    className="profile-bio-input"
                    rows="2"
                  />
                ) : (
                  <p className="profile-bio">{userProfile.bio}</p>
                )}
                
                <div className="profile-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>Joined {new Date(userProfile.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{userStats.hoursPlayed} hours played</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="profile-stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎮</div>
                <div className="stat-number">{userStats.gamesPlayed}</div>
                <div className="stat-label">Games Played</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❤️</div>
                <div className="stat-number">{userStats.totalFavorites}</div>
                <div className="stat-label">Favorites</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-number">{userStats.achievements}</div>
                <div className="stat-label">Achievements</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-number">{userStats.averageRating}</div>
                <div className="stat-label">Avg. Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="profile-navigation">
        <div className="container">
          <motion.div className="profile-tabs" variants={itemVariants}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="profile-content">
        <div className="container">
          {activeTab === 'overview' && (
            <motion.div className="overview-content" variants={itemVariants}>
              <div className="content-grid">
                {/* Recent Activity */}
                <div className="content-card">
                  <h3 className="card-title">
                    <BarChart3 className="title-icon" />
                    Recent Activity
                  </h3>
                  <div className="activity-list">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === 'favorite' && <Heart size={16} />}
                          {activity.type === 'played' && <Gamepad2 size={16} />}
                          {activity.type === 'achievement' && <Trophy size={16} />}
                        </div>
                        <div className="activity-content">
                          <div className="activity-text">
                            {activity.type === 'favorite' && `Added ${activity.game} to favorites`}
                            {activity.type === 'played' && `Played ${activity.game}`}
                            {activity.type === 'achievement' && `Unlocked "${activity.title}"`}
                          </div>
                          <div className="activity-time">{activity.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaming Stats */}
                <div className="content-card">
                  <h3 className="card-title">
                    <TrendingUp className="title-icon" />
                    Gaming Progress
                  </h3>
                  <div className="progress-stats">
                    <div className="progress-item">
                      <div className="progress-info">
                        <span>Categories Explored</span>
                        <span>{userStats.categoriesExplored}/7</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(userStats.categoriesExplored / 7) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-info">
                        <span>Achievements Unlocked</span>
                        <span>{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-info">
                        <span>Favorite Games</span>
                        <span>{userStats.totalFavorites}/15</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min((userStats.totalFavorites / 15) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div className="favorites-content" variants={itemVariants}>
              {favoriteGames.length > 0 ? (
                <div className="favorites-grid">
                  {favoriteGames.map((game, index) => (
                    <GameCard key={game.id} game={game} index={index} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Heart className="empty-icon" />
                  <h3>No Favorites Yet</h3>
                  <p>Start adding games to your favorites to see them here!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div className="achievements-content" variants={itemVariants}>
              <div className="achievements-grid">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-icon">
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </div>
                    <div className="achievement-info">
                      <h4 className="achievement-title">{achievement.title}</h4>
                      <p className="achievement-description">{achievement.description}</p>
                      {achievement.unlocked && achievement.date && (
                        <div className="achievement-date">
                          Unlocked on {new Date(achievement.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div className="settings-content" variants={itemVariants}>
              <div className="settings-sections">
                {/* Account Settings */}
                <div className="settings-section">
                  <h3 className="section-title">
                    <User className="title-icon" />
                    Account Information
                  </h3>
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        className="setting-input"
                      />
                    </div>
                    <div className="setting-item">
                      <label>Location</label>
                      <input
                        type="text"
                        value={userProfile.location}
                        onChange={(e) => handleProfileUpdate('location', e.target.value)}
                        className="setting-input"
                      />
                    </div>
                    <div className="setting-item">
                      <label>Website</label>
                      <input
                        type="url"
                        value={userProfile.website}
                        onChange={(e) => handleProfileUpdate('website', e.target.value)}
                        className="setting-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="settings-section">
                  <h3 className="section-title">
                    <Bell className="title-icon" />
                    Notifications
                  </h3>
                  <div className="settings-list">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="setting-toggle">
                        <div className="toggle-info">
                          <span className="toggle-label">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="toggle-description">
                            {key === 'newGames' && 'Get notified about new game releases'}
                            {key === 'reviews' && 'Receive notifications about game reviews'}
                            {key === 'achievements' && 'Achievement unlock notifications'}
                            {key === 'newsletters' && 'Receive our weekly newsletter'}
                          </span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleSettingUpdate('notifications', key, e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="settings-section">
                  <h3 className="section-title">
                    <Lock className="title-icon" />
                    Privacy
                  </h3>
                  <div className="settings-list">
                    {Object.entries(settings.privacy).map(([key, value]) => (
                      <div key={key} className="setting-toggle">
                        <div className="toggle-info">
                          <span className="toggle-label">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="toggle-description">
                            {key === 'profileVisible' && 'Make your profile visible to other users'}
                            {key === 'showStats' && 'Display your gaming statistics publicly'}
                            {key === 'showFavorites' && 'Show your favorite games on your profile'}
                          </span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleSettingUpdate('privacy', key, e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Profile;