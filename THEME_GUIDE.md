# 🎨 Theme & Color Guide

## Blue & Black Professional Theme

### Color Palette Reference

#### Primary Colors

```css
/* Blue Shades */
--primary-blue: #0066cc /* Main brand color */ --primary-blue-light: #3399ff
  /* Hover states, accents */ --primary-blue-dark: #004099
  /* Deep blue for emphasis */ /* Black Shades */ --primary-black: #1a1a1a
  /* Primary text, headers */ --secondary-black: #2d2d2d
  /* Secondary elements */;
```

#### Light Mode Colors

```css
/* Backgrounds */
--bg-primary: #ffffff /* Main background */ --bg-secondary: #f5f7fa
  /* Section backgrounds */ --bg-card: #ffffff /* Card backgrounds */
  --bg-hover: #e8f4ff /* Hover effects */ /* Text */ --text-primary: #1a1a1a
  /* Main text */ --text-secondary: #4a4a4a /* Secondary text */
  --text-muted: #6b7280 /* Muted/helper text */ /* Borders */
  --border-color: #e0e7ff /* Default borders */ --border-hover: #0066cc
  /* Active/focused borders */;
```

#### Dark Mode Colors

```css
/* Backgrounds */
--bg-primary: #0a0a0a /* Main background */ --bg-secondary: #1a1a1a
  /* Section backgrounds */ --bg-card: #1f1f1f /* Card backgrounds */
  --bg-hover: #2a2a2a /* Hover effects */ /* Text */ --text-primary: #ffffff
  /* Main text */ --text-secondary: #e0e0e0 /* Secondary text */
  --text-muted: #9ca3af /* Muted/helper text */ /* Borders */
  --border-color: #333333 /* Default borders */ --border-hover: #3399ff
  /* Active/focused borders */;
```

#### Status Colors (Both Modes)

```css
--success: #10b981 /* Green - success states */ --warning: #f59e0b
  /* Orange - warnings */ --error: #ef4444 /* Red - errors */ --info: #3b82f6
  /* Blue - information */;
```

#### Shadows

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1) --shadow-md: 0 4px 6px
  rgba(0, 0, 0, 0.1) --shadow-lg: 0 10px 20px rgba(0, 102, 204, 0.15);
```

---

## Usage Examples

### Component Styling

```css
.my-component {
  /* Use theme variables for automatic dark mode support */
  background-color: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: var(--transition);
}

.my-component:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-lg);
}
```

### Button Styles

```css
.btn-primary {
  background: linear-gradient(
    135deg,
    var(--primary-blue),
    var(--primary-blue-dark)
  );
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--primary-blue);
  color: var(--primary-blue);
}

.btn-outline:hover {
  background: var(--primary-blue);
  color: white;
}
```

### Card Components

```css
.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--primary-blue);
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}
```

### Status Badges

```css
.badge-success {
  background: var(--success);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-warning {
  background: var(--warning);
  color: white;
}

.badge-error {
  background: var(--error);
  color: white;
}

.badge-info {
  background: var(--info);
  color: white;
}
```

---

## Theme Toggle Implementation

### React Context

```javascript
import { useTheme } from "./context/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div>
      <button onClick={toggleTheme}>
        {isDark ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
      </button>
    </div>
  );
}
```

### Direct CSS Application

```javascript
// Manually set theme
document.documentElement.setAttribute("data-theme", "dark");

// Read current theme
const currentTheme = document.documentElement.getAttribute("data-theme");
```

---

## Design Principles

### 1. Contrast & Readability

- **Light Mode**: Dark text on light backgrounds
- **Dark Mode**: Light text on dark backgrounds
- Minimum contrast ratio: 4.5:1 for normal text
- 3:1 for large text (18px+ or 14px+ bold)

### 2. Consistency

- Use theme variables everywhere
- Avoid hardcoded colors
- Maintain consistent spacing and sizing

### 3. Hierarchy

```css
/* Primary Actions */
background: var(--primary-blue);
box-shadow: var(--shadow-lg);

/* Secondary Actions */
background: var(--secondary-black);
box-shadow: var(--shadow-md);

/* Tertiary Actions */
background: transparent;
border: 1px solid var(--border-color);
```

### 4. Transitions

```css
/* Standard transition for most elements */
transition: var(--transition);

/* Smooth transitions */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Component-Specific Colors

### Navbar

```css
.navbar {
  background: linear-gradient(
    135deg,
    var(--primary-blue),
    var(--primary-black)
  );
  color: white;
  box-shadow: var(--shadow-md);
}
```

### Dashboard Cards

```css
.stat-card {
  border-left: 4px solid var(--primary-blue);
}

.stat-card.stat-success {
  border-left-color: var(--success);
}

.stat-card.stat-warning {
  border-left-color: var(--warning);
}
```

### Event Status

```css
.status-upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.status-ongoing {
  background: #fff3e0;
  color: #f57c00;
}

.status-completed {
  background: #e8f5e9;
  color: #388e3c;
}

.status-cancelled {
  background: #ffebee;
  color: #d32f2f;
}
```

### Approval Status

```css
.approval-pending {
  background: #fff3e0;
  color: #f57c00;
}

.approval-approved {
  background: #e8f5e9;
  color: #388e3c;
}

.approval-rejected {
  background: #ffebee;
  color: #d32f2f;
}
```

---

## Accessibility

### Focus States

```css
.btn:focus,
.input:focus {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}
```

### High Contrast Mode Support

```css
@media (prefers-contrast: high) {
  :root {
    --border-color: #000000;
    --text-muted: var(--text-secondary);
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small devices (phones, 640px and up) */
@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

/* Extra large devices (large desktops, 1280px and up) */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

---

## Animation Library

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

### Slide In

```css
@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn 0.4s ease-out;
}
```

### Pulse (for badges)

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.pulse {
  animation: pulse 2s infinite;
}
```

### Spin (for loaders)

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

---

## Best Practices

### ✅ DO

- Use CSS variables for all colors
- Apply consistent spacing (multiples of 4px: 4, 8, 12, 16, 24, 32, etc.)
- Test both light and dark modes
- Ensure sufficient contrast
- Use semantic color names

### ❌ DON'T

- Hardcode color values
- Mix different color systems
- Forget hover/focus states
- Ignore accessibility
- Use overly bright colors in dark mode

---

## Quick Reference

### Common Patterns

```css
/* Card with hover effect */
.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

/* Section header */
.section-header {
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-muted);
}

/* Loading spinner */
.spinner {
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}
```

---

**Tip**: Always test your components in both light and dark modes to ensure they look professional in all scenarios!
