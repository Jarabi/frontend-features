# Toast Notifications

## Overview

A production-grade React toast notification system with smooth animations, accessibility features, and comprehensive customization options. Built with React Context API and optimized for performance with proper timeout management and memory leak prevention.

## Production Features Checklist

- ✅ **Multiple toast types**: Success, error, warning, info with icons
- ✅ **Auto-close**: Configurable duration with progress bar
- ✅ **Manual close**: Close button on each toast
- ✅ **Stacking**: Multiple toasts appear stacked
- ✅ **Position options**: 6 different positions
- ✅ **Smooth animations**: Enter/exit animations
- ✅ **Accessibility**: ARIA labels and roles
- ✅ **Responsive**: Works on mobile
- ✅ **Reduced motion**: Respects user preferences
- ✅ **No external deps**: Pure React implementation

## Features

- **Context-based API**: Clean React Context implementation for global toast management
- **TypeScript-ready**: Fully typed with proper interfaces
- **Timeout management**: Proper cleanup of auto-dismiss timers to prevent memory leaks
- **Keyboard navigation**: Full keyboard accessibility support
- **Theme customization**: Easy styling with CSS custom properties
- **Promise support**: Toast promises for async operations
- **Queue management**: Intelligent toast queuing and stacking
- **Performance optimized**: Minimal re-renders with proper memoization

## Toast Types

| Type | Icon | Use Case |
|------|------|----------|
| **Success** | ✅ | Confirm successful operations |
| **Error** | ❌ | Display error messages |
| **Warning** | ⚠️ | Show warnings or cautions |
| **Info** | ℹ️ | General information |

## Position Options

- `top-left`
- `top-center`
- `top-right` (default)
- `bottom-left`
- `bottom-center`
- `bottom-right`

## Getting Started

### Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to see the toast demo.

### Build for Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

## Usage

### Basic Usage

```jsx
import { useToast } from './context/useToast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

### Advanced Usage

```jsx
// Custom duration
toast.info('This will auto-close in 10 seconds', 10000);

// Promise-based toasts
const result = await toast.promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data'
  }
);
```

## API Reference

### useToast Hook

```typescript
interface ToastHook {
  // Basic methods
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;

  // Advanced methods
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  setToastPosition: (position: ToastPosition) => void;

  // State
  toasts: Toast[];
  position: ToastPosition;
}
```

### ToastProvider Props

```typescript
interface ToastProviderProps {
  children: React.ReactNode;
  defaultPosition?: ToastPosition;
  maxToasts?: number;
}
```

## Customization

### Styling

The component uses CSS custom properties for easy theming:

```css
:root {
  --toast-bg: #ffffff;
  --toast-border: #e2e8f0;
  --toast-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  --toast-radius: 8px;
  --toast-success: #10b981;
  --toast-error: #ef4444;
  --toast-warning: #f59e0b;
  --toast-info: #3b82f6;
}
```

### Position Configuration

```jsx
<ToastProvider defaultPosition="bottom-right">
  <App />
</ToastProvider>
```

Or dynamically:

```jsx
const toast = useToast();
toast.setToastPosition('top-center');
```

## File Structure

```
src/
  context/
    ToastContext.jsx      # Main provider component
    toastContext.js       # React context creation
    toastConstants.js     # Toast types and constants
    useToast.js          # Custom hook
  components/
    Toast.jsx            # Individual toast component
    ToastContainer.jsx   # Container for positioning toasts
  App.jsx                # Demo application
```

## Accessibility

- Full ARIA support with proper roles and labels
- Keyboard navigation support
- Screen reader announcements
- Focus management
- Reduced motion support via `prefers-reduced-motion`

## Performance

- Proper timeout cleanup prevents memory leaks
- Minimal re-renders with React.memo and useCallback
- Efficient toast stacking and positioning
- No external dependencies for smaller bundle size

## Browser Support

- Modern browsers with React 18+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## How It Works

1. **Initial Load**: App shows empty state (no posts displayed)
2. **Search or Reset**: Type in search box or press Escape to load posts
3. **Skeleton Display**: While fetching, layout-specific skeletons render with shimmer
4. **Content Replace**: Once data arrives, skeletons are replaced with real content
5. **Infinite Scroll**: Scroll down; Intersection Observer detects sentinel and auto-fetches next page
6. **Cache Hit**: Returning to previously searched term uses cached results instantly

## API Endpoint

**Base URL**: `https://jsonplaceholder.typicode.com/posts`

**Search request**:
```bash
GET https://jsonplaceholder.typicode.com/posts?q=quis&_page=1&_limit=10
```

**Regular feed request**:
```bash
GET https://jsonplaceholder.typicode.com/posts?_page=1&_limit=10
```

## Skeleton Components

Located in `src/components/Skeletons.jsx` and `src/components/AdvancedSkeletons.jsx`:

- **Basic Skeletons**: `Skeleton`, `SkeletonText`, `SkeletonImage`, `SkeletonAvatar`
- **Simple Layouts**: `SkeletonGrid`, `SkeletonListItem`, `SkeletonProfile`
- **Advanced Layouts**: `SkeletonDashboard`, `SkeletonProductPage`, `SkeletonFeed`

Each uses a CSS gradient animation for the shimmer effect defined in `src/components/Skeletons.css`.

## Customization

### Change Debounce Delay

**Location**: `src/App.jsx` in `handleSearchChange` function (line ~268)

**Default**: `300` ms

```jsx
debounceTimerRef.current = setTimeout(() => {
  resetAndSearch(value);
}, 500); // adjust delay here
```

### Adjust Cache Size

**Location**: `src/App.jsx` (line ~12)

```jsx
const MAX_CACHE_ENTRIES = 20; // change to desired limit
```

### Change API Endpoint

**Location**: `src/App.jsx` (line ~10)

```jsx
const API_BASE = 'https://your-api.com/posts';
```

### Modify Page Size

**Location**: `src/App.jsx` (line ~11)

```jsx
const PAGE_SIZE = 10; // change items per request
```

## File Structure

```text
src/
  App.jsx               # Main component with search, cache, infinite scroll
  App.css               # Styles for layouts and skeletons
  components/
    Skeletons.jsx       # Basic skeleton building blocks
    Skeletons.css       # Shimmer animation and skeleton styles
    AdvancedSkeletons.jsx # Composed skeletons for complex layouts
```

## Testing the Skeletons

1. Open DevTools → Network tab
2. Throttle network to "Slow 3G" or "Offline"
3. Switch layouts using buttons
4. Watch skeletons animate while loading
5. Restore connection to see content appear