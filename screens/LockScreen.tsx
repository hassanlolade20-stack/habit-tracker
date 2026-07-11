import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';

interface LockScreenProps {
  hasPin: boolean;
  onUnlock: () => void;
}

export default function LockScreen({ hasPin, onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

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
      <View style={styles.logoWrapper}>
        <Logo size="large" />
      </View>

      <Text style={styles.appName}>MY HABITS</Text>

      <Text style={styles.header}>{hasPin ? 'Enter PIN' : 'Create a PIN'}</Text>
      <Text style={styles.subtext}>
        {hasPin ? 'Enter your PIN to unlock' : 'Set a PIN to protect your habits'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        placeholderTextColor="#8B6F5C"
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
          placeholderTextColor="#8B6F5C"
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
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FBDCC0',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#C1502E',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2B1B12',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#8B6F5C',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8A87C',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    backgroundColor: '#FFF8F0',
    color: '#2B1B12',
  },
  button: {
    backgroundColor: '#C1502E',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF8F0',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});