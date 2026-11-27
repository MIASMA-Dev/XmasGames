// Expose window.AudioContext if needed
declare global {
  interface Window {
    WebKitAudioContext: typeof AudioContext;
  }
}

export {};
