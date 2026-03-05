import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';

interface NameStepProps {
    name: string;
    onNameChange: (name: string) => void;
    legalAccepted: boolean;
    onLegalToggle: (accepted: boolean) => void;
}

const NameStep: React.FC<NameStepProps> = ({ name, onNameChange, legalAccepted, onLegalToggle }) => {
    return (
        <View style={styles.stepContainer}>
            <TextInput
                style={styles.textInput}
                placeholder="Введи своё имя"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={name}
                onChangeText={onNameChange}
                autoFocus
            />
            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => onLegalToggle(!legalAccepted)}
            >
                <View style={[styles.checkbox, legalAccepted && styles.checkboxSelected]}>
                    {legalAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                    Я принимаю{' '}
                    <Text
                        style={[styles.checkboxLabel, styles.linkText]}
                        onPress={() => Linking.openURL('https://example.com/terms')}
                    >
                        Пользовательское соглашение
                    </Text>{' '}
                    и{' '}
                    <Text
                        style={[styles.checkboxLabel, styles.linkText]}
                        onPress={() => Linking.openURL('https://example.com/privacy')}
                    >
                        Политику конфиденциальности
                    </Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        fontSize: 18,
        color: '#ffffff',
        borderWidth: 1,
        borderBottomWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.4)',
        marginBottom: 10,
        textAlign: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    checkboxSelected: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
    },
    checkmark: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    linkText: {
        color: '#FFD700',
        textDecorationLine: 'underline',
    },
});

export default NameStep;
