import FastImage from 'react-native-fast-image';
import { Text, View } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  fontSize?: number;
}

export function Avatar({ name, uri, size = 36, fontSize }: AvatarProps) {
  const { colors } = useDribeeTheme();
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (uri) {
    return (
      <FastImage
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.brandNavy,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFF',
          fontSize: fontSize ?? Math.round(size * 0.36),
          fontWeight: '700',
        }}
      >
        {initials || '—'}
      </Text>
    </View>
  );
}
