import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { QUALITY_PRESETS } from '../constants/engineConfig';
import { QualityPresetKey } from '../types/engine';

interface Props {
  visible: boolean;
  currentPreset: QualityPresetKey;
  onSelectPreset: (key: QualityPresetKey) => void;
  onClose: () => void;
}

const PRESET_ORDER: QualityPresetKey[] = ['high', 'medium', 'low'];

export const QualityModal: React.FC<Props> = ({
  visible,
  currentPreset,
  onSelectPreset,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Pengaturan Kualitas Grafis</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94a3b8" />
            </Pressable>
          </View>

          <View style={styles.list}>
            {PRESET_ORDER.map((key) => {
              const preset = QUALITY_PRESETS[key];
              const selected = currentPreset === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    onSelectPreset(key);
                    onClose();
                  }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                      {preset.label}
                    </Text>
                    <Text style={styles.optionDesc}>{preset.description}</Text>
                  </View>
                  {selected && <Check size={18} color="#38bdf8" />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 11, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    backgroundColor: '#111622',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 38, 54, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionSelected: {
    backgroundColor: 'rgba(14, 165, 233, 0.18)',
    borderColor: 'rgba(56, 189, 248, 0.65)',
  },
  optionTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#7dd3fc',
  },
  optionDesc: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
