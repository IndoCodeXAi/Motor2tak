import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ControlDock } from './src/components/ControlDock';
import { EngineViewport3D } from './src/components/EngineViewport3D';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { QualityModal } from './src/components/QualityModal';
import { TelemetryPill } from './src/components/TelemetryPill';
import { QUALITY_PRESETS, STORAGE_KEY_QUALITY } from './src/constants/engineConfig';
import { EngineControlState, QualityPresetKey, TelemetryData } from './src/types/engine';

const MINIMUM_LOADING_MS = 650;

export default function App() {
  const mountTimeRef = useRef(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Default kualitas "medium" untuk Snapdragon 439 / Adreno 505
  const [qualityKey, setQualityKey] = useState<QualityPresetKey>('medium');
  const [resetSignal, setResetSignal] = useState(0);

  const [controlState, setControlState] = useState<EngineControlState>({
    isPlaying: true,
    speedMultiplier: 0.75,
    autoRotate: false,
    isTransparent: true,
    isExploded: false,
  });

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    phaseLabel: 'KOMPRESI',
    crankDeg: 0,
    dotColor: '#38bdf8',
  });

  // Kunci orientasi ke Landscape (mendukung landscape normal & terbalik)
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);

  // Muat pilihan kualitas grafis tersimpan dari AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_QUALITY)
      .then((saved) => {
        if (saved === 'high' || saved === 'medium' || saved === 'low') {
          setQualityKey(saved);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectQuality = useCallback((nextKey: QualityPresetKey) => {
    setQualityKey(nextKey);
    AsyncStorage.setItem(STORAGE_KEY_QUALITY, nextKey).catch(() => {});
  }, []);

  const handleSceneReady = useCallback(() => {
    const elapsed = Date.now() - mountTimeRef.current;
    const remaining = Math.max(0, MINIMUM_LOADING_MS - elapsed);
    setTimeout(() => {
      setIsLoading(false);
    }, remaining);
  }, []);

  const handleResetCamera = useCallback(() => {
    setResetSignal((n) => n + 1);
    setControlState((prev) => (prev.autoRotate ? { ...prev, autoRotate: false } : prev));
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar hidden style="light" />

        <EngineViewport3D
          controlState={controlState}
          qualityPreset={QUALITY_PRESETS[qualityKey]}
          resetSignal={resetSignal}
          onTelemetryUpdate={setTelemetry}
          onSceneReady={handleSceneReady}
        />

        <TelemetryPill telemetry={telemetry} />

        <ControlDock
          state={controlState}
          onToggleTransparent={() =>
            setControlState((s) => ({ ...s, isTransparent: !s.isTransparent }))
          }
          onToggleExploded={() => setControlState((s) => ({ ...s, isExploded: !s.isExploded }))}
          onToggleAutoRotate={() =>
            setControlState((s) => ({ ...s, autoRotate: !s.autoRotate }))
          }
          onTogglePlay={() => setControlState((s) => ({ ...s, isPlaying: !s.isPlaying }))}
          onChangeSpeed={(val) => setControlState((s) => ({ ...s, speedMultiplier: val }))}
          onResetCamera={handleResetCamera}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <QualityModal
          visible={settingsOpen}
          currentPreset={qualityKey}
          onSelectPreset={handleSelectQuality}
          onClose={() => setSettingsOpen(false)}
        />

        <LoadingOverlay visible={isLoading} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0b0d12',
  },
});
