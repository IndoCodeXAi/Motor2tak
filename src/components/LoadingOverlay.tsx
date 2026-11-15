import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text } from 'react-native';

interface Props {
  visible: boolean;
}

export const LoadingOverlay: React.FC<Props> = ({ visible }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const [mounted, setMounted] = React.useState(true);

  useEffect(() => {
    if (!visible) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible, opacity]);

  if (!mounted) return null;

  return (
    <Animated.View pointerEvents="auto" style={[styles.overlay, { opacity }]}>
      <ActivityIndicator size="large" color="#38bdf8" />
      <Text style={styles.label}>MEMUAT MODEL CAD 2-TAK...</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: '#0b0d12',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 0.8,
    fontWeight: '500',
  },
});
