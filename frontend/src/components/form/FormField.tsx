import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  id,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 font-sans ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-noctis-text select-none leading-none"
        >
          {label}
          {required && <span className="text-noctis-cyan ml-1 font-bold">*</span>}
        </label>
      )}

      <div className="relative">{children}</div>

      {error ? (
        <p className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-noctis-muted leading-relaxed">{helperText}</p>
      ) : null}
    </div>
  );
};
