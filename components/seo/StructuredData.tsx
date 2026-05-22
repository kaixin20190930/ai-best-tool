/**
 * StructuredData Component
 * Safely injects JSON-LD structured data into page head
 * Supports multiple schemas per page
 */

'use client';

import { validateSchema, combineSchemas } from '@/lib/seo';

export interface StructuredDataProps {
  data: object | object[];
}

/**
 * StructuredData Component
 * Renders JSON-LD structured data script tag
 *
 * @param props - Component props with schema data
 * @returns Script element with JSON-LD data
 */
export function StructuredData({ data }: StructuredDataProps): JSX.Element | null {
  // Handle array of schemas
  const schemas = Array.isArray(data) ? data : [data];

  // Validate and filter schemas
  const validSchemas = combineSchemas(schemas);

  // Don't render if no valid schemas
  if (validSchemas.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('StructuredData: No valid schemas provided');
    }
    return null;
  }

  // If single schema, render as object; if multiple, render as array
  const jsonLd = validSchemas.length === 1 ? validSchemas[0] : validSchemas;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd, null, process.env.NODE_ENV === 'development' ? 2 : 0),
      }}
    />
  );
}

/**
 * Server-side StructuredData Component
 * For use in server components (doesn't use 'use client')
 *
 * @param props - Component props with schema data
 * @returns Script element with JSON-LD data
 */
export function StructuredDataServer({ data }: StructuredDataProps): JSX.Element | null {
  // Handle array of schemas
  const schemas = Array.isArray(data) ? data : [data];

  // Validate and filter schemas
  const validSchemas = combineSchemas(schemas);

  // Don't render if no valid schemas
  if (validSchemas.length === 0) {
    return null;
  }

  // If single schema, render as object; if multiple, render as array
  const jsonLd = validSchemas.length === 1 ? validSchemas[0] : validSchemas;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}

/**
 * Hook to validate structured data before rendering
 * Useful for debugging and development
 *
 * @param data - Schema data to validate
 * @returns Validation result with errors if any
 */
export function useStructuredDataValidation(data: object | object[]): {
  isValid: boolean;
  errors: string[];
} {
  const schemas = Array.isArray(data) ? data : [data];
  const errors: string[] = [];

  schemas.forEach((schema, index) => {
    if (!validateSchema(schema)) {
      errors.push(`Schema at index ${index} is invalid: missing @context or @type`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Helper component to render multiple structured data schemas
 * Provides a cleaner API for pages with multiple schemas
 *
 * @param props - Component props with array of schemas
 * @returns Multiple script elements
 */
export function MultipleStructuredData({
  schemas,
}: {
  schemas: object[];
}): JSX.Element | null {
  if (!schemas || schemas.length === 0) {
    return null;
  }

  return <StructuredData data={schemas} />;
}

/**
 * Utility function to safely stringify JSON-LD
 * Handles circular references and other edge cases
 *
 * @param data - Data to stringify
 * @returns Stringified JSON or null if error
 */
export function safeStringifyJsonLd(data: object | object[]): string | null {
  try {
    const schemas = Array.isArray(data) ? data : [data];
    const validSchemas = combineSchemas(schemas);

    if (validSchemas.length === 0) {
      return null;
    }

    const jsonLd = validSchemas.length === 1 ? validSchemas[0] : validSchemas;
    return JSON.stringify(jsonLd);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error stringifying JSON-LD:', error);
    }
    return null;
  }
}
