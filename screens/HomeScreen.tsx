import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import Celebration from '../components/Celebration';

type Category = 'Health' | 'Fitness' | 'Learning' | 'Other';

interface Habit {
  id: string;
  title: string;
  lastCompletedDate: string | null;
  streak: number;
  category: Category;
}

const categoryColors: Record<Category, string> = {
  Health: '#4CAF50',
  Fitness: '#E63946',
  Learning: '#3B82F6',
  Other: '#8B6F5C',
};

const categories: Category[] = ['Health', 'Fitness', 'Learning', 'Other'];

const cardColors = ['#F4A896', '#F6C99C', '#B8D8B8', '#A8D0DB', '#D6B8E8'];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getHabitIcon(title: string): keyof typeof Ionicons.glyphMap {
  const lower = title.toLowerCase();
  if (lower.includes('water') || lower.includes('drink')) return 'water';
  if (lower.includes('read') || lower.includes('book')) return 'book';
  if (lower.includes('run') || lower.includes('walk') || lower.includes('exercise')) return 'walk';
  if (lower.includes('sleep') || lower.includes('bed')) return 'moon';
  if (lower.includes('stretch') || lower.includes('yoga')) return 'body';
  if (lower.includes('meditat')) return 'leaf';
  if (lower.includes('eat') || lower.includes('food') || lower.includes('meal')) return 'restaurant';
  if (lower.includes('study') || lower.includes('learn')) return 'school';
  if (lower.includes('gym') || lower.includes('workout')) return 'barbell';
  if (lower.includes('clean')) return 'sparkles';
  if (lower.includes('journal') || lower.includes('write')) return 'create';
  return 'checkmark-circle';
}

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Drink water', lastCompletedDate: null, streak: 0, category: 'Health' },
    { id: '2', title: 'Read 10 pages', lastCompletedDate: null, streak: 0, category: 'Learning' },
    { id: '3', title: 'Stretch for 5 min', lastCompletedDate: null, streak: 0, category: 'Fitness' },
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Health');
  const [showCelebration, setShowCelebration] = useState(false);

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

  async function logHistory(date: string, delta: number) {
    const saved = await AsyncStorage.getItem('habitHistory');
    const history: Record<string, number> = saved ? JSON.parse(saved) : {};
    const current = history[date] || 0;
    const updated = Math.max(current + delta, 0);
    history[date] = updated;
    await AsyncStorage.setItem('habitHistory', JSON.stringify(history));
  }

  function toggleHabit(id: string) {
    const today = getToday();
    const yesterday = getYesterday();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const isDoneToday = habit.lastCompletedDate === today;

    logHistory(today, isDoneToday ? -1 : 1);

    if (!isDoneToday) {
      setShowCelebration(true);
    }

    setHabits(
      habits.map((h) => {
        if (h.id !== id) return h;

        if (isDoneToday) {
          return { ...h, lastCompletedDate: null, streak: Math.max(h.streak - 1, 0) };
        } else {
          const continuingStreak = h.lastCompletedDate === yesterday;
          return {
            ...h,
            lastCompletedDate: today,
            streak: continuingStreak ? h.streak + 1 : 1,
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
      category: selectedCategory,
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
      <View className="flex-row items-center mb-1">
        <Logo size="small" />
        <Text className="text-4xl font-extrabold text-primary ml-3 tracking-wide">
          MY HABITS
        </Text>
      </View>
      <Text className="text-sm text-textMuted mb-4">
        {doneCount} of {habits.length} completed today
      </Text>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        renderItem={({ item, index }) => {
          const isDoneToday = item.lastCompletedDate === today;
          const cardColor = cardColors[index % cardColors.length];

          return (
            <View
              style={{ backgroundColor: cardColor, width: '48%', aspectRatio: 1 }}
              className="rounded-md p-3 mb-3 justify-between"
            >
              <Pressable className="flex-1" onPress={() => toggleHabit(item.id)}>
                <View className="flex-row items-center">
                  <View
                    style={{ backgroundColor: categoryColors[item.category] }}
                    className="w-2 h-2 rounded-full mr-1"
                  />
                  <Text className="text-[10px] font-bold text-textDark">
                    {item.category}
                  </Text>
                </View>

                <Text className="text-base font-bold text-textDark mt-1" numberOfLines={2}>
                  {item.title}
                </Text>

                <View className="flex-1 justify-center items-center">
                  <Ionicons
                    name={getHabitIcon(item.title)}
                    size={40}
                    color={isDoneToday ? '#FFFFFF' : '#2B1B12'}
                  />
                </View>

                {item.streak > 0 && (
                  <Text className="text-xs font-bold text-primary">
                    🔥 {item.streak} day streak
                  </Text>
                )}
                {isDoneToday && (
                  <Text className="text-xs font-bold text-textDark">
                    Completed for today!
                  </Text>
                )}
              </Pressable>

              {isDoneToday && (
                <View className="absolute top-2 left-2 bg-white rounded-full w-6 h-6 items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="#4CAF50" />
                </View>
              )}

              <Pressable
                onPress={() => deleteHabit(item.id, item.title)}
                className="absolute top-2 right-2"
              >
                <Ionicons name="trash-outline" size={16} color="#2B1B12" />
              </Pressable>
            </View>
          );
        }}
      />

      {/* Category picker for the new habit being added */}
      <View className="flex-row mb-2">
        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={{
              backgroundColor: selectedCategory === cat ? categoryColors[cat] : '#FFF8F0',
              borderColor: categoryColors[cat],
            }}
            className="border rounded-full px-3 py-1 mr-2"
          >
            <Text
              className="text-xs font-bold"
              style={{ color: selectedCategory === cat ? '#FFFFFF' : categoryColors[cat] }}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row mt-2 mb-2">
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

      <Celebration visible={showCelebration} onDone={() => setShowCelebration(false)} />
    </View>
  );
}