# Image Alt Text Guidelines

## Overview

This document provides guidelines for writing effective alt text for images across the AI Best Tool platform. Proper alt text improves accessibility, SEO, and user experience.

## Requirements

- **Requirement 7.2**: All images must include descriptive alt attributes with relevant keywords
- **Requirement 6.4**: Images should use descriptive alt attributes and optimized file formats

## General Principles

### 1. Be Descriptive and Specific

**Good:**
```tsx
<BaseImage 
  src="/tool-screenshot.png" 
  alt="ChatGPT interface showing conversation with AI assistant"
/>
```

**Bad:**
```tsx
<BaseImage 
  src="/tool-screenshot.png" 
  alt="screenshot"
/>
```

### 2. Include Relevant Keywords Naturally

**Good:**
```tsx
<BaseImage 
  src="/logo.svg" 
  alt="AI Best Tool logo - discover and explore AI tools"
/>
```

**Bad:**
```tsx
<BaseImage 
  src="/logo.svg" 
  alt="AI tools AI directory AI best tool logo"
/>
```

### 3. Avoid Redundant Phrases

Don't use phrases like "image of", "picture of", or "graphic of" - screen readers already announce it's an image.

**Good:**
```tsx
<BaseImage 
  src="/dashboard.png" 
  alt="Analytics dashboard showing user engagement metrics"
/>
```

**Bad:**
```tsx
<BaseImage 
  src="/dashboard.png" 
  alt="Image of analytics dashboard showing user engagement metrics"
/>
```

### 4. Context Matters

The alt text should describe the image's purpose in context, not just what it shows.

**Good (for a clickable tool card):**
```tsx
<BaseImage 
  src="/midjourney.png" 
  alt="Midjourney - AI image generation tool preview"
/>
```

**Good (for a decorative icon):**
```tsx
<Icon 
  src="/check.svg" 
  alt="Success indicator"
/>
```

## Component-Specific Guidelines

### BaseImage Component

The `BaseImage` component automatically generates alt text from the filename if none is provided, but you should always provide explicit alt text:

```tsx
// ✅ Explicit alt text (preferred)
<BaseImage 
  src="/tool-preview.png" 
  alt="Tool interface showing main features and dashboard"
  title="Tool Preview"
/>

// ⚠️ Fallback to title (acceptable)
<BaseImage 
  src="/tool-preview.png" 
  title="Tool Preview"
/>

// ❌ No alt text (will use filename as fallback)
<BaseImage 
  src="/tool-preview.png" 
/>
```

### Icon Component

For icons, provide context about what the icon represents:

```tsx
// ✅ Good
<Icon 
  src="/icons/global.svg" 
  alt="Language selector icon"
  title="Change language"
/>

// ❌ Bad
<Icon 
  src="/icons/global.svg" 
  alt="icon"
/>
```

### Tool Cards (WebNavCard)

Tool card images should include the tool name and indicate it's a preview:

```tsx
<BaseImage
  src={thumbnailUrl}
  alt={`${toolName} - AI tool screenshot and preview`}
  title={toolName}
/>
```

### Tool Detail Pages

Main tool images should be descriptive and include keywords:

```tsx
<BaseImage
  src={thumbnailUrl}
  alt={`${toolName} - AI tool interface preview and main features`}
  title={toolName}
/>
```

### Media Gallery

Screenshots in galleries should be numbered and descriptive:

```tsx
// Thumbnail
<BaseImage
  src={screenshot}
  alt={`${toolName} - screenshot ${index + 1} showing features and interface`}
/>

// Lightbox
<BaseImage
  src={screenshot}
  alt={`${toolName} - detailed screenshot ${index + 1} showing features and interface`}
/>
```

### Logo Images

Logos should include brand name and purpose:

```tsx
// Logo icon
<BaseImage
  src="/images/aitools.svg"
  alt="AI Best Tool logo icon - discover and explore AI tools"
/>

// Logo wordmark
<BaseImage
  src="/images/Aileron.svg"
  alt="AI Best Tool wordmark - your AI tools directory"
/>
```

## Alt Text Length Guidelines

- **Minimum**: 5 characters (avoid single words)
- **Optimal**: 50-125 characters
- **Maximum**: 250 characters (screen readers may cut off longer text)

## SEO Considerations

### Include Keywords

Naturally incorporate relevant keywords that users might search for:

- Tool names
- Tool categories (e.g., "AI image generator", "chatbot", "writing assistant")
- Features (e.g., "dashboard", "interface", "analytics")
- Use cases (e.g., "content creation", "data analysis")

### Avoid Keyword Stuffing

Don't repeat keywords or create unnatural phrases just for SEO.

**Good:**
```tsx
alt="Notion AI workspace showing collaborative document editing features"
```

**Bad:**
```tsx
alt="Notion AI Notion workspace AI tool AI collaboration AI documents AI"
```

## Decorative Images

For purely decorative images that don't convey information, use an empty alt attribute:

```tsx
<BaseImage 
  src="/decorative-pattern.svg" 
  alt=""
  role="presentation"
/>
```

However, most images on AI Best Tool serve a functional purpose and should have descriptive alt text.

## Testing Alt Text

### Manual Testing

1. Use a screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate to images and listen to how alt text is announced
3. Ensure the description makes sense without seeing the image

### Automated Testing

Run the audit script to check for missing or poor alt text:

```bash
npx tsx scripts/audit-image-alt-attributes.ts
```

### Validation Checklist

- [ ] Alt text is present for all images
- [ ] Alt text is descriptive and specific
- [ ] Alt text includes relevant keywords naturally
- [ ] Alt text doesn't use redundant phrases
- [ ] Alt text is appropriate length (50-125 characters optimal)
- [ ] Alt text makes sense in context
- [ ] Decorative images have empty alt attributes

## Examples by Use Case

### Tool Listing Page

```tsx
<BaseImage
  src={tool.thumbnailUrl}
  alt={`${tool.name} - ${tool.category} AI tool preview`}
  width={350}
  height={220}
/>
```

### Tool Detail Page Hero

```tsx
<BaseImage
  src={tool.thumbnailUrl}
  alt={`${tool.name} - AI ${tool.category} interface showing main features and dashboard`}
  fill
/>
```

### Feature Screenshots

```tsx
<BaseImage
  src={screenshot}
  alt={`${tool.name} ${feature.name} feature - ${feature.description}`}
/>
```

### User Profile Images

```tsx
<BaseImage
  src={user.avatar}
  alt={`${user.name} profile picture`}
/>
```

### Category Icons

```tsx
<Icon
  src={category.icon}
  alt={`${category.name} category icon`}
/>
```

## Common Mistakes to Avoid

1. ❌ Using filename as alt text: `alt="img_1234.png"`
2. ❌ Generic descriptions: `alt="image"`, `alt="icon"`
3. ❌ Redundant phrases: `alt="Picture of ChatGPT"`
4. ❌ Keyword stuffing: `alt="AI tool AI software AI app ChatGPT"`
5. ❌ Too short: `alt="Tool"`
6. ❌ Too long: Alt text over 250 characters
7. ❌ Missing alt text entirely

## Resources

- [WebAIM Alt Text Guide](https://webaim.org/techniques/alttext/)
- [W3C Alt Text Decision Tree](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [Google Image SEO Best Practices](https://developers.google.com/search/docs/appearance/google-images)

## Maintenance

- Review alt text when adding new images
- Run audit script regularly: `npx tsx scripts/audit-image-alt-attributes.ts`
- Update alt text when image content or context changes
- Test with screen readers periodically

## Related Documentation

- [Image Optimization Guide](./IMAGE_OPTIMIZATION.md)
- [SEO Best Practices](../components/seo/README.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)
