import React from 'react';

export interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const CustomTextarea = React.forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ hasError = false, className = '', disabled, readOnly, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full p-3.5 text-xs text-white placeholder-noctis-muted rounded-xl transition-all duration-200 outline-none
          bg-noctis-bg border resize-none font-sans
          ${
            hasError
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-noctis-surface hover:border-noctis-surface/90 focus:border-noctis-cyan focus:ring-2 focus:ring-noctis-cyan/20'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-noctis-surfaceDark/40' : ''}
          ${readOnly ? 'bg-noctis-surfaceDark/30 cursor-default' : ''}
          ${className}`}
        {...props}
      />
    );
  }
);

CustomTextarea.displayName = 'CustomTextarea';
