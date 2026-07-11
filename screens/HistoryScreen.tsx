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

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

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
    <ScrollView
      className="flex-1 bg-background px-5"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: 64, paddingBottom: 40 }}
    >
      <View className="flex-row items-center mb-1">
        <Logo size="small" />
        <Text className="text-4xl font-extrabold text-primary ml-3 tracking-wide">
          HISTORY
        </Text>
      </View>
      <Text className="text-sm text-textMuted mb-5">
        {totalThisMonth} habits completed this month
      </Text>

      {/* Weekly stats bar chart */}
      <View className="bg-card rounded-md p-4 mb-6">
        <Text className="text-lg font-bold text-textDark mb-4">This Week</Text>
        <View className="flex-row items-end justify-between" style={{ height: 100 }}>
          {getLast7Days().map((date) => {
            const count = history[date] || 0;
            const maxHeight = 80;
            const barHeight = count === 0 ? 4 : Math.min(count * 20, maxHeight);
            const dayLabel = dayLabels[new Date(date).getDay()];
            const isToday = date === getToday();

            return (
              <View key={date} className="items-center" style={{ width: '12%' }}>
                <View
                  style={{
                    height: barHeight,
                    width: '100%',
                    backgroundColor: count > 0 ? '#C1502E' : '#E8A87C',
                    borderRadius: 6,
                  }}
                />
                <Text
                  className={`text-xs mt-2 ${isToday ? 'font-bold text-primary' : 'text-textMuted'}`}
                >
                  {dayLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text className="text-xl font-bold text-textDark mb-3">
        {monthNames[month]} {year}
      </Text>

      {/* Day-of-week header row */}
      <View className="flex-row mb-2">
        {dayLabels.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-bold text-textMuted">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
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

      <View className="mt-6 flex-row items-center">
        <View className="w-4 h-4 rounded bg-accent mr-2" />
        <Text className="text-xs text-textMuted mr-4">Habits completed</Text>
        <View className="w-4 h-4 rounded bg-card border border-secondary mr-2" />
        <Text className="text-xs text-textMuted">No activity</Text>
      </View>
    </ScrollView>
  );
}