# Debounced Search Feature

## Overview

A React component that implements **debounced search** with automatic request cancellation and result highlighting. The search delays API calls by 300ms after the user stops typing to reduce unnecessary requests.

## Debounce Implementation

**Method**: Custom debounce using `setTimeout` and `clearTimeout` with React refs.

**How it works**:
- User input triggers `handleSearchChange`
- Previous timer is cleared, new 300ms timer starts
- Search executes only after user stops typing for 300ms
- Prevents excessive API calls during rapid typing

## API Configuration

**Endpoint**: `https://jsonplaceholder.typicode.com/posts?q={searchTerm}`

**Example Request**:
```bash
GET https://jsonplaceholder.typicode.com/posts?q=quis
```

**Response**: Array of post objects matching the search term in title or body.

## Customization

### Changing Debounce Delay

**Location**: `src/App.jsx`, in the `handleSearchChange` function

**Current**: `300` milliseconds

**To modify**:
```jsx
debounceTimerRef.current = setTimeout(() => {
  performSearch(value);
}, 500); // Change 300 to desired delay in ms
```

**Recommended values**:
- Fast (150-200ms): For instant-feeling interfaces
- Standard (300ms): Good balance of responsiveness vs. API load
- Slow (500-1000ms): For expensive APIs or slower networks
