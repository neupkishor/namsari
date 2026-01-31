import React, { InputHTMLAttributes } from 'react';
import styles from './form.module.css';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
    error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, description, error, className = '', ...props }, ref) => {
        return (
            <div className={styles.formControl} style={{ marginBottom: '1rem' }}>
                <label className={styles.checkboxContainer}>
                    <input
                        ref={ref}
                        type="checkbox"
                        className={styles.checkboxInput}
                        {...props}
                    />
                    <div className={styles.checkboxContent}>
                        <span className={styles.radioLabel}>{label}</span>
                        {description && (
                            <span className={styles.radioDescription}>{description}</span>
                        )}
                    </div>
                </label>
                {error && <span className={styles.error}>{error}</span>}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
