# Toast Notifications

## Overview

A production-grade React component demonstrating **loading skeleton animations** across multiple layout types (Blog, Dashboard, Product Page, Social Feed). The app combines skeleton loaders with debounced search, infinite scroll pagination, request cancellation, and result caching.

While content is loading, contextual skeleton components render shimmer animations that match each layout's visual hierarchy. Once data arrives, the skeletons are replaced with real content seamlessly.

## Features

- **Multiple Skeleton Layouts**: Specialized skeleton components for blog cards, dashboards, product pages, and social feeds
- **Shimmer Animation**: CSS-based gradient animation for realistic loading states
- **Debounced Search**: 300ms delay before API calls to reduce unnecessary requests
- **Infinite Scroll**: Automatic pagination when scrolling to bottom using Intersection Observer
- **Request Cancellation**: `AbortController` cancels stale requests when new ones are triggered
- **LRU Cache**: Bounded cache (max 20 entries) with least-recently-used eviction policy
- **Layout Switcher**: Toggle between different UI layouts to see appropriate skeleton states
- **Keyboard Shortcuts**: `Ctrl+K`/`⌘K`, `/`, and `Esc` for quick search interaction
- **Text Highlighting**: Search terms highlighted in results
- **Query History**: Recent cached searches displayed in UI

## Layout Types

The app displays four different layout variants, each with a corresponding skeleton loader:

| Layout | Skeleton | Real Content |
|--------|----------|--------------|
| **Blog** | `SkeletonGrid` | Grid of article cards with title, excerpt |
| **Dashboard** | `SkeletonDashboard` | Stat cards + recent items list |
| **Product** | `SkeletonProductPage` | Product gallery + info column with CTA |
| **Social** | `SkeletonFeed` | Social posts with avatars, content, actions |

## Getting Started

### Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

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