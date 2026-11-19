import { Injectable, inject } from '@angular/core';

/**
 * Servicio para acceder a los sensores del dispositivo (giroscopio, micrófono, cámara).
 * Maneja los permisos y la compatibilidad entre navegadores (iOS, Android).
 */
@Injectable({ providedIn: 'root' })
export class SensorService {
  // ── Gyroscope ──
  private gyroscopeActive = false;
  private gyroscopeHandler: ((data: DeviceMotionEvent) => void) | null = null;

  /**
   * Activa el giroscopio (DeviceOrientation + DeviceMotion).
   * En iOS 13+ se requiere permiso explícito.
   */
  async requestGyroscope(): Promise<boolean> {
    // iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') return false;
      } catch {
        return false;
      }
    }

    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission !== 'granted') return false;
      } catch {
        return false;
      }
    }

    this.gyroscopeActive = true;
    window.addEventListener('deviceorientation', this.onOrientation as any, true);
    window.addEventListener('devicemotion', this.onMotion as any, true);
    return true;
  }

  /** Suscríbete para recibir datos del giroscopio */
  onOrientation = (e: DeviceOrientationEvent) => {
    if (this.gyroscopeHandler) this.gyroscopeHandler(e);
  };

  onMotion = (e: DeviceMotionEvent) => {
    if (this.gyroscopeHandler) this.gyroscopeHandler(e);
  };

  subscribeGyroscope(handler: (data: DeviceMotionEvent | DeviceOrientationEvent) => void): void {
    this.gyroscopeHandler = handler;
  }

  stopGyroscope(): void {
    this.gyroscopeActive = false;
    this.gyroscopeHandler = null;
    window.removeEventListener('deviceorientation', this.onOrientation as any, true);
    window.removeEventListener('devicemotion', this.onMotion as any, true);
  }

  // ── Microphone ──
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneActive = false;
  private volumeHandler: ((volume: number) => void) | null = null;
  private animationFrameId: number | null = null;

  /**
   * Activa el micrófono y empieza a medir el volumen.
   * Devuelve el volumen actual como valor 0-100.
   */
  async requestMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      this.microphoneActive = true;
      this.trackVolume();
      return true;
    } catch (err) {
      console.error('[Sensor] Error al acceder al micrófono:', err);
      return false;
    }
  }

  private trackVolume(): void {
    if (!this.analyser || !this.microphoneActive) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const measure = () => {
      if (!this.microphoneActive) return;
      this.analyser!.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const volume = Math.round((average / 255) * 100);
      this.volumeHandler?.(volume);
      this.animationFrameId = requestAnimationFrame(measure);
    };
    measure();
  }

  subscribeVolume(handler: (volume: number) => void): void {
    this.volumeHandler = handler;
  }

  stopMicrophone(): void {
    this.microphoneActive = false;
    this.volumeHandler = null;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.audioContext?.close();
    this.audioContext = null;
    this.analyser = null;
  }

  // ── Camera ──
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;

  /**
   * Activa la cámara trasera y devuelve un elemento <video>.
   */
  async requestCamera(): Promise<HTMLVideoElement | null> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      await this.videoElement.play();
      return this.videoElement;
    } catch (err) {
      console.error('[Sensor] Error al acceder a la cámara:', err);
      return null;
    }
  }

  /** Devuelve el video activo (si hay uno). */
  getVideo(): HTMLVideoElement | null {
    return this.videoElement;
  }

  /** Detiene la cámara. */
  stopCamera(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.videoElement = null;
  }
}
