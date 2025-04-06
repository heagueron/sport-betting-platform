import React from 'react';
import './ImageDisplay.css';

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ src, alt, className = '' }) => {
  return (
    <div className={`image-display ${className}`}>
      <div className="image-container">
        <img src={src} alt={alt} className="display-image" />
      </div>
    </div>
  );
};

export default ImageDisplay;
