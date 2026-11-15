import * as THREE from 'three';
import { QualityPresetConfig, QualityPresetKey } from '../types/engine';

// 1:1 dengan ENGINE_SPECS di file HTML asli
export const ENGINE_SPECS = {
  boreRadius: 1.35,      // Radius silinder dalam
  crankRadius: 1.05,     // Radius throw kruk as (Stroke = 2.10 unit)
  conRodLength: 3.45,    // Panjang batang piston (Connecting Rod)
  crankCenterY: 0.0,     // Pusat sumbu kruk as di Y = 0
  blockBottomY: 2.35,    // Dasar blok silinder
  blockHeight: 3.25,     // Tinggi blok silinder
  headHeight: 1.15,      // Tinggi kepala silinder
  pistonHeight: 1.48,    // Tinggi skirt piston
  pistonPinOffset: 0.68, // Jarak pin piston dari dasar piston
} as const;

export const INITIAL_CAM_POS = new THREE.Vector3(7.8, 5.4, 9.6);
export const INITIAL_TARGET = new THREE.Vector3(0.2, 2.7, 0.0);

export const ORBIT_CONFIG = {
  dampingFactor: 0.06,
  minDistance: 4.2,
  maxDistance: 24.0,
  maxPolarAngle: Math.PI * 0.82,
  minPolarAngle: 0.12,
  autoRotateSpeed: 1.8,
} as const;

// Konfigurasi Kualitas Grafis (Default: 'medium' untuk Snapdragon 439 / Adreno 505)
export const QUALITY_PRESETS: Record<QualityPresetKey, QualityPresetConfig> = {
  high: {
    key: 'high',
    label: 'Tinggi',
    description: 'Resolusi penuh & bayangan lembut 1024px (GPU kelas menengah/atas)',
    pixelRatioScale: 1.0,
    maxPixelRatio: 2.0,
    shadowsEnabled: true,
    shadowMapSize: 1024,
    envIntensity: 0.85,
  },
  medium: {
    key: 'medium',
    label: 'Sedang (Direkomendasikan)',
    description: 'Seimbang untuk Adreno 505 / RAM 4GB — bayangan aktif 512px',
    pixelRatioScale: 0.8,
    maxPixelRatio: 1.5,
    shadowsEnabled: true,
    shadowMapSize: 512,
    envIntensity: 0.8,
  },
  low: {
    key: 'low',
    label: 'Hemat',
    description: 'FPS maksimal & hemat baterai — tanpa shadow map real-time',
    pixelRatioScale: 0.65,
    maxPixelRatio: 1.15,
    shadowsEnabled: false,
    shadowMapSize: 256,
    envIntensity: 0.75,
  },
};

export const STORAGE_KEY_QUALITY = '@mesin2tak:quality_preset_v1';
