
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const { theme } = useTheme();
  
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  // Logo em SVG que se adapta ao tema
  const logoColor = theme === 'dark' ? '#ffffff' : '#1d76b2';
  const accentColor = theme === 'dark' ? '#60a5fa' : '#26387b';

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo principal */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={logoColor}
          stroke={accentColor}
          strokeWidth="2"
        />
        
        {/* Letra T estilizada */}
        <path
          d="M25 30 L75 30 M50 30 L50 70"
          stroke={theme === 'dark' ? '#1d76b2' : '#ffffff'}
          strokeWidth="6"
          strokeLinecap="round"
        />
        
        {/* Elemento decorativo */}
        <circle
          cx="50"
          cy="75"
          r="3"
          fill={accentColor}
        />
      </svg>
    </div>
  );
};

export default Logo;
