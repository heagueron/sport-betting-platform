import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', color = '#007bff' }) => {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className={`spinner ${sizeClass}`} style={{ borderTopColor: color }}>
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default Spinner;
