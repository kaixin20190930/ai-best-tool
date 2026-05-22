'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/lib/services/categories';
import { Tag } from '@/lib/services/tags';

interface FilterPanelProps {
  categories: Category[];
  tags: Tag[];
  locale?: string;
  className?: string;
}

export default function FilterPanel({ 
  categories, 
  tags, 
  locale = 'en',
  className = '' 
}: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [selectedPricing, setSelectedPricing] = useState<string>(
    searchParams.get('pricing') || ''
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Update filters when URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedTags(searchParams.get('tags')?.split(',').filter(Boolean) || []);
    setSelectedPricing(searchParams.get('pricing') || '');
  }, [searchParams]);

  const getLocalizedName = (nameObj: Record<string, string>): string => {
    return nameObj[locale] || nameObj['en'] || Object.values(nameObj)[0] || '';
  };

  const applyFilters = (
    category: string,
    tags: string[],
    pricing: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update category
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    // Update tags
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    } else {
      params.delete('tags');
    }
    
    // Update pricing
    if (pricing) {
      params.set('pricing', pricing);
    } else {
      params.delete('pricing');
    }
    
    // Reset to first page when filters change
    params.delete('page');
    
    router.push(`/explore?${params.toString()}`);
  };

  const handleCategoryChange = (categorySlug: string) => {
    const newCategory = selectedCategory === categorySlug ? '' : categorySlug;
    setSelectedCategory(newCategory);
    applyFilters(newCategory, selectedTags, selectedPricing);
  };

  const handleTagToggle = (tagSlug: string) => {
    const newTags = selectedTags.includes(tagSlug)
      ? selectedTags.filter(t => t !== tagSlug)
      : [...selectedTags, tagSlug];
    
    setSelectedTags(newTags);
    applyFilters(selectedCategory, newTags, selectedPricing);
  };

  const handlePricingChange = (pricing: string) => {
    const newPricing = selectedPricing === pricing ? '' : pricing;
    setSelectedPricing(newPricing);
    applyFilters(selectedCategory, selectedTags, newPricing);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedTags([]);
    setSelectedPricing('');
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('tags');
    params.delete('pricing');
    params.delete('page');
    
    router.push(`/explore?${params.toString()}`);
  };

  const hasActiveFilters = selectedCategory || selectedTags.length > 0 || selectedPricing;

  return (
    <div className={`theme-surface rounded-lg ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-slate-200 p-4'>
        <h3 className='theme-text-strong text-base font-semibold sm:text-lg'>Filters</h3>
        <div className='flex items-center gap-3'>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className='flex min-h-[44px] items-center text-sm font-medium text-cyan-700 hover:text-cyan-800 active:text-cyan-900 touch-manipulation'
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='-mr-2 p-2 text-slate-600 hover:text-slate-900 active:text-slate-700 touch-manipulation lg:hidden'
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <svg
              className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        {/* Categories */}
        <div className='border-b border-slate-200 p-4'>
          <h4 className='theme-text-strong mb-3 text-sm font-semibold'>Categories</h4>
          <div className='space-y-1'>
            {categories.map((category) => (
              <label
                key={category.id}
                className='flex min-h-[44px] cursor-pointer items-center rounded-md p-3 transition-colors hover:bg-slate-50 active:bg-slate-100 touch-manipulation'
              >
                <input
                  type='radio'
                  name='category'
                  checked={selectedCategory === category.slug}
                  onChange={() => handleCategoryChange(category.slug)}
                  className='h-5 w-5 border-slate-300 text-cyan-700 focus:ring-2 focus:ring-cyan-500'
                />
                <span className='ml-3 text-base text-slate-700 sm:text-sm'>
                  {getLocalizedName(category.name)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className='border-b border-slate-200 p-4'>
          <h4 className='theme-text-strong mb-3 text-sm font-semibold'>Tags</h4>
          <div className='space-y-1 max-h-80 overflow-y-auto'>
            {tags.map((tag) => (
              <label
                key={tag.id}
                className='flex min-h-[44px] cursor-pointer items-center rounded-md p-3 transition-colors hover:bg-slate-50 active:bg-slate-100 touch-manipulation'
              >
                <input
                  type='checkbox'
                  checked={selectedTags.includes(tag.slug)}
                  onChange={() => handleTagToggle(tag.slug)}
                  className='h-5 w-5 rounded border-slate-300 text-cyan-700 focus:ring-2 focus:ring-cyan-500'
                />
                <span className='ml-3 flex-1 text-base text-slate-700 sm:text-sm'>
                  {getLocalizedName(tag.name)}
                </span>
                <span className='text-sm text-slate-500 sm:text-xs'>({tag.count})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className='p-4'>
          <h4 className='theme-text-strong mb-3 text-sm font-semibold'>Pricing</h4>
          <div className='space-y-1'>
            {[
              { value: 'free', label: 'Free' },
              { value: 'freemium', label: 'Freemium' },
              { value: 'paid', label: 'Paid' },
            ].map((option) => (
              <label
                key={option.value}
                className='flex min-h-[44px] cursor-pointer items-center rounded-md p-3 transition-colors hover:bg-slate-50 active:bg-slate-100 touch-manipulation'
              >
                <input
                  type='radio'
                  name='pricing'
                  checked={selectedPricing === option.value}
                  onChange={() => handlePricingChange(option.value)}
                  className='h-5 w-5 border-slate-300 text-cyan-700 focus:ring-2 focus:ring-cyan-500'
                />
                <span className='ml-3 text-base text-slate-700 sm:text-sm'>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
