import '@testing-library/jest-dom';

// Mock IntersectionObserver for jsdom test environment
class MockIntersectionObserver {
  observe = () => null;
  unobserve = () => null;
  disconnect = () => null;
  takeRecords = () => [];
  root = null;
  rootMargin = '';
  thresholds = [];
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
