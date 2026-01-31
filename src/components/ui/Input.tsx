import React, { InputHTMLAttributes } from 'react';
import styles from './form.module.css';
import { FormControl } from './FormControl';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, required, id, className = '', ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <FormControl label={label} error={error} hint={hint} required={required} id={inputId}>
                <input
                    ref={ref}
                    id={inputId}
                    className={`${styles.input} ${className}`}
                    required={required}
                    {...props}
                />
            </FormControl>
        );
    }
);

Input.displayName = 'Input';
