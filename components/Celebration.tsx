import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CelebrationProps {
  visible: boolean;
  onDone: () => void;
}

export default function Celebration({ visible, onDone }: CelebrationProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Pop in with a little bounce, then hold, then fade out
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(700),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        scale.setValue(0);
        onDone();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        style={[
          styles.badge,
          { transform: [{ scale }], opacity },
        ]}
      >
        <Ionicons name="checkmark-circle" size={90} color="#4CAF50" />
        <Text style={styles.text}>Well Done!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  badge: {
    backgroundColor: '#FFF8F0',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B1B12',
    marginTop: 10,
  },
});