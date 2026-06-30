'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { getSearchHistory, getSearchSuggestions } from '@/app/actions/search';

interface SearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

export default function Search({
  onSearch,
  placeholder = 'Search AI tools...',
  showSuggestions = true,
  className = '',
}: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load suggestions when query changes
  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.trim().length >= 2 && showSuggestions) {
        try {
          const results = await getSearchSuggestions(query, 5);
          setSuggestions(results);
          setShowSuggestionsList(results.length > 0);
        } catch (error) {
          console.error('Failed to load suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestionsList(false);
      }
    };

    const debounceTimer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, showSuggestions]);

  // Load recent searches once so logged-in users can quickly rerun them.
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const history = await getSearchHistory(undefined, 5);
        setRecentSearches(history);
      } catch (error) {
        console.error('Failed to load search history:', error);
        setRecentSearches([]);
      }
    };

    if (showSuggestions) {
      loadRecentSearches();
    }
  }, [showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuggestionsList(false);

    try {
      if (onSearch) {
        onSearch(query);
      } else {
        // Navigate to explore page with search query
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) {
          params.set('search', query.trim());
        } else {
          params.delete('search');
        }
        params.delete('page'); // Reset to first page
        router.push(`/explore?${params.toString()}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestionsList(false);

    if (onSearch) {
      onSearch(suggestion);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', suggestion);
      params.delete('page');
      router.push(`/explore?${params.toString()}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestionsList(true);
    }
  };

  return (
    <div className={`flex flex-1 items-center justify-center p-4 sm:p-6 ${className}`}>
      <div className='relative w-full max-w-lg'>
        <form className='sm:flex sm:items-center' onSubmit={handleSubmit}>
          <div className='relative w-full'>
            <input
              ref={inputRef}
              id='q'
              name='search'
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className='inline w-full rounded-md border border-slate-300 bg-white py-3 pl-4 pr-4 text-base leading-5 text-slate-800 placeholder-slate-400 focus:border-cyan-600 focus:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:py-2 sm:text-sm'
              placeholder={placeholder}
              type='search'
              autoComplete='off'
            />

            {/* Suggestions dropdown */}
            {showSuggestionsList && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg'
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type='button'
                    onClick={() => handleSuggestionClick(suggestion)}
                    className='w-full px-4 py-3 text-left text-base text-slate-800 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none active:bg-slate-200 sm:py-2 sm:text-sm'
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {showSuggestionsList &&
              query.trim().length < 2 &&
              recentSearches.length > 0 &&
              suggestions.length === 0 && (
                <div
                  ref={suggestionsRef}
                  className='absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg'
                >
                  <div className='border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Recent searches
                  </div>
                  <div className='max-h-60 overflow-auto p-2'>
                    {recentSearches.map((recent) => (
                      <button
                        key={recent}
                        type='button'
                        onClick={() => handleSuggestionClick(recent)}
                        className='flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none'
                      >
                        {recent}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='mt-3 inline-flex w-full touch-manipulation items-center justify-center rounded-md border border-transparent bg-cyan-700 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 active:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-3 sm:mt-0 sm:w-auto sm:px-4 sm:py-2 sm:text-sm'
          >
            {isLoading ? (
              <svg
                className='size-5 animate-spin sm:size-[18px]'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-search size-5 sm:size-[18px]'
              >
                <circle cx='11' cy='11' r='8' />
                <path d='m21 21-4.3-4.3' />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
