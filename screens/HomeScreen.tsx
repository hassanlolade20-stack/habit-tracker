import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface Habit {
  id: string;
  title: string;
  lastCompletedDate: string | null;
  streak: number;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Drink water', lastCompletedDate: null, streak: 0 },
    { id: '2', title: 'Read 10 pages', lastCompletedDate: null, streak: 0 },
    { id: '3', title: 'Stretch for 5 min', lastCompletedDate: null, streak: 0 },
  ]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    async function loadHabits() {
      const saved = await AsyncStorage.getItem('habits');
      if (saved) {
        setHabits(JSON.parse(saved));
      }
    }
    loadHabits();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  function toggleHabit(id: string) {
    const today = getToday();
    const yesterday = getYesterday();

    setHabits(
      habits.map((habit) => {
        if (habit.id !== id) return habit;

        const isDoneToday = habit.lastCompletedDate === today;

        if (isDoneToday) {
          return { ...habit, lastCompletedDate: null, streak: Math.max(habit.streak - 1, 0) };
        } else {
          const continuingStreak = habit.lastCompletedDate === yesterday;
          return {
            ...habit,
            lastCompletedDate: today,
            streak: continuingStreak ? habit.streak + 1 : 1,
          };
        }
      })
    );
  }

  function addHabit() {
    if (newHabit.trim() === '') return;
    const habit: Habit = {
      id: Date.now().toString(),
      title: newHabit,
      lastCompletedDate: null,
      streak: 0,
    };
    setHabits([...habits, habit]);
    setNewHabit('');
  }

  function deleteHabit(id: string, title: string) {
    Alert.alert(
      'Delete habit?',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setHabits(habits.filter((h) => h.id !== id)),
        },
      ]
    );
  }

  const today = getToday();
  const doneCount = habits.filter((h) => h.lastCompletedDate === today).length;

  return (
    <View className="flex-1 bg-background pt-16 px-5">
      <Text className="text-3xl font-bold text-textDark">My Habits</Text>
      <Text className="text-sm text-textMuted mb-4">
        {doneCount} of {habits.length} completed today
      </Text>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isDoneToday = item.lastCompletedDate === today;
          return (
            <View
              className={`flex-row items-center p-4 rounded-2xl mb-3 ${
                isDoneToday ? 'bg-secondary' : 'bg-card'
              }`}
            >
              <Pressable className="flex-1" onPress={() => toggleHabit(item.id)}>
                <Text className="text-base font-semibold text-textDark">
                  {isDoneToday ? '✅' : '⬜️'} {item.title}
                </Text>
                {item.streak > 0 && (
                  <Text className="text-xs text-primary font-bold mt-1">
                    🔥 {item.streak} day streak
                  </Text>
                )}
                {isDoneToday && (
                  <Text className="text-xs text-accent font-bold mt-1">
                    Completed for today!
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => deleteHabit(item.id, item.title)}
                className="pl-3 py-2 px-2"
              >
                <Ionicons name="trash-outline" size={18} color="#C1502E" />
              </Pressable>
            </View>
          );
        }}
      />

      <View className="flex-row mt-5 mb-2">
        <TextInput
          className="flex-1 border border-secondary rounded-2xl p-3 mr-2 bg-card text-textDark"
          placeholder="Add a new habit..."
          placeholderTextColor="#8B6F5C"
          value={newHabit}
          onChangeText={setNewHabit}
        />
        <Pressable
          className="bg-primary rounded-2xl px-5 justify-center"
          onPress={addHabit}
        >
          <Text className="text-white font-bold">Add</Text>
        </Pressable>
      </View>

      <Text className="text-xs text-textMuted text-center mb-5">
        Tap the trash icon to delete a habit
      </Text>
    </View>
  );
}