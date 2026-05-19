import { Text, View } from 'react-native';

interface StatusChipProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export function StatusChip({ label, color, size = 'md' }: StatusChipProps) {
  const py = size === 'sm' ? 2 : 4;
  const px = size === 'sm' ? 8 : 10;
  const fs = size === 'sm' ? 10 : 11;
  return (
    <View
      style={{
        backgroundColor: `${color}26`, // ~15% alpha
        borderRadius: 20,
        paddingVertical: py,
        paddingHorizontal: px,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color,
          fontSize: fs,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
