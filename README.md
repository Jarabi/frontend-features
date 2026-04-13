# Frontend Features

Building production-grade frontend features requires attention to performance, accessibility, error resilience, and a smooth user experience. Below is a structured roadmap that walks you through each feature, explaining the core concepts, step‑by‑step implementation strategies, and the production‑grade considerations you must master.

## Table of Content

* [1. Infinite Scrolling](#1-infinite-scrolling)
    + [Core Concepts](#core-concepts)
        - [Implementation Steps](#implementation-steps)
        - [Production‑Grade Considerations](#production-grade-considerations)
* [2. Debounced Search](#2-debounced-search)
    + [Core Concepts](#core-concepts-1)
        - [Implementation Steps](#implementation-steps-1)
        - [Production‑Grade Considerations](#production-grade-considerations-1)
* [3. Search + Infinite Scroll + Loading Skeletons](#3-search--infinite-scroll--loading-skeletons)
    + [Core Concepts](#core-concepts-2)
        - [Implementation Steps](#implementation-steps-2)
        - [Production‑Grade Considerations](#production-grade-considerations-2)
* [4. Toast Notifications](#4-toast-notifications)
    + [Core Concepts](#core-concepts-3)
        - [Implementation Steps](#implementation-steps-3)
        - [Production‑Grade Considerations](#production-grade-considerations-3)
* [5. Modal Dialogs](#5-modal-dialogs)
    + [Core Concepts](#core-concepts-4)
        - [Implementation Steps](#implementation-steps-4)
        - [Production‑Grade Considerations](#production-grade-considerations-4)
* [6. Drag and Drop](#6-drag-and-drop)
    + [Core Concepts](#core-concepts-5)
        - [Implementation Steps](#implementation-steps-5)
        - [Production‑Grade Considerations](#production-grade-considerations-5)
- [General Production‑Grade Principles for All Features](#general-production-grade-principles-for-all-features)
- [Learning Path Suggestion](#learning-path-suggestion)

## 1. Infinite Scrolling

### Core Concepts

- **Intersection Observer API**: Modern, performant way to detect when elements enter the viewport
- **Sentinel element**: Invisible element at the bottom that triggers loading when visible
- **Request cancellation**: Abort in-flight requests using AbortController
- **Error handling**: Display error messages with manual retry option
- **Loading states**: Visual feedback during data fetching and completion detection

#### Implementation Steps

1. **Set up Intersection Observer**
    - Create observer watching a sentinel element at the bottom of the list
    - Configure threshold (0.1) and rootMargin (100px) for preloading
    - Trigger data fetch when sentinel becomes visible

2. **Fetch paginated data**
    - Maintain page state and increment on each load
    - Use AbortController to cancel previous requests
    - Append new items to existing list without replacement

3. **Handle loading states**
    - Show loading spinner while fetching
    - Display error message with retry button on failure
    - Show completion message when all data is loaded

#### Production‑Grade Considerations

- **Intersection Observer benefits**: Native async API, doesn't block main thread, better performance than scroll listeners
- **Request cancellation**: Prevents race conditions and out-of-order responses
- **Error resilience**: User-friendly error messages with manual retry capability
- **Performance**: Preload data 100px before sentinel enters viewport
- **Accessibility**: Proper ARIA labels and screen reader announcements
- **Edge cases**: Handle empty initial state, network failures, and end-of-data detection

## 2. Debounced Search

### Core Concepts

- **Debounce**: Delay API calls until the user stops typing (300ms default)
- **Request cancellation**: Abort in-flight requests using AbortController
- **Result caching**: Cache search results per query and page to avoid redundant requests
- **Query history**: Display recent cached searches in the UI
- **Keyboard shortcuts**: `Ctrl+K`/`⌘K`, `/`, and `Esc` for search interaction
- **Infinite scroll**: Automatic pagination for search results
- **Text highlighting**: Safe highlighting of matched search terms

#### Implementation Steps

1. **Implement debounced search**
    - Bind input event with 300ms debounce delay
    - Use AbortController to cancel previous requests
    - Cache results per query and page combination

2. **Add keyboard shortcuts**
    - `Ctrl+K`/`⌘K` and `/` to focus search input
    - `Esc` to clear search and reset to default feed
    - Global keydown listener for accessibility

3. **Display query history**
    - Extract cache keys to show recent searches
    - Allow clicking history items to re-run searches
    - Maintain history state across sessions

4. **Handle infinite scroll for search**
    - Use Intersection Observer for pagination
    - Maintain separate page state for search vs. default feed
    - Append new results to existing search results

#### Production‑Grade Considerations

- **Debounce timing**: 300ms balances responsiveness with API efficiency
- **Request deduplication**: Cancel previous requests to prevent race conditions
- **Caching strategy**: Cache per query/page prevents redundant API calls
- **Keyboard accessibility**: Global shortcuts improve UX for power users
- **Text highlighting**: Safe implementation prevents XSS attacks
- **State management**: Separate state for search vs. default feed modes

## 3. Search + Infinite Scroll + Loading Skeletons

### Core Concepts

- **Combined features**: Debounced search, infinite scroll pagination, and contextual loading skeletons
- **Multiple layout types**: Blog cards, dashboard stats, product pages, and social feeds
- **Shimmer animations**: CSS-based gradient animations that match final content structure
- **Layout switching**: Toggle between different UI layouts to see appropriate skeleton states
- **LRU caching**: Bounded cache with least-recently-used eviction for search results

#### Implementation Steps

1. **Debounced search with caching**
    - 300ms debounce delay before API calls
    - Cache search results per query and page
    - Display cached query history in UI

2. **Infinite scroll with Intersection Observer**
    - Automatic pagination when scrolling to bottom
    - Request cancellation for stale requests
    - Append new items to existing results

3. **Contextual skeleton loading**
    - Design skeletons that match each layout's visual hierarchy
    - Show skeletons during initial load and subsequent fetches
    - Seamless transition from skeleton to real content

4. **Layout switching**
    - Toggle between blog, dashboard, product, and social feed layouts
    - Each layout has its own skeleton component
    - Maintain search and scroll state across layout changes

#### Production‑Grade Considerations

- **Skeleton consistency**: Match skeleton dimensions to real content to prevent layout shifts
- **Cache management**: Implement LRU eviction with configurable max entries (default: 20)
- **Keyboard accessibility**: `Ctrl+K`/`⌘K`, `/`, and `Esc` shortcuts for search interaction
- **Text highlighting**: Safe highlighting of search terms in results
- **Request deduplication**: Cancel previous requests when new searches are triggered
- **Performance**: Use CSS-only shimmer animations, avoid JavaScript animations

## 4. Toast Notifications

### Core Concepts

- **Multiple toast types**: Success, error, warning, info with distinct icons and colors
- **Auto-close with timeout**: Configurable duration with progress indication
- **Manual close**: Close button on each toast for immediate dismissal
- **Stacking and positioning**: 6 different positions with intelligent stacking
- **Smooth animations**: Enter/exit transitions with accessibility considerations
- **Context-based API**: React Context for global toast management
- **Timeout management**: Proper cleanup to prevent memory leaks
- **Accessibility**: ARIA roles, keyboard navigation, screen reader support

#### Implementation Steps

1. **Set up React Context**
    - Create ToastContext with provider and custom hook
    - Manage toast state with add, remove, and clear functions
    - Separate component exports from non-component code for Fast Refresh

2. **Create toast components**
    - Individual Toast component with type-specific styling
    - ToastContainer for positioning and stacking
    - Progress bar for auto-close indication

3. **Implement timeout management**
    - Use Map to store timeout IDs for each toast
    - Proper cleanup in removeToast, clearAllToasts, and unmount
    - Prevent memory leaks with useRef and cleanup functions

4. **Add positioning and stacking**
    - Support 6 positions: top/bottom-left/center/right
    - Vertical stacking with proper spacing
    - Maximum toast limits to prevent overflow

#### Production‑Grade Considerations

- **Memory leak prevention**: Proper timeout cleanup using Map-based storage
- **Fast Refresh optimization**: Separate component and non-component exports
- **Accessibility**: Full ARIA support, keyboard navigation, reduced motion respect
- **Performance**: Minimal re-renders with proper memoization
- **Mobile responsiveness**: Touch-friendly sizing and safe area support
- **TypeScript ready**: Proper interfaces and type safety
- **Promise support**: Toast promises for async operation feedback

## 5. Modal Dialogs

### Core Concepts

- **Focus trap**: Keep keyboard focus inside the modal.
- **Backdrop**: Click outside to close (optional, but common).
- **Esc key**: Close modal on `Escape`.
- **Scroll lock**: Prevent scrolling of background content.
- **Animation**: Smooth entrance/exit (fade, scale).

#### Implementation Steps

1. **Modal structure**
    - A backdrop (semi‑transparent overlay).
    - A content container (dialog).
    - Use `role="dialog"` and `aria-modal="true"`.

2. **Open/close state**
    - Controlled via boolean state.

3. **Focus trap**
    - When modal opens, trap focus inside the modal (usually the first focusable element).
    - Use `focus` event listeners and a loop to keep focus inside.

4. **Esc key handler**
    - Listen for `keydown` event and close if `key === "Escape"`.

5. **Background scroll lock**
    - Add `overflow: hidden` to `<body>` when modal is open.

6. **Animations**
    - Use CSS transitions on `opacity` and `transform`.
    - Remove modal from DOM after transition completes to improve performance.

#### Production‑Grade Considerations

- **Accessibility**:
    - Manage `aria-hidden` on background content.
    - Ensure focus returns to the trigger element after closing.
    - Support screen readers by announcing modal opening.

- **Performance**:
    - Lazy load modal content if heavy (e.g., use React.lazy).
    - Ensure animations use `transform/opacity` (GPU‑accelerated).

- **Edge cases**:
    - Nested modals (rare, but if needed, manage focus trapping accordingly).
    - Modal content that is taller than the viewport – ensure scrolling inside modal works without affecting background.

- **Cross‑browser**: Scroll lock may have subtle differences – test on all major browsers.

## 6. Drag and Drop

### Core Concepts

- **Drag indicator**: Visual feedback during drag (e.g., ghost image, cursor change).
- **Reorder animation**: Smooth movement of items when dropped.
- **Mobile support**: Touch events (`touchstart`, `touchmove`, `touchend`).
- **Backend sync**: Save new order after reorder.

#### Implementation Steps

1. **Make elements draggable**
    - Use `draggable=true` for HTML5 drag‑and‑drop (limited styling) or implement custom with mouse/touch events.

2. **Custom drag logic** (recommended for fine control)
    - On `mousedown/touchstart`, record initial position and clone the element.
    - On `mousemove/touchmove`, move the clone and update drop target highlight.
    - On `mouseup/touchend`, determine the new index and update the list.

3. **Reorder items**
    - Use state management to rearrange the list array.
    - Animate items to their new positions using CSS transitions or a library like `framer-motion`.

4. **Mobile support**
    - Use `touch` events with `preventDefault` to avoid page scroll.
    - Ensure touch targets are at least 44x44px.

5. **Sync with backend**
    - After a successful reorder, send the new order to the API (e.g., PATCH with array of ids).
    - Handle optimistic updates or rollback on error.

#### Production‑Grade Considerations

- **Accessibility**:
    - Provide keyboard accessibility (arrow keys to reorder).
    - Add ARIA roles (`role="listbox"`, `aria-grabbed`).

- **Performance**:
    - Use `transform: translate3d` for smooth dragging.
    - Throttle move events to reduce layout recalculations.

- **Edge cases**:
    - Dropping outside the container – cancel drag.
    - Reorder within scrollable containers – automatically scroll near edges.
    - Handling nested drag‑and‑drop (e.g., boards with cards).

- **Testing**:
    - Simulate drag events in unit tests (e.g., using `fireEvent` in React Testing Library).
    - Test on actual touch devices.

- **Libraries**: For complex UIs, consider production‑ready libraries like `react-beautiful-dnd` (now `@hello-pangea/dnd`), `dnd-kit`, or `SortableJS`. Understanding the underlying principles is still crucial.

#### General Production‑Grade Principles for All Features

- **Error Handling**: Always display user‑friendly errors, log details to an error tracking service (Sentry, etc.), and provide retry mechanisms where appropriate.

- **Accessibility**: Test with screen readers, ensure keyboard navigation works, and use semantic HTML and ARIA attributes.

- **Performance**: Minimize re‑renders, use virtualization for long lists (e.g., react-window), and lazy load components/code.

- **Testing**:
    - Unit tests for logic (e.g., debounce, scroll detection).
    - Integration tests for user flows (e.g., search → results → infinite scroll).
    - End‑to‑end tests for critical paths.
- **Responsive Design**: Ensure all features work on mobile, tablet, and desktop, with touch and mouse inputs.
- **Documentation**: Write clear comments and maintain a style guide for your components so they remain reusable and maintainable.

#### Learning Path Suggestion

1. Start with a simple UI library (React, Vue, Svelte) or vanilla JavaScript.
2. Implement each feature step by step, first without advanced optimizations.
3. Gradually add production features: error handling, accessibility, request cancellation, and performance tweaks.
4. Use TypeScript to catch type errors early.
5. Write tests for each feature.
6. Finally, combine them into a real‑world application (e.g., a dashboard with a searchable, sortable, paginated list, modals, and toasts).

By following this roadmap, you’ll not only learn how to build each feature individually but also how to integrate them into a cohesive, robust frontend application.