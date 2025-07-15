
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface AdaptiveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AdaptiveLogo: React.FC<AdaptiveLogoProps> = ({ className = '', size = 'md' }) => {
  const { theme } = useTheme();
  
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <img
      src={theme === 'dark' 
        ? '/lovable-uploads/06b8a99c-7e1e-4886-8de5-2100e07e1d4d.png'
        : '/lovable-uploads/705edc4a-8465-4311-8709-983758643fdd.png'
      }
      alt="Tecnolog"
      className={`${sizes[size]} ${className} object-contain`}
    />
  );
};

export default AdaptiveLogo;
