import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Eye,
  Home,
  Maximize2,
  Pause,
  Play,
  RotateCw,
  Settings,
} from 'lucide-react-native';
import { EngineControlState } from '../types/engine';

interface Props {
  state: EngineControlState;
  onToggleTransparent: () => void;
  onToggleExploded: () => void;
  onToggleAutoRotate: () => void;
  onTogglePlay: () => void;
  onChangeSpeed: (val: number) => void;
  onResetCamera: () => void;
  onOpenSettings: () => void;
}

export const ControlDock: React.FC<Props> = ({
  state,
  onToggleTransparent,
  onToggleExploded,
  onToggleAutoRotate,
  onTogglePlay,
  onChangeSpeed,
  onResetCamera,
  onOpenSettings,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Adaptasi layar landscape sempit/pendek agar tidak menabrak TelemetryPill
  const isCompact = width < 720 || height < 390;
  const iconSize = isCompact ? 13 : 14;

  return (
    <>
      {/* Tombol Pengaturan Kualitas di Pojok Kanan Atas */}
      <Pressable
        onPress={onOpenSettings}
        style={({ pressed }) => [
          styles.settingsBtn,
          {
            top: Math.max(10, insets.top + 8),
            right: Math.max(12, insets.right + 12),
          },
          pressed && styles.pressed,
        ]}
      >
        <Settings size={15} color="#cbd5e1" />
        {!isCompact && <Text style={styles.btnText}>Grafis</Text>}
      </Pressable>

      {/* Dock Kontrol Utama di Bawah Layar */}
      <View
        style={[
          styles.dockWrapper,
          {
            bottom: Math.max(10, insets.bottom + 8),
            paddingHorizontal: Math.max(12, insets.left + 12),
          },
        ]}
      >
        <View style={[styles.dock, isCompact && styles.dockCompact]}>
          <ControlButton
            active={state.isTransparent}
            label="Transparan"
            compact={isCompact}
            icon={<Eye size={iconSize} color={state.isTransparent ? '#7dd3fc' : '#cbd5e1'} />}
            onPress={onToggleTransparent}
          />

          <ControlButton
            active={state.isExploded}
            label="Exploded"
            compact={isCompact}
            icon={<Maximize2 size={iconSize} color={state.isExploded ? '#7dd3fc' : '#cbd5e1'} />}
            onPress={onToggleExploded}
          />

          <ControlButton
            active={state.autoRotate}
            label="Rotate"
            compact={isCompact}
            icon={<RotateCw size={iconSize} color={state.autoRotate ? '#7dd3fc' : '#cbd5e1'} />}
            onPress={onToggleAutoRotate}
          />

          {!isCompact && <View style={styles.divider} />}

          <ControlButton
            active={state.isPlaying}
            label={state.isPlaying ? 'Jalan' : 'Jeda'}
            compact={isCompact}
            icon={
              state.isPlaying ? (
                <Pause size={iconSize} color="#7dd3fc" />
              ) : (
                <Play size={iconSize} color="#cbd5e1" />
              )
            }
            onPress={onTogglePlay}
          />

          <View style={[styles.speedGroup, isCompact && styles.speedGroupCompact]}>
            <Slider
              style={[styles.slider, isCompact && styles.sliderCompact]}
              minimumValue={0.05}
              maximumValue={3.0}
              step={0.05}
              value={state.speedMultiplier}
              onValueChange={onChangeSpeed}
              minimumTrackTintColor="#38bdf8"
              maximumTrackTintColor="rgba(148, 163, 184, 0.32)"
              thumbTintColor="#38bdf8"
            />
            <Text style={styles.speedLabel}>{state.speedMultiplier.toFixed(2)}x</Text>
          </View>

          {!isCompact && <View style={styles.divider} />}

          <ControlButton
            active={false}
            label="Reset"
            compact={isCompact}
            icon={<Home size={iconSize} color="#cbd5e1" />}
            onPress={onResetCamera}
          />
        </View>
      </View>
    </>
  );
};

interface BtnProps {
  active: boolean;
  label: string;
  compact: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}

const ControlButton: React.FC<BtnProps> = ({ active, label, compact, icon, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.ctrlBtn,
      compact && styles.ctrlBtnCompact,
      active && styles.ctrlBtnActive,
      pressed && styles.pressed,
    ]}
  >
    {icon}
    <Text style={[styles.btnText, compact && styles.btnTextCompact, active && styles.btnTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  settingsBtn: {
    position: 'absolute',
    zIndex: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 19, 28, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    elevation: 6,
  },
  dockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  dock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 19, 28, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 8,
  },
  dockCompact: {
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 13,
  },
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 38, 54, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ctrlBtnCompact: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  ctrlBtnActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.24)',
    borderColor: 'rgba(56, 189, 248, 0.65)',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  btnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  btnTextCompact: {
    fontSize: 11,
  },
  btnTextActive: {
    color: '#7dd3fc',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 2,
  },
  speedGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(22, 28, 40, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  speedGroupCompact: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  slider: {
    width: 82,
    height: 24,
  },
  sliderCompact: {
    width: 66,
    height: 22,
  },
  speedLabel: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    fontSize: 11,
    color: '#94a3b8',
    minWidth: 40,
    textAlign: 'right',
  },
});
