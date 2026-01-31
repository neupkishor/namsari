import React, { TextareaHTMLAttributes } from 'react';
import styles from './form.module.css';
import { FormControl } from './FormControl';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, hint, required, id, className = '', ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <FormControl label={label} error={error} hint={hint} required={required} id={inputId}>
                <textarea
                    ref={ref}
                    id={inputId}
                    className={`${styles.textarea} ${className}`}
                    required={required}
                    {...props}
                />
            </FormControl>
        );
    }
);

TextArea.displayName = 'TextArea';
