'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

export interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  isLoading?: boolean;
}

export function Autocomplete({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder = 'Rechercher...',
  isLoading = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (!value) {
      setFilteredSuggestions([]);
      setIsOpen(false);
      return;
    }

    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  }, [value, suggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (suggestion: string) => {
      onSelect(suggestion);
      setIsOpen(false);
    },
    [onSelect]
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setIsOpen(filteredSuggestions.length > 0)}
          className="w-full pr-10"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        )}
        {!isLoading && (
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-2 rounded-md border border-input bg-popover shadow-md">
          <ul className="max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSelect(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
