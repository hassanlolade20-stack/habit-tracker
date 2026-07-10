import { View, Text, StyleSheet } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>History</Text>
      <Text style={styles.subtext}>Your completed days will show up here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold' },
  subtext: { fontSize: 14, color: '#666', marginTop: 10 },
});