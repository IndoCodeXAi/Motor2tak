import { useRef } from 'react';
import { PanResponder, GestureResponderEvent } from 'react-native';
import * as THREE from 'three';
import { INITIAL_CAM_POS, INITIAL_TARGET, ORBIT_CONFIG } from '../constants/engineConfig';

export interface TouchOrbitController {
  panHandlers: ReturnType<typeof PanResponder.create>['panHandlers'];
  update: (delta: number, autoRotate: boolean) => void;
  triggerReset: () => void;
  syncFromCamera: () => void;
}

/**
 * Implementasi OrbitControls 360 derajat native via PanResponder dengan
 * Spherical damping, pinch-to-zoom, dan batas sudut yang identik dengan Three.js OrbitControls.
 */
export function useTouchOrbitControls(
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>,
  viewportSizeRef: React.MutableRefObject<{ width: number; height: number }>
): TouchOrbitController {
  const targetRef = useRef(INITIAL_TARGET.clone());
  const targetGoalRef = useRef(INITIAL_TARGET.clone());

  const sphericalCurrent = useRef(new THREE.Spherical());
  const sphericalGoal = useRef(new THREE.Spherical());
  const isResettingRef = useRef(false);

  // State gesture aktif
  const prevTouchRef = useRef<{ x: number; y: number } | null>(null);
  const prevPinchDistRef = useRef<number | null>(null);
  const prevPanCenterRef = useRef<{ x: number; y: number } | null>(null);

  const syncFromCamera = () => {
    const cam = cameraRef.current;
    if (!cam) return;
    const offset = new THREE.Vector3().subVectors(cam.position, targetRef.current);
    sphericalCurrent.current.setFromVector3(offset);
    sphericalGoal.current.copy(sphericalCurrent.current);
  };

  const getTouchDistance = (touches: readonly any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.hypot(dx, dy);
  };

  const getTouchCenter = (touches: readonly any[]) => ({
    x: (touches[0].pageX + touches[1].pageX) * 0.5,
    y: (touches[0].pageY + touches[1].pageY) * 0.5,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        isResettingRef.current = false;
        const touches = evt.nativeEvent.touches;
        if (touches.length === 1) {
          prevTouchRef.current = { x: touches[0].pageX, y: touches[0].pageY };
          prevPinchDistRef.current = null;
          prevPanCenterRef.current = null;
        } else if (touches.length >= 2) {
          prevTouchRef.current = null;
          prevPinchDistRef.current = getTouchDistance(touches);
          prevPanCenterRef.current = getTouchCenter(touches);
        }
      },

      onPanResponderMove: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;
        const { width, height } = viewportSizeRef.current;
        const minDim = Math.max(1, Math.min(width, height));

        if (touches.length === 1) {
          const t = touches[0];
          if (!prevTouchRef.current) {
            prevTouchRef.current = { x: t.pageX, y: t.pageY };
            return;
          }
          const dx = t.pageX - prevTouchRef.current.x;
          const dy = t.pageY - prevTouchRef.current.y;
          prevTouchRef.current = { x: t.pageX, y: t.pageY };

          // Rotasi azimuth (theta) & polar (phi)
          const rotateSpeed = (2 * Math.PI) / minDim;
          sphericalGoal.current.theta -= dx * rotateSpeed * 0.85;
          sphericalGoal.current.phi -= dy * rotateSpeed * 0.85;

          sphericalGoal.current.phi = Math.max(
            ORBIT_CONFIG.minPolarAngle,
            Math.min(ORBIT_CONFIG.maxPolarAngle, sphericalGoal.current.phi)
          );
        } else if (touches.length >= 2) {
          prevTouchRef.current = null;
          const dist = getTouchDistance(touches);
          const center = getTouchCenter(touches);

          // Pinch Zoom
          if (prevPinchDistRef.current !== null && dist > 0) {
            const scale = prevPinchDistRef.current / dist;
            sphericalGoal.current.radius = Math.max(
              ORBIT_CONFIG.minDistance,
              Math.min(ORBIT_CONFIG.maxDistance, sphericalGoal.current.radius * scale)
            );
          }
          prevPinchDistRef.current = dist;

          // Pan 2 Jari
          const cam = cameraRef.current;
          if (prevPanCenterRef.current && cam) {
            const dx = center.x - prevPanCenterRef.current.x;
            const dy = center.y - prevPanCenterRef.current.y;

            const panScale = (sphericalGoal.current.radius * 0.0018);
            const right = new THREE.Vector3();
            const up = new THREE.Vector3();
            cam.matrix.extractBasis(right, up, new THREE.Vector3());

            targetGoalRef.current.addScaledVector(right, -dx * panScale);
            targetGoalRef.current.addScaledVector(up, dy * panScale);
          }
          prevPanCenterRef.current = center;
        }
      },

      onPanResponderRelease: () => {
        prevTouchRef.current = null;
        prevPinchDistRef.current = null;
        prevPanCenterRef.current = null;
      },
      onPanResponderTerminate: () => {
        prevTouchRef.current = null;
        prevPinchDistRef.current = null;
        prevPanCenterRef.current = null;
      },
    })
  ).current;

  const triggerReset = () => {
    isResettingRef.current = true;
    const resetOffset = new THREE.Vector3().subVectors(INITIAL_CAM_POS, INITIAL_TARGET);
    sphericalGoal.current.setFromVector3(resetOffset);
    targetGoalRef.current.copy(INITIAL_TARGET);
  };

  const update = (delta: number, autoRotate: boolean) => {
    const cam = cameraRef.current;
    if (!cam) return;

    if (autoRotate && !isResettingRef.current) {
      sphericalGoal.current.theta -= ((2 * Math.PI) / 60) * ORBIT_CONFIG.autoRotateSpeed * delta;
    }

    const damping = isResettingRef.current
      ? Math.min(1, delta * 5.0)
      : 1 - Math.pow(1 - ORBIT_CONFIG.dampingFactor, delta * 60);

    sphericalCurrent.current.radius +=
      (sphericalGoal.current.radius - sphericalCurrent.current.radius) * damping;
    sphericalCurrent.current.phi +=
      (sphericalGoal.current.phi - sphericalCurrent.current.phi) * damping;
    sphericalCurrent.current.theta +=
      (sphericalGoal.current.theta - sphericalCurrent.current.theta) * damping;

    targetRef.current.lerp(targetGoalRef.current, damping);

    const offset = new THREE.Vector3().setFromSpherical(sphericalCurrent.current);
    cam.position.copy(targetRef.current).add(offset);
    cam.lookAt(targetRef.current);

    if (
      isResettingRef.current &&
      cam.position.distanceTo(INITIAL_CAM_POS) < 0.05 &&
      targetRef.current.distanceTo(INITIAL_TARGET) < 0.05
    ) {
      cam.position.copy(INITIAL_CAM_POS);
      targetRef.current.copy(INITIAL_TARGET);
      isResettingRef.current = false;
    }
  };

  return {
    panHandlers: panResponder.panHandlers,
    update,
    triggerReset,
    syncFromCamera,
  };
}
