import React, { useEffect, useRef } from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { INITIAL_CAM_POS, INITIAL_TARGET } from '../constants/engineConfig';
import { buildEngineScene, BuiltEngineController } from '../engine/buildEngineScene';
import { useTouchOrbitControls } from '../engine/useTouchOrbitControls';
import { EngineControlState, QualityPresetConfig, TelemetryData } from '../types/engine';

interface Props {
  controlState: EngineControlState;
  qualityPreset: QualityPresetConfig;
  resetSignal: number;
  onTelemetryUpdate: (data: TelemetryData) => void;
  onSceneReady: () => void;
}

export const EngineViewport3D: React.FC<Props> = ({
  controlState,
  qualityPreset,
  resetSignal,
  onTelemetryUpdate,
  onSceneReady,
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const engineCtrlRef = useRef<BuiltEngineController | null>(null);
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const viewportSizeRef = useRef({ width: 1, height: 1 });
  const stateRef = useRef(controlState);
  stateRef.current = controlState;

  const qualityRef = useRef(qualityPreset);
  qualityRef.current = qualityPreset;

  const simRef = useRef({
    crankAngle: 0.35,
    explodeProgress: 0,
    lastTelemetryEmit: 0,
  });

  const orbitControls = useTouchOrbitControls(cameraRef, viewportSizeRef);

  // Sinkronkan toggle Transparan
  useEffect(() => {
    engineCtrlRef.current?.setTransparentMode(controlState.isTransparent);
  }, [controlState.isTransparent]);

  // Sinkronkan Reset Camera
  useEffect(() => {
    if (resetSignal > 0) {
      orbitControls.triggerReset();
    }
  }, [resetSignal]);

  // Sinkronkan perubahan Kualitas Grafis (PixelRatio + ShadowMap)
  useEffect(() => {
    const renderer = rendererRef.current;
    const engineCtrl = engineCtrlRef.current;
    const gl = glRef.current;
    if (!renderer || !engineCtrl || !gl) return;

    const devicePR = PixelRatio.get();
    const targetPR = Math.min(
      qualityPreset.maxPixelRatio,
      Math.max(1, devicePR * qualityPreset.pixelRatioScale)
    );
    renderer.setPixelRatio(targetPR);
    renderer.setSize(gl.drawingBufferWidth / targetPR, gl.drawingBufferHeight / targetPR, false);
    engineCtrl.applyQualityPreset(renderer, qualityPreset);
  }, [qualityPreset]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      engineCtrlRef.current?.dispose();
    };
  }, []);

  const handleContextCreate = (gl: ExpoWebGLRenderingContext) => {
    glRef.current = gl;
    const devicePR = PixelRatio.get();
    const q = qualityRef.current;
    const targetPR = Math.min(q.maxPixelRatio, Math.max(1, devicePR * q.pixelRatioScale));

    const width = gl.drawingBufferWidth / targetPR;
    const height = gl.drawingBufferHeight / targetPR;
    viewportSizeRef.current = { width, height };

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.copy(INITIAL_CAM_POS);
    camera.lookAt(INITIAL_TARGET);
    cameraRef.current = camera;
    orbitControls.syncFromCamera();

    const renderer = new Renderer({
      gl,
      width,
      height,
      pixelRatio: targetPR,
      antialias: true,
    }) as unknown as THREE.WebGLRenderer;

    renderer.setPixelRatio(targetPR);
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = q.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    const engineCtrl = buildEngineScene(renderer, q);
    engineCtrl.setTransparentMode(stateRef.current.isTransparent);
    engineCtrlRef.current = engineCtrl;

    // Render frame perdana sebelum menutup loading screen
    const initTelemetry = engineCtrl.updateKinematics(simRef.current.crankAngle, 0);
    onTelemetryUpdate(initTelemetry);
    renderer.render(engineCtrl.scene, camera);
    gl.endFrameEXP();

    onSceneReady();

    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      rafIdRef.current = requestAnimationFrame(renderLoop);

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = stateRef.current;
      if (s.isPlaying) {
        simRef.current.crankAngle += delta * 5.2 * s.speedMultiplier;
      }

      const targetExplode = s.isExploded ? 1.0 : 0.0;
      simRef.current.explodeProgress +=
        (targetExplode - simRef.current.explodeProgress) * Math.min(1, delta * 7.5);

      const telemetry = engineCtrl.updateKinematics(
        simRef.current.crankAngle,
        simRef.current.explodeProgress
      );

      // Throttle update UI React ~30fps agar thread JS tetap ringan di Snapdragon 439
      if (now - simRef.current.lastTelemetryEmit >= 32) {
        simRef.current.lastTelemetryEmit = now;
        onTelemetryUpdate(telemetry);
      }

      orbitControls.update(delta, s.autoRotate);
      renderer.render(engineCtrl.scene, camera);
      gl.endFrameEXP();
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          viewportSizeRef.current = { width, height };
          if (cameraRef.current) {
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
          }
          if (rendererRef.current) {
            rendererRef.current.setSize(width, height, false);
          }
        }
      }}
      {...orbitControls.panHandlers}
    >
      <GLView style={styles.glView} onContextCreate={handleContextCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0d12',
  },
  glView: {
    flex: 1,
  },
});
