export type QualityPresetKey = 'high' | 'medium' | 'low';

export interface QualityPresetConfig {
  key: QualityPresetKey;
  label: string;
  description: string;
  pixelRatioScale: number;
  maxPixelRatio: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  envIntensity: number;
}

export interface TelemetryData {
  phaseLabel: string;
  crankDeg: number;
  dotColor: string;
}

export interface EngineControlState {
  isPlaying: boolean;
  speedMultiplier: number;
  autoRotate: boolean;
  isTransparent: boolean;
  isExploded: boolean;
}
