import React from 'react';

/**
 * Robust, safe icon renderer that prevents React runtime error:
 * "Objects are not valid as a React child (found: object with keys {$$typeof, render})"
 *
 * Supports:
 * - React elements: `<Icon className="w-5 h-5" />`
 * - React components (Lucide icons, forwardRef, function/class components): `IconComponent`
 * - Primitive values (emoji strings, numbers): `"🏺"`
 * - Safely returns null if undefined, null, or an invalid non-renderable object is passed.
 */
export function renderIcon(
  icon?: React.ElementType | React.ReactNode,
  defaultClassName?: string,
  extraProps?: Record<string, unknown>
): React.ReactNode {
  if (!icon) return null;

  // 1. If it's already a valid rendered React element (e.g. <Sparkles className="..." />)
  if (React.isValidElement(icon)) {
    return icon;
  }

  // 2. If it's a React component (Function Component, Class Component, or ForwardRef like Lucide icons)
  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && '$$typeof' in icon)
  ) {
    const IconComponent = icon as React.ElementType;
    return (
      <IconComponent
        className={defaultClassName}
        aria-hidden="true"
        {...extraProps}
      />
    );
  }

  // 3. If it's a text/number primitive (e.g., emoji string)
  if (typeof icon === 'string' || typeof icon === 'number') {
    return <span>{icon}</span>;
  }

  // 4. Defensive guard: never allow a raw object to reach React JSX child reconciliation
  return null;
}
