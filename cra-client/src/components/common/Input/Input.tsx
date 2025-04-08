import React, { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'input-field',
    error ? 'input-error' : '',
    fullWidth ? 'input-full-width' : '',
    className,
  ].filter(Boolean).join(' ');

  const id = props.id || props.name;

  return (
    <div className={`input-container ${fullWidth ? 'input-container-full-width' : ''}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className={inputClasses} {...props} />
      {error && <div className="input-error-message">{error}</div>}
    </div>
  );
};

export default Input;
