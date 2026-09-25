import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, onClick }) => {
  return (
    <div 
      className={`card ${onClick ? 'card-interactive' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon" style={{ background: iconBg || 'rgba(99, 102, 241, 0.15)', color: iconColor || '#6366f1' }}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
