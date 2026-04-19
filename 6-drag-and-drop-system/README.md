# Drag and Drop System

A modern, accessible drag-and-drop sortable list built with React and @dnd-kit.

## Features

✅ **Drag handle** — Visual drag indicator with grab cursor and SVG icon

✅ **Smooth animations** — CSS transitions for hover effects and drag overlay animations

✅ **Mobile support** — Touch events with activation constraint (8px) for accidental drag prevention

✅ **Keyboard support** — Full keyboard accessibility with Tab navigation and Space/Enter to grab

✅ **Auto-save** — Automatically saves to backend on drop via `saveOrder` API call

✅ **Visual feedback** — Opacity change (0.5), enhanced shadow, and transform effects while dragging

✅ **Ghost image** — Custom drag overlay with elevated shadow during drag operation

✅ **Accessibility** — Focus management, ARIA attributes (`aria-label`, `role="list"`), and screen reader support

✅ **Error handling** — Toast notifications for errors (load, save, reset failures)

✅ **Loading states** — Initial load spinner and saving indicator during order persistence

## Usage

```jsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DragDropDemo from './components/DragDropDemo';

function App() {
  return (
    <DndContext collisionDetection={closestCenter}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <DragDropDemo />
      </SortableContext>
    </DndContext>
  );
}
```

## API

### DraggableItem

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique identifier for the item |
| `index` | number | Position in the list |
| `children` | node | Content to render |

### SortableContainer

| Prop | Type | Description |
|------|------|-------------|
| `items` | array | Array of sortable items |
| `onDragEnd` | function | Callback when drag ends |
| `children` | node | Renderable children |

## Accessibility

- Keyboard navigation with Space/Enter to activate drag
- ARIA labels on drag handles
- Focus visible styles on interactive elements
- Reduced motion support via `prefers-reduced-motion`
