import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...rest }, ref) => {
    return (
      <div className={styles.formGroup}>
        {label && <label className={styles.label}>{label}</label>}
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.error : ''} ${className || ''}`}
          {...rest}
        />
        {error && <div className={styles.errorMessage}>{error}</div>}
        {helperText && !error && <div className={styles.helperText}>{helperText}</div>}
      </div>
    );
  }
);
