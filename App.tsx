import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, FlatList } from 'react-native';

// 1. TYPESCRIPT: define the "shape" of a Habit.
// This means every habit MUST have these 3 fields, or TypeScript will complain.
interface Habit {
  id: string;
  title: string;
  done: boolean;
}

export default function App() {
  // 2. STATE: the list of habits. Starts with 3 examples.
  // <Habit[]> tells TypeScript "this state is an array of Habit objects"
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Drink water', done: false },
    { id: '2', title: 'Read 10 pages', done: false },
    { id: '3', title: 'Stretch for 5 min', done: false },
  ]);

  // 3. STATE: what the user is currently typing in the input box
  const [newHabit, setNewHabit] = useState('');

  // 4. This function toggles one habit's "done" status by id
  function toggleHabit(id: string) {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, done: !habit.done } : habit
      )
    );
  }

  // 5. This function adds a new habit to the list
  function addHabit() {
    if (newHabit.trim() === '') return; // ignore empty input
    const habit: Habit = {
      id: Date.now().toString(), // quick unique id
      title: newHabit,
      done: false,
    };
    setHabits([...habits, habit]);
    setNewHabit(''); // clear the input box after adding
  }

  const doneCount = habits.filter((h) => h.done).length;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Habits</Text>
      <Text style={styles.subheader}>
        {doneCount} of {habits.length} done today
      </Text>

      {/* List of habits */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // 6. TOUCH HANDLING: Pressable makes each row tappable
          <Pressable
            onPress={() => toggleHabit(item.id)}
            style={[styles.habitRow, item.done && styles.habitDone]}
          >
            <Text style={styles.habitText}>
              {item.done ? '✅' : '⬜️'} {item.title}
            </Text>
          </Pressable>
        )}
      />

      {/* Add new habit */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a new habit..."
          value={newHabit}
          onChangeText={setNewHabit} // updates state on every keystroke
        />
        <Pressable style={styles.addButton} onPress={addHabit}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold' },
  subheader: { fontSize: 14, color: '#666', marginBottom: 16 },
  habitRow: {
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 10,
  },
  habitDone: { backgroundColor: '#d4f8d4' },
  habitText: { fontSize: 16 },
  addRow: { flexDirection: 'row', marginTop: 20, marginBottom: 30 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});
