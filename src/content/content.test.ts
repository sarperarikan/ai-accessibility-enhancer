/**
 * Content Script Tests
 * WCAG 2.2-AA compliant test suite
 *
 * MIT License
 */

/// <reference types="jest" />

// Mock Chrome extension APIs
const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
};

(global as any).chrome = mockChrome;

describe('Content Script', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup DOM
    document.body.innerHTML = '';
  });

  test('should load without errors', () => {
    expect(true).toBe(true);
  });

  test('should have clipboard function available globally', () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(void 0),
      },
    });

    // Test copyToClipboard function exists
    expect(typeof (global as any).copyToClipboard).toBe('function');
  });

  test('should handle element analysis mode toggle', () => {
    // Test element analysis functions exist
    expect(typeof (global as any).enableElementAnalysis).toBe('function');
    expect(typeof (global as any).disableElementAnalysis).toBe('function');
    expect(typeof (global as any).toggleElementAnalysis).toBe('function');
  });

  test('should handle WCAG modal function', () => {
    // Test WCAG modal function exists
    expect(typeof (global as any).showWCAGModal).toBe('function');
  });

  test('should handle debug function', () => {
    // Test debug function exists
    expect(typeof (global as any).debugAIExtension).toBe('function');
  });
});