import { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Logo from '../components/Logo';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HistoryScreen() {
  const [history, setHistory] = useState<Record<string, number>>({});
  const today = new Date();

  useFocusEffect(
    useCallback(() => {
      async function loadHistory() {
        const saved = await AsyncStorage.getItem('habitHistory');
        setHistory(saved ? JSON.parse(saved) : {});
      }
      loadHistory();
    }, [])
  );

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dateKey(day: number) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  const totalThisMonth = Object.entries(history)
    .filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .reduce((sum, [, count]) => sum + count, 0);

  return (
    <ScrollView className="flex-1 bg-background pt-16 px-5">
      <View className="flex-row items-center mb-1">
        <Logo size="small" />
        <Text className="text-4xl font-extrabold text-primary ml-3 tracking-wide">
          HISTORY
        </Text>
      </View>
      <Text className="text-sm text-textMuted mb-5">
        {totalThisMonth} habits completed this month
      </Text>

      <Text className="text-xl font-bold text-textDark mb-3">
        {monthNames[month]} {year}
      </Text>

      <View className="flex-row mb-2">
        {dayLabels.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-bold text-textMuted">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {calendarCells.map((day, index) => {
          if (day === null) {
            return <View key={index} style={{ width: '14.28%' }} className="aspect-square" />;
          }

          const count = history[dateKey(day)] || 0;
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

          return (
            <View key={index} style={{ width: '14.28%' }} className="aspect-square p-1">
              <View
                className={`flex-1 rounded-md items-center justify-center ${
                  count > 0 ? 'bg-accent' : 'bg-card'
                } ${isToday ? 'border-2 border-primary' : ''}`}
              >
                <Text
                  className={`text-sm font-bold ${count > 0 ? 'text-white' : 'text-textDark'}`}
                >
                  {day}
                </Text>
                {count > 0 && (
                  <Text className="text-[10px] text-white">{count}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View className="mt-6 mb-10 flex-row items-center">
        <View className="w-4 h-4 rounded bg-accent mr-2" />
        <Text className="text-xs text-textMuted mr-4">Habits completed</Text>
        <View className="w-4 h-4 rounded bg-card border border-secondary mr-2" />
        <Text className="text-xs text-textMuted">No activity</Text>
      </View>
    </ScrollView>
  );
}