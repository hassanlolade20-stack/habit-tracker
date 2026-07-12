import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Logo from '../components/Logo';
import Celebration from '../components/Celebration';
import {
  requestNotificationPermission,
  scheduleHabitReminder,
  cancelHabitReminder,
} from '../utils/notifications';

type Category = 'Health' | 'Fitness' | 'Learning' | 'Other';

interface Habit {
  id: string;
  title: string;
  lastCompletedDate: string | null;
  streak: number;
  category: Category;
  reminderHour: number | null;
  reminderMinute: number | null;
}

const categoryColors: Record<Category, string> = {
  Health: '#4CAF50',
  Fitness: '#E63946',
  Learning: '#3B82F6',
  Other: '#8B6F5C',
};

const categoryOrder: Category[] = ['Health', 'Fitness', 'Learning', 'Other'];
const cardColors = ['#F4A896', '#F6C99C', '#B8D8B8', '#A8D0DB', '#D6B8E8'];

const screenWidth = Dimensions.get('window').width;
const CARD_SIZE = (screenWidth - 20 * 2 - 12) / 2;

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

function getHabitCategory(title: string): Category {
  const lower = title.toLowerCase();
  if (
    lower.includes('water') || lower.includes('drink') || lower.includes('sleep') ||
    lower.includes('meditat') || lower.includes('eat') || lower.includes('food') ||
    lower.includes('meal') || lower.includes('vitamin') || lower.includes('doctor')
  ) {
    return 'Health';
  }
  if (
    lower.includes('run') || lower.includes('walk') || lower.includes('exercise') ||
    lower.includes('gym') || lower.includes('workout') || lower.includes('stretch') ||
    lower.includes('yoga') || lower.includes('swim')
  ) {
    return 'Fitness';
  }
  if (
    lower.includes('read') || lower.includes('book') || lower.includes('study') ||
    lower.includes('learn') || lower.includes('course') || lower.includes('practice') ||
    lower.includes('journal') || lower.includes('write')
  ) {
    return 'Learning';
  }
  return 'Other';
}

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Drink water', lastCompletedDate: null, streak: 0, category: 'Health', reminderHour: null, reminderMinute: null },
    { id: '2', title: 'Read 10 pages', lastCompletedDate: null, streak: 0, category: 'Learning', reminderHour: null, reminderMinute: null },
    { id: '3', title: 'Stretch for 5 min', lastCompletedDate: null, streak: 0, category: 'Fitness', reminderHour: null, reminderMinute: null },
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [pickerHabitId, setPickerHabitId] = useState<string | null>(null);

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
      category: getHabitCategory(newHabit),
      reminderHour: null,
      reminderMinute: null,
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
          onPress: async () => {
            await cancelHabitReminder(id);
            setHabits(habits.filter((h) => h.id !== id));
          },
        },
      ]
    );
  }

  async function handleTimeChange(event: any, selectedDate: Date | undefined, habitId: string) {
    setPickerHabitId(null);

    if (event.type === 'dismissed' || !selectedDate) return;

    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('Permission needed', 'Please allow notifications to set a reminder.');
      return;
    }

    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    await scheduleHabitReminder(habitId, habit.title, hour, minute);

    setHabits(
      habits.map((h) =>
        h.id === habitId ? { ...h, reminderHour: hour, reminderMinute: minute } : h
      )
    );
  }

  async function handleRemoveReminder(habitId: string) {
    await cancelHabitReminder(habitId);
    setHabits(
      habits.map((h) =>
        h.id === habitId ? { ...h, reminderHour: null, reminderMinute: null } : h
      )
    );
  }

  const today = getToday();
  const doneCount = habits.filter((h) => h.lastCompletedDate === today).length;

  const colorMap: Record<string, string> = {};
  habits.forEach((h, i) => {
    colorMap[h.id] = cardColors[i % cardColors.length];
  });

  function renderCard(item: Habit) {
    const isDoneToday = item.lastCompletedDate === today;
    const cardColor = colorMap[item.id];

    return (
      <View
        key={item.id}
        style={{
          backgroundColor: cardColor,
          width: CARD_SIZE,
          height: CARD_SIZE,
          borderRadius: 12,
          padding: 12,
          justifyContent: 'space-between',
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={() => toggleHabit(item.id)}>
          <Text className="text-base font-bold text-textDark" numberOfLines={2}>
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

        <Pressable
          onPress={() =>
            item.reminderHour !== null ? handleRemoveReminder(item.id) : setPickerHabitId(item.id)
          }
          className="absolute bottom-2 right-2 flex-row items-center"
        >
          <Ionicons
            name={item.reminderHour !== null ? 'notifications' : 'notifications-outline'}
            size={16}
            color="#2B1B12"
          />
          {item.reminderHour !== null && (
            <Text className="text-[10px] font-bold text-textDark ml-1">
              {String(item.reminderHour).padStart(2, '0')}:{String(item.reminderMinute).padStart(2, '0')}
            </Text>
          )}
        </Pressable>

        {pickerHabitId === item.id && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={false}
            onChange={(event, date) => handleTimeChange(event, date, item.id)}
          />
        )}

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
  }

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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {habits.length === 0 && (
          <Text className="text-textMuted text-center mt-10">
            No habits yet — add one below to get started!
          </Text>
        )}

        {categoryOrder.map((cat) => {
          const habitsInCategory = habits.filter((h) => h.category === cat);
          if (habitsInCategory.length === 0) return null;

          return (
            <View key={cat} className="mb-4">
              <View className="flex-row items-center mb-2">
                <View
                  style={{ backgroundColor: categoryColors[cat] }}
                  className="w-3 h-3 rounded-full mr-2"
                />
                <Text className="text-lg font-bold text-textDark">{cat}</Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                {habitsInCategory.map((item) => renderCard(item))}
              </View>
            </View>
          );
        })}
      </ScrollView>

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
        Tap the bell to set a reminder, trash to delete
      </Text>

      <Celebration visible={showCelebration} onDone={() => setShowCelebration(false)} />
    </View>
  );
}