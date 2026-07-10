import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, FlatList, Alert } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.header}>My Habits</Text>
      <Text style={styles.subheader}>
        {doneCount} of {habits.length} completed today
      </Text>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isDoneToday = item.lastCompletedDate === today;
          return (
            <View style={[styles.habitRow, isDoneToday && styles.habitDone]}>
              <Pressable style={styles.habitContent} onPress={() => toggleHabit(item.id)}>
                <Text style={styles.habitText}>
                  {isDoneToday ? '✅' : '⬜️'} {item.title}
                </Text>
                {item.streak > 0 && (
                  <Text style={styles.streakText}>🔥 {item.streak} day streak</Text>
                )}
                {isDoneToday && (
                  <Text style={styles.completedLabel}>Completed for today!</Text>
                )}
              </Pressable>

              <Pressable onPress={() => deleteHabit(item.id, item.title)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color="#E63946" />
              </Pressable>
            </View>
          );
        }}
      />

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a new habit..."
          value={newHabit}
          onChangeText={setNewHabit}
        />
        <Pressable style={styles.addButton} onPress={addHabit}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>Tap the trash icon to delete a habit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold' },
  subheader: { fontSize: 14, color: '#666', marginBottom: 16 },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 10,
  },
  habitContent: { flex: 1 },
  deleteButton: { paddingLeft: 12, paddingVertical: 8, paddingHorizontal: 8 },
  habitDone: { backgroundColor: '#d4f8d4' },
  habitText: { fontSize: 16 },
  streakText: { fontSize: 13, color: '#FF6B6B', marginTop: 4, fontWeight: '600' },
  completedLabel: { fontSize: 12, color: '#2E7D32', marginTop: 4, fontWeight: '600' },
  addRow: { flexDirection: 'row', marginTop: 20, marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginRight: 8 },
  addButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
});