# Infinite Scroll Feature

## Feature Summary

This project implements an **infinite scroll** component that automatically loads and displays paginated content as the user scrolls to the bottom of the page. The implementation uses React's **Intersection Observer API** to detect when the user approaches the end of the current list, triggering automatic data fetching without pagination buttons or manual interactions.

### Key Behaviors:
- **Automatic loading**: Fetches next page when sentinel element enters viewport
- **Request cancellation**: Aborts in-flight requests if new requests are triggered
- **Error handling**: Displays error messages with manual retry option
- **End detection**: Shows completion message when all data is loaded
- **Loading state**: Displays spinner while fetching

---

## Prerequisites

- **Node.js** 16+ (check with `node --version`)
- **npm** 7+ (check with `npm --version`)
- **Internet connection** (to fetch from JSONPlaceholder API)

---

## Setup & Run

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5173/` (or another port if 5173 is busy). Open this URL in your browser to see the infinite scroll in action.

### 3. Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### 4. Lint Code

```bash
npm run lint
```

### 5. Preview Production Build

```bash
npm run preview
```

---

## API & Data Source

### Endpoint
- **Base URL**: `https://jsonplaceholder.typicode.com/posts`
- **Method**: `GET`
- **Pagination Params**:
  - `_page`: Page number (1-indexed)
  - `_limit`: Items per page (fixed at 10)

### Sample Request

```http
GET https://jsonplaceholder.typicode.com/posts?_page=1&_limit=10
```

### Sample Response

```json
[
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat...",
    "body": "quia et suscipit suscipit recusandae..."
  },
  {
    "userId": 1,
    "id": 2,
    "title": "qui est esse",
    "body": "est rerum tempore vitae sequi sint..."
  },
  // ... 8 more items
]
```

### Configuration

| Variable | Value | Purpose |
|----------|-------|---------|
| `API_BASE` | `https://jsonplaceholder.typicode.com/posts` | Mock API endpoint |
| `PAGE_SIZE` | `10` | Items loaded per request |
| Observer `threshold` | `0.1` | Trigger when 10% of sentinel is visible |
| Observer `rootMargin` | `100px` | Preload 100px before sentinel enters |

### Mock Data

This project uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake API that returns 100 posts. Each post has:
- `id`: Unique identifier
- `userId`: Associated user
- `title`: Post headline
- `body`: Post content

---

## Reproduction Steps

### To test infinite scroll:

1. **Start the dev server**: `npm run dev`
2. **Open the browser**: Navigate to `http://localhost:5173`
3. **Scroll down**: The page displays ~10 posts initially
4. **Watch for loading**: As you scroll past the 10th item, a loading spinner appears
5. **New items load**: After ~500ms, the next 10 posts appear
6. **Repeat**: Keep scrolling to load all 100 posts
7. **End state**: After loading all posts, "🎉 You've reached the end!" message displays

### To test error handling:

1. **Open browser DevTools** (`F12` or `Ctrl+Shift+I`)
2. **Go to Network tab** and **Throttle** to "Offline"
3. **Scroll to trigger load**: The error message "Failed to fetch posts" will appear
4. **Click Retry**: Connection restored, posts load successfully

### To test request cancellation:

1. **Open DevTools → Network tab**
2. **Scroll rapidly** to trigger multiple requests
3. **Observe**: Earlier requests are cancelled (shown as "canceled" in Network tab)
4. **Only the latest request** completes and loads data

---

## Troubleshooting

### Issue: No posts appear on load
- **Check**: Is `http://localhost:5173` open in browser?
- **Check**: Is dev server running (`npm run dev`)?
- **Fix**: Kill terminal, run `npm run dev` again

### Issue: "Failed to fetch posts" error persists
- **Check**: Is your internet connection active?
- **Check**: Is JSONPlaceholder API available? Test: `curl https://jsonplaceholder.typicode.com/posts?_page=1&_limit=10`
- **Workaround**: Mock API with local server by editing `API_BASE` in `src/App.jsx`

### Issue: Infinite scroll doesn't trigger on scroll
- **Check**: Browser DevTools → Console for errors
- **Check**: CSS might be hiding the sentinel or items. Verify `.items-list` allows scrolling
- **Fix**: Try clearing browser cache (`Ctrl+Shift+Delete`) and refresh

### Issue: "npm: command not found"
- **Fix**: Install Node.js from https://nodejs.org/ (includes npm)
- **Verify**: Run `npm --version` in terminal

### Issue: Port 5173 already in use
- **Fix**: Run `npm run dev` again; Vite will use the next available port
- **Alternative**: Kill process using port: `lsof -ti:5173 | xargs kill -9` (macOS/Linux)