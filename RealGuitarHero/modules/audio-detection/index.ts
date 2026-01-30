// Audio Detection Module Bridge
// Provides startListening, stopListening, and addListener functions
// Uses native module when available, falls back to mocks for testing

export type DetectedPitchEvent = {
  pitches: { note: string; frequency: number; confidence: number }[];
  timestamp: number;
};

export type Subscription = {
  remove: () => void;
};

// Check if we're in a native environment with the module available
let AudioDetectionModule: {
  startListening: () => void;
  stopListening: () => void;
} | null = null;

let emitter: {
  addListener: (eventName: string, listener: (event: DetectedPitchEvent) => void) => Subscription;
} | null = null;

try {
  // Attempt to import native modules - this will fail in test environment
  const { NativeModulesProxy, EventEmitter } = require('expo-modules-core');
  if (NativeModulesProxy?.AudioDetectionModule) {
    AudioDetectionModule = NativeModulesProxy.AudioDetectionModule;
    emitter = new EventEmitter(AudioDetectionModule);
  }
} catch {
  // Native modules not available (test environment or web)
}

// Mock implementations for testing when native module is unavailable
const mockStartListening = (): void => {
  // No-op in test/mock environment
};

const mockStopListening = (): void => {
  // No-op in test/mock environment
};

const mockAddListener = (_listener: (event: DetectedPitchEvent) => void): Subscription => {
  // Return a mock subscription
  return {
    remove: () => {
      // No-op
    },
  };
};

// Export functions that use native module when available, otherwise use mocks
export const startListening = (): void => {
  if (AudioDetectionModule) {
    AudioDetectionModule.startListening();
  } else {
    mockStartListening();
  }
};

export const stopListening = (): void => {
  if (AudioDetectionModule) {
    AudioDetectionModule.stopListening();
  } else {
    mockStopListening();
  }
};

export const addListener = (listener: (event: DetectedPitchEvent) => void): Subscription => {
  if (emitter) {
    return emitter.addListener('onDetectedPitches', listener);
  } else {
    return mockAddListener(listener);
  }
};
