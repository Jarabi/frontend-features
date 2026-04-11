# Search + Infinite Scroll Feature

## Overview

This React example combines **debounced search**, **keyboard shortcuts**, **cached results**, **search query history**, and **infinite scroll**. It fetches paginated post data from JSONPlaceholder and only performs network requests after the user pauses typing.

Key improvements in this implementation:
- Debounced input handling with a 300ms delay
- Request cancellation using `AbortController`
- Keyboard shortcuts for focusing and clearing the search box
- Result caching and query history display
- Infinite scroll for loading additional pages automatically
- Text highlighting for matched query terms

## Keyboard Shortcuts

The search input supports:
- `Ctrl+K` / `⌘K`: focus the search field
- `/` : focus the search field when not typing in another input
- `Esc`: clear the search term and reset to default post feed

These shortcuts are implemented in `src/App.jsx` via a `keydown` window listener.

## Cached Results & Search History

Search results are cached per query and page using a simple cache object in state. This means repeated queries or paginated pages can reuse previously loaded data without refetching.

The UI also shows a cached query history list, derived from stored cache keys, to surface recent saved searches.

## Search + Infinite Scroll

The app starts with an empty state showing no posts. When a search term is present, it requests paginated search results from JSONPlaceholder. The default paginated feed is only loaded after the user clears the query or presses Escape in the search input (as implemented in `src/App.jsx`'s `handleSearchChange` and keyboard shortcut handlers).

Infinite scroll is driven by an `IntersectionObserver` watching the last result item and fetching the next page when it becomes visible.

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

The app uses `PAGE_SIZE = 10` and appends results to the list until no more items remain.

## Customization

### Debounce Delay

**Location**: `src/App.jsx` inside the `handleSearchChange` function.

**Default**: `300` milliseconds

**To change**:
```jsx
debounceTimerRef.current = setTimeout(() => {
  resetAndSearch(value);
}, 500); // change 300 to any delay in ms
```

Recommended values:
- `150-200ms`: faster response, more requests
- `300ms`: balanced responsiveness
- `500-1000ms`: slower requests, better for heavy APIs

### Search Configuration

- Change `API_BASE` in `src/App.jsx` to use a different API
- Adjust `PAGE_SIZE` in `src/App.jsx` to change page size for infinite scrolling
- Modify the cache key logic in `getCacheKey` if the API query format changes

