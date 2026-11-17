import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar opción...',
  disabled = false,
  hasError = false,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        const idx = options.findIndex((opt) => opt.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const itemEl = listboxRef.current.children[focusedIndex] as HTMLElement;
      if (itemEl) {
        itemEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative font-sans text-xs ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-11 flex items-center justify-between px-3.5 rounded-xl text-left transition-all duration-200 outline-none
          bg-noctis-bg border text-xs
          ${
            hasError
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : isOpen
              ? 'border-noctis-cyan ring-2 ring-noctis-cyan/20 shadow-glow-cyan'
              : 'border-noctis-surface hover:border-noctis-surface/90 focus:border-noctis-cyan focus:ring-2 focus:ring-noctis-cyan/20'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-noctis-surfaceDark/40' : 'cursor-pointer'}`}
      >
        <span className={`flex items-center gap-2 truncate ${selectedOption ? 'text-white font-medium' : 'text-noctis-muted'}`}>
          {selectedOption?.icon && <span className="flex-shrink-0 text-noctis-cyan">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-noctis-muted transition-transform duration-200 ml-2 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-noctis-cyan' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 rounded-xl bg-[#111827] border border-noctis-surface/90 shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <ul
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-60 overflow-y-auto p-1.5 space-y-1 focus:outline-none custom-scrollbar text-xs"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-xs text-noctis-muted text-center italic">
                No hay opciones disponibles
              </li>
            ) : (
              options.map((option, idx) => {
                const isSelected = option.value === value;
                const isFocused = idx === focusedIndex;

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                      isSelected
                        ? 'bg-noctis-purple/30 text-white font-medium border border-noctis-purple/40'
                        : isFocused
                        ? 'bg-noctis-surface/60 text-white'
                        : 'text-noctis-text/90 hover:bg-noctis-surface/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {option.icon && <span className="flex-shrink-0 text-noctis-cyan">{option.icon}</span>}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{option.label}</p>
                        {option.description && (
                          <p className="text-[11px] text-noctis-muted truncate">{option.description}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-noctis-cyan flex-shrink-0 ml-2" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
