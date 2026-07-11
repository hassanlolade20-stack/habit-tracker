import { Image } from 'react-native';

interface LogoProps {
  size?: 'small' | 'large';
}

export default function Logo({ size = 'small' }: LogoProps) {
  const isLarge = size === 'large';
  const dimension = isLarge ? 90 : 44;

  return (
    <Image
      source={require('../assets/logo.png')}
      style={{ width: dimension, height: dimension, borderRadius: isLarge ? 20 : 10 }}
      resizeMode="contain"
    />
  );
}