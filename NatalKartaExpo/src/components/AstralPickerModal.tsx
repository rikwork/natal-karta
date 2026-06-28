import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import AstralButton from './AstralButton';

interface AstralPickerModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmTitle?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AstralPickerModal: React.FC<AstralPickerModalProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  confirmTitle = 'Готово',
  children,
  style,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, style]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>{children}</View>

          <AstralButton
            title={confirmTitle}
            onPress={onConfirm}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 9, 26, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#14142B',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    minHeight: 380,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: '#FFD700',
    fontFamily: theme.fonts.heading,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
  },
  body: {
    flex: 1,
    marginBottom: 24,
  },
  confirmButton: {
    height: 56,
    borderRadius: 18,
  },
});

export default AstralPickerModal;
