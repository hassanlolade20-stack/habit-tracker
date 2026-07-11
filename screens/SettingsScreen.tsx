import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';

export default function SettingsScreen() {
  const [changingPin, setChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  async function handleChangePin() {
    const savedPin = await AsyncStorage.getItem('appPin');
    if (currentPin !== savedPin) {
      Alert.alert('Incorrect PIN', 'Your current PIN is wrong.');
      return;
    }
    if (newPin.length < 4) {
      Alert.alert('PIN too short', 'Please use at least 4 digits.');
      return;
    }
    await AsyncStorage.setItem('appPin', newPin);
    setCurrentPin('');
    setNewPin('');
    setChangingPin(false);
    Alert.alert('Success', 'Your PIN has been updated.');
  }

  function confirmClearData() {
    Alert.alert(
      'Clear all data?',
      'This will permanently delete all your habits and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['habits', 'habitHistory']);
            Alert.alert('Done', 'All habit data has been cleared. Restart the app to see changes.');
          },
        },
      ]
    );
  }

  return (
    <ScrollView className="flex-1 bg-background pt-16 px-5">
      <View className="flex-row items-center mb-6">
        <Logo size="small" />
        <Text className="text-4xl font-extrabold text-primary ml-3 tracking-wide">
          SETTINGS
        </Text>
      </View>

      {/* Change PIN section */}
      <View className="bg-card rounded-md p-4 mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="lock-closed" size={20} color="#C1502E" />
          <Text className="text-lg font-bold text-textDark ml-2">App Lock</Text>
        </View>

        {!changingPin ? (
          <Pressable
            className="bg-primary rounded-2xl py-3 items-center mt-2"
            onPress={() => setChangingPin(true)}
          >
            <Text className="text-white font-bold">Change PIN</Text>
          </Pressable>
        ) : (
          <View>
            <TextInput
              className="border border-secondary rounded-2xl p-3 mb-3 bg-background text-textDark"
              placeholder="Current PIN"
              placeholderTextColor="#8B6F5C"
              value={currentPin}
              onChangeText={setCurrentPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
            <TextInput
              className="border border-secondary rounded-2xl p-3 mb-3 bg-background text-textDark"
              placeholder="New PIN"
              placeholderTextColor="#8B6F5C"
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
            <View className="flex-row">
              <Pressable
                className="flex-1 bg-primary rounded-2xl py-3 items-center mr-2"
                onPress={handleChangePin}
              >
                <Text className="text-white font-bold">Save</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-secondary rounded-2xl py-3 items-center"
                onPress={() => {
                  setChangingPin(false);
                  setCurrentPin('');
                  setNewPin('');
                }}
              >
                <Text className="text-textDark font-bold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Data management section */}
      <View className="bg-card rounded-md p-4 mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="trash" size={20} color="#C1502E" />
          <Text className="text-lg font-bold text-textDark ml-2">Data</Text>
        </View>
        <Text className="text-xs text-textMuted mb-3">
          Permanently delete all habits and history from this device.
        </Text>
        <Pressable
          className="bg-white border border-primary rounded-2xl py-3 items-center"
          onPress={confirmClearData}
        >
          <Text className="text-primary font-bold">Clear All Data</Text>
        </Pressable>
      </View>

      {/* About section */}
      <View className="bg-card rounded-md p-4 mb-10 items-center">
        <Logo size="large" />
        <Text className="text-lg font-extrabold text-primary mt-3 tracking-wide">
          MY HABITS
        </Text>
        <Text className="text-xs text-textMuted mt-1">Build today, become tomorrow</Text>
        <Text className="text-xs text-textMuted mt-3">Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}