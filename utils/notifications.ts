import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

// Schedule (or replace) a reminder tied to ONE specific habit
export async function scheduleHabitReminder(
  habitId: string,
  habitTitle: string,
  hour: number,
  minute: number
) {
  await ensureAndroidChannel();

  // Cancel any existing reminder for this specific habit first (avoids duplicates)
  await Notifications.cancelScheduledNotificationAsync(habitId);

  await Notifications.scheduleNotificationAsync({
    identifier: habitId,
    content: {
      title: 'MY HABITS 🔥',
      body: `Time to: ${habitTitle}`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// Cancel the reminder for one specific habit (e.g. when deleted or turned off)
export async function cancelHabitReminder(habitId: string) {
  await Notifications.cancelScheduledNotificationAsync(habitId);
}