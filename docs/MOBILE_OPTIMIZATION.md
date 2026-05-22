# Mobile Optimization Guide

## Overview

This application is optimized for mobile devices with responsive design, touch-friendly interactions, and performance optimizations. This guide covers the mobile-specific features and best practices implemented.

## Responsive Design

### Breakpoints

The application uses Tailwind CSS breakpoints:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### Mobile-First Approach

All styles are written mobile-first, with larger screens as progressive enhancements:

```tsx
// Mobile: base styles
// Tablet: sm: prefix
// Desktop: lg: prefix
<div className='p-4 sm:p-6 lg:p-8'>
  <h1 className='text-2xl sm:text-3xl lg:text-4xl'>Title</h1>
</div>
```

## Touch Optimization

### Touch Target Sizes

All interactive elements meet the minimum touch target size of 44x44px:

```tsx
// Buttons with proper touch targets
<button className='min-h-[44px] px-6 py-3 touch-manipulation'>
  Click Me
</button>

// Checkbox/Radio inputs
<input className='w-5 h-5' type='checkbox' />

// Links with adequate padding
<a className='p-3 inline-block'>Link</a>
```

### Touch Manipulation

The `touch-manipulation` CSS property is used to disable double-tap zoom on interactive elements:

```tsx
<button className='touch-manipulation'>
  Fast Click
</button>
```

### Active States

Mobile-specific active states provide visual feedback:

```tsx
<button className='hover:bg-blue-700 active:bg-blue-800'>
  Button
</button>

<div className='hover:bg-gray-50 active:bg-gray-100'>
  Card
</div>
```

## Component Optimizations

### Search Component

**Mobile Enhancements:**
- Larger input field (py-3 on mobile vs py-2 on desktop)
- Larger text (text-base on mobile vs text-sm on desktop)
- Full-width button on mobile
- Larger touch targets for suggestions
- Better spacing for thumb reach

```tsx
<input className='py-3 text-base sm:py-2 sm:text-sm' />
<button className='w-full py-3 sm:w-auto sm:py-2' />
```

### Filter Panel

**Mobile Enhancements:**
- Collapsible on mobile, always visible on desktop
- Larger checkboxes and radio buttons (w-5 h-5)
- Increased padding for touch targets (p-3)
- Larger text on mobile (text-base vs text-sm)
- Scrollable tag list with max height
- Clear visual feedback on active states

```tsx
<div className='lg:block hidden'>
  {/* Always visible on desktop */}
</div>

<button className='lg:hidden' onClick={toggleExpand}>
  {/* Mobile toggle button */}
</button>
```

### Navigation

**Mobile Enhancements:**
- Hamburger menu for mobile
- Drawer navigation with smooth transitions
- Touch-friendly menu items
- Proper z-index layering

### Tool Cards

**Mobile Enhancements:**
- 2-column grid on mobile, 3-column on desktop
- Responsive image sizing
- Touch-friendly favorite and rating buttons
- Optimized text truncation

```tsx
<div className='grid grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-7'>
  {tools.map(tool => <ToolCard key={tool.id} {...tool} />)}
</div>
```

### Tool Detail Page

**Mobile Enhancements:**
- Single column layout on mobile
- Stacked hero section
- Responsive image gallery
- Touch-friendly lightbox
- Collapsible sections for long content
- Optimized comment input

## Performance Optimizations

### Image Loading

**Mobile-Specific:**
- Smaller image sizes for mobile devices
- Lazy loading for below-the-fold images
- Priority loading for hero images
- Responsive image sizes

```tsx
<BaseImage
  src={imageUrl}
  alt='Tool screenshot'
  width={350}
  height={220}
  sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 350px'
  loading='lazy'
  priority={false}
/>
```

### Code Splitting

Dynamic imports for heavy components:

```tsx
import dynamic from 'next/dynamic';

const ScrollToTop = dynamic(() => import('@/components/page/ScrollToTop'), {
  ssr: false
});
```

### Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Mobile-Specific Features

### Pull-to-Refresh

Consider implementing pull-to-refresh for list pages:

```tsx
'use client';

import { useState } from 'react';

export function PullToRefresh({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [pulling, setPulling] = useState(false);
  
  // Implementation details...
}
```

### Infinite Scroll

For better mobile UX, consider infinite scroll instead of pagination:

```tsx
'use client';

import { useInView } from 'react-intersection-observer';

export function InfiniteScroll() {
  const { ref, inView } = useInView();
  
  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);
  
  return <div ref={ref}>Loading...</div>;
}
```

