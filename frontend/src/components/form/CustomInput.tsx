import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hasError?: boolean;
}

export const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      type = 'text',
      icon,
      leftIcon,
      rightIcon,
      hasError = false,
      className = '',
      disabled,
      readOnly,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const effectiveLeftIcon = icon || leftIcon;
    const hasLeftIcon = Boolean(effectiveLeftIcon);
    const hasRightAction = isPassword || Boolean(rightIcon);

    return (
      <div className="relative w-full font-inter">
        {/* Left Icon (Centered Vertically) */}
        {hasLeftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-noctis-muted flex items-center justify-center w-4 h-4">
            {effectiveLeftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={computedType}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full h-11 text-xs text-white placeholder-noctis-muted rounded-xl transition-all duration-200 outline-none
            bg-noctis-bg border
            ${
              hasError
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-noctis-surface hover:border-noctis-surface/90 focus:border-noctis-cyan focus:ring-2 focus:ring-noctis-cyan/20'
            }
            ${hasLeftIcon ? 'pl-10' : 'pl-3.5'}
            ${hasRightAction ? 'pr-10' : 'pr-3.5'}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-noctis-surfaceDark/40' : ''}
            ${readOnly ? 'bg-noctis-surfaceDark/30 cursor-default' : ''}
            ${className}`}
          {...props}
        />

        {/* Right Icon / Password Toggle (Centered Vertically) */}
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-noctis-muted hover:text-white p-1 rounded-lg transition-colors focus:outline-none"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-noctis-muted flex items-center justify-center w-4 h-4">
            {rightIcon}
          </div>
        ) : null}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;
