import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; the chat auto-scroll calls it.
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
