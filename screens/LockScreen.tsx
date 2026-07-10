import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LockScreenProps {
  hasPin: boolean;
  onUnlock: () => void;
}

export default function LockScreen({ hasPin, onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Called when creating a PIN for the first time
  async function createPin() {
    if (pin.length < 4) {
      Alert.alert('PIN too short', 'Please use at least 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert("PINs don't match", 'Please try again.');
      setPin('');
      setConfirmPin('');
      return;
    }
    await AsyncStorage.setItem('appPin', pin);
    onUnlock();
  }

  // Called when entering an existing PIN
  async function checkPin() {
    const savedPin = await AsyncStorage.getItem('appPin');
    if (pin === savedPin) {
      onUnlock();
    } else {
      Alert.alert('Incorrect PIN', 'Please try again.');
      setPin('');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{hasPin ? 'Enter PIN' : 'Create a PIN'}</Text>
      <Text style={styles.subtext}>
        {hasPin ? 'Enter your PIN to unlock' : 'Set a PIN to protect your habits'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
      />

      {!hasPin && (
        <TextInput
          style={styles.input}
          placeholder="Confirm PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
      )}

      <Pressable style={styles.button} onPress={hasPin ? checkPin : createPin}>
        <Text style={styles.buttonText}>{hasPin ? 'Unlock' : 'Set PIN'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtext: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: { backgroundColor: '#4CAF50', borderRadius: 10, padding: 16, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
});