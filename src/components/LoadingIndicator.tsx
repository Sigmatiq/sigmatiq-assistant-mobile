import React from 'react';
import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* SIGMATIQ Typing Indicator - Three animated dots */}
        <div className="flex items-center justify-center space-x-1 h-full">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="bg-teal-500 rounded-full"
              style={{
                width: size === 'small' ? '6px' : size === 'medium' ? '8px' : '10px',
                height: size === 'small' ? '6px' : size === 'medium' ? '8px' : '10px',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
      {message && (
        <span className={`text-gray-400 ${textSizes[size]} animate-pulse block`}>
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingIndicator;