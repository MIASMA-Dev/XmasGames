// Expose window.AudioContext if needed
declare global {
  interface Window {
    WebKitAudioContext: typeof AudioContext;
    navigator: Navigator & {
      bluetooth?: {
        requestDevice: () => Promise<any>;
      };
    };
  }
}

export {};
