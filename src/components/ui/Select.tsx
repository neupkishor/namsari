import React, { SelectHTMLAttributes } from 'react';
import styles from './form.module.css';
import { FormControl } from './FormControl';

interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string; // Added placeholder to interface
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, required, id, options, className = '', placeholder, ...props }, ref) => { // Destructured placeholder
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <FormControl label={label} error={error} hint={hint} required={required} id={inputId}>
                <div style={{ position: 'relative' }}>
                    <select
                        ref={ref}
                        id={inputId}
                        className={`${styles.select} ${className}`}
                        required={required}
                        defaultValue="" // Added defaultValue
                        {...props}
                    >
                        {placeholder && ( // Used destructured placeholder
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div
                        style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: 'var(--color-text-muted)',
                        }}
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2.5 4.5L6 8L9.5 4.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </FormControl>
        );
    }
);

Select.displayName = 'Select';
