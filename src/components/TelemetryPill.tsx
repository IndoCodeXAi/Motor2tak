import React from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TelemetryData } from '../types/engine';

interface Props {
  telemetry: TelemetryData;
}

export const TelemetryPill: React.FC<Props> = ({ telemetry }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 700;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.pill,
        {
          top: Math.max(10, insets.top + 8),
          left: Math.max(12, insets.left + 12),
          maxWidth: width - (insets.left + insets.right + 88),
          paddingVertical: isCompact ? 6 : 8,
          paddingHorizontal: isCompact ? 11 : 14,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: telemetry.dotColor,
            shadowColor: telemetry.dotColor,
          },
        ]}
      />
      <Text numberOfLines={1} style={[styles.text, isCompact && styles.textCompact]}>
        2-STROKE • <Text style={styles.phaseText}>{telemetry.phaseLabel}</Text> •{' '}
        {telemetry.crankDeg}°
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 19, 28, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  text: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    fontSize: 11,
    letterSpacing: 0.4,
    color: '#cbd5e1',
    flexShrink: 1,
  },
  textCompact: {
    fontSize: 10,
  },
  phaseText: {
    color: '#f8fafc',
    fontWeight: '700',
  },
});
