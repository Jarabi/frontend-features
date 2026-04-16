# Modal Dialog System

## Overview

A production-ready React modal dialog system with accessible focus trapping, keyboard handling, scroll locking, stacked modals, and smooth enter/exit animations. Built using pure React and modern browser APIs.

## Production Features Checklist

- ✅ Focus trap - Keyboard focus stays inside modal
- ✅ ESC to close - Configurable per modal
- ✅ Outside click - Configurable backdrop close
- ✅ Scroll lock - Prevents background scrolling
- ✅ Smooth animations - Enter/exit animations
- ✅ Stackable - Multiple modals can be opened
- ✅ Accessibility - ARIA labels, role="dialog"
- ✅ Focus restoration - Returns focus to trigger element
- ✅ Responsive - Works on all screen sizes
- ✅ No external deps - Pure React implementation

## Implementation Details

### Modal provider and stack management

The modal system is driven by `ModalProvider` in `src/context/ModalContext.jsx`.
- `openModal()` adds a new modal config into the `modals` stack.
- `closeModal()` removes a specific modal by `id`.
- `closeTopModal()` closes the top-most modal when multiple dialogs are stacked.
- `closeAllModals()` clears the stack entirely.

This stack-based design makes stacked modals natural: each new modal is rendered on top of the previous ones while the background remains locked.

### Scroll lock and global keyboard handling

`ModalProvider` also handles:
- `body.style.overflow = 'hidden'` while any modal is open
- restoring the original scroll state when the stack closes
- closing the top-most modal when the user presses `Escape`, unless `closeOnEsc: false` is set on that modal

### Modal rendering

`ModalContainer.jsx` reads the modal stack from context and renders a `Modal` component for each entry in `modals`.
- Each modal receives its `title`, `content`, and `closeOnOutsideClick` config.
- A unique `key` is used for each modal so React maintains correct stacking behavior.

### Focus trapping and restoration

`Modal.jsx` implements keyboard focus management:
- The modal container is focused on open
- Tab / Shift+Tab navigation is trapped inside the active modal
- Disabled and `aria-hidden="true"` elements are excluded from the focus ring
- When the modal closes, focus returns to the element that opened it

### Close animations

`Modal.jsx` supports smooth exit transitions by toggling an `isClosing` state instead of immediately unmounting.
- `modal-overlay-exit` and `modal-container-exit` apply fade-out and slide-down animations
- `onClose(id)` is delayed until animations complete

### Example modal variants

The demo includes a variety of modal content examples in `src/components/ModalExamples.jsx`:
- simple information modal
- confirmation modal
- form modal with controlled inputs
- large-content modal demonstrating internal scroll
- image modal
- stacked modal flow showing multiple dialogs opened in sequence

## Usage

Wrap your app with `ModalProvider` and render `ModalContainer` once at the root:

```jsx
import { ModalProvider } from './context/ModalContext';
import ModalContainer from './components/ModalContainer';

function App() {
  return (
    <ModalProvider>
      <YourApp />
      <ModalContainer />
    </ModalProvider>
  );
}
```

Open modals from any component using `useModal()`:

```jsx
const { openModal, closeTopModal } = useModal();

openModal({
  title: 'Confirm Action',
  content: <ConfirmationModal onConfirm={handleConfirm} onCancel={closeTopModal} />,
  closeOnOutsideClick: true,
  closeOnEsc: true,
});
```

## File Structure

```
src/
  components/
    Modal.jsx
    ModalContainer.jsx
    ModalExamples.jsx
    Modal.css
  context/
    ModalContext.jsx
    modalContext.js
    useModal.js
```