### Bottom Sheet

For mobile filters and actions:

```tsx
'use client';

export function BottomSheet({ open, onClose, children }) {
  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform ${
      open ? 'translate-y-0' : 'translate-y-full'
    }`}>
      {children}
    </div>
  );
}
```

## Accessibility

### Mobile Accessibility

**ARIA Labels:**
```tsx
<button aria-label='Open menu' className='lg:hidden'>
  <MenuIcon />
</button>
```

**Focus Management:**
```tsx
// Trap focus in mobile menu
import { FocusTrap } from '@headlessui/react';

<FocusTrap>
  <nav>{/* Menu items */}</nav>
</FocusTrap>
```

**Screen Reader Support:**
```tsx
<div className='sr-only'>
  Navigation menu
</div>
```

## Testing

### Mobile Testing Checklist

- [ ] Test on real devices (iOS and Android)
- [ ] Test in Chrome DevTools mobile emulation
- [ ] Test touch interactions (tap, swipe, pinch)
- [ ] Test with different screen sizes
- [ ] Test in landscape and portrait orientations
- [ ] Test with slow network (3G)
- [ ] Test with reduced motion enabled
- [ ] Test with screen readers (VoiceOver, TalkBack)
- [ ] Test form inputs and keyboards
- [ ] Test scroll performance

### Device Testing

**Recommended Test Devices:**
- iPhone SE (small screen)
- iPhone 14 Pro (standard)
- iPhone 14 Pro Max (large)
- Samsung Galaxy S21 (Android)
- iPad (tablet)

### Performance Testing

Use Lighthouse mobile audit:

```bash
# Run Lighthouse mobile audit
npx lighthouse https://your-site.com --preset=mobile --view
```

**Target Metrics:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

## Common Mobile Issues

### Issue: Text Too Small

**Solution:**
```tsx
// Use larger base font size on mobile
<p className='text-base sm:text-sm'>Content</p>
```

### Issue: Buttons Too Small

**Solution:**
```tsx
// Ensure minimum 44x44px touch target
<button className='min-h-[44px] px-6 py-3'>Button</button>
```

### Issue: Horizontal Scroll

**Solution:**
```tsx
// Prevent overflow
<div className='max-w-full overflow-x-hidden'>
  <div className='w-full'>Content</div>
</div>
```

### Issue: Viewport Not Responsive

**Solution:**
```html
<!-- Ensure viewport meta tag in layout -->
<meta name='viewport' content='width=device-width, initial-scale=1' />
```

### Issue: Fixed Elements Covering Content

**Solution:**
```tsx
// Add padding to account for fixed header
<main className='pt-16'> {/* Header height */}
  Content
</main>
```

### Issue: Slow Scroll Performance

**Solution:**
```tsx
// Use CSS containment
<div className='contain-layout contain-paint'>
  {/* Scrollable content */}
</div>
```

## Best Practices

### 1. Design for Thumbs

Place important actions within thumb reach (bottom of screen):

```tsx
<div className='fixed bottom-0 inset-x-0 p-4 bg-white border-t'>
  <button className='w-full'>Primary Action</button>
</div>
```

### 2. Minimize Input

Use appropriate input types and autocomplete:

```tsx
<input
  type='email'
  autoComplete='email'
  inputMode='email'
/>

<input
  type='tel'
  autoComplete='tel'
  inputMode='tel'
/>
```

### 3. Progressive Disclosure

Show essential content first, hide details in expandable sections:

```tsx
<details className='lg:open'>
  <summary>More Details</summary>
  <div>Hidden content</div>
</details>
```

### 4. Optimize Forms

- Use native form controls
- Provide clear labels
- Show validation errors inline
- Use appropriate keyboards
- Enable autofill

```tsx
<form>
  <label htmlFor='email' className='block mb-2'>
    Email
  </label>
  <input
    id='email'
    type='email'
    autoComplete='email'
    className='w-full'
  />
</form>
```

### 5. Handle Orientation Changes

```tsx
'use client';

import { useEffect, useState } from 'react';

export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };
    
    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);
  
  return orientation;
}
```

## Resources

- [Web.dev Mobile Guide](https://web.dev/mobile/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Mobile](https://material.io/design/platform-guidance/android-mobile.html)
- [Touch Target Sizes](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile Performance](https://web.dev/fast/)
