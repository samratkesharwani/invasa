import React from 'react';

/**
 * A reusable component for displaying icons with proper dark/light mode styling
 * In light mode, icons have a black circular background
 * In dark mode, icons use their native colors with a semi-transparent background
 */
const IconContainer = ({ 
  icon, 
  alt = 'Icon', 
  isDarkMode, 
  size = 'md', 
  onClick = null,
  color = 'indigo',
  speicalMode
}) => {
  // Size classes for different size variants
  const sizeClasses = {
    sm: 'w-8 h-8', // Small
    md: 'w-12 h-12', // Medium
    lg: 'w-16 h-16', // Large
    xl: 'w-20 h-20', // Extra large
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-5 h-5',  
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    xxl: 'w-16 h-16',
    xxxl: 'w-24 h-24',
    exl:'w-36 h-36'
  };


  // Determine background color based on dark/light mode
  const bgClass = isDarkMode 
    ? `bg-${color}-900/30` : speicalMode? ""
    : 'bg-black'
    // :''

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${bgClass} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {typeof icon === 'string' ? (
        // If icon is a string, treat it as an image source
        <img 
          src={icon} 
          alt={alt}
          className={iconSizeClasses[size]}
        />
      ) : (
        // If icon is a component, render it directly with appropriate styling
        <div className={`${iconSizeClasses[size]} ${isDarkMode ? `text-${color}-300` : 'text-white'}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

export default IconContainer; 