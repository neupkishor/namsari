import React, { InputHTMLAttributes } from 'react';
import styles from './form.module.css';
import { FormControl } from './FormControl';

interface RadioOption {
    label: string;
    value: string;
    description?: string;
}

interface RadioGroupProps {
    label?: string;
    name: string;
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    hint?: string;
    required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    name,
    options,
    value,
    onChange,
    error,
    hint,
    required,
}) => {
    return (
        <FormControl label={label} error={error} hint={hint} required={required}>
            <div className={styles.radioGroup}>
                {options.map((option) => (
                    <label key={option.value} className={styles.radioItem}>
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={(e) => onChange?.(e.target.value)}
                            className={styles.radioInput}
                            required={required}
                        />
                        <div className={styles.radioContent}>
                            <span className={styles.radioLabel}>{option.label}</span>
                            {option.description && (
                                <span className={styles.radioDescription}>{option.description}</span>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </FormControl>
    );
};

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    ({ label, description, className = '', ...props }, ref) => {
        return (
            <label className={`${styles.radioItem} ${className}`}>
                <input
                    ref={ref}
                    type="radio"
                    className={styles.radioInput}
                    {...props}
                />
                <div className={styles.radioContent}>
                    <span className={styles.radioLabel}>{label}</span>
                    {description && (
                        <span className={styles.radioDescription}>{description}</span>
                    )}
                </div>
            </label>
        );
    }
);

Radio.displayName = 'Radio';
