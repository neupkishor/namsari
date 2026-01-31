import React from 'react';
import styles from './form.module.css';

interface FormControlProps {
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
    id?: string;
}

export const FormControl: React.FC<FormControlProps> = ({
    label,
    error,
    hint,
    required,
    children,
    id,
}) => {
    return (
        <div className={styles.formControl}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            {children}
            {error && <span className={styles.error}>{error}</span>}
            {hint && !error && <span className={styles.hint}>{hint}</span>}
        </div>
    );
};
