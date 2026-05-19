import { Pressable, Text } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: 'navy' | 'amber' | 'teal' | 'rejected';
  size?: 'sm' | 'md';
}

export function Chip({ label, selected, onPress, variant = 'navy', size = 'md' }: ChipProps) {
  const { colors } = useDribeeTheme();
  const accent =
    variant === 'navy'
      ? colors.brandNavy
      : variant === 'amber'
        ? colors.brandAmber
        : variant === 'teal'
          ? colors.brandTeal
          : colors.statusRejected;

  const py = size === 'sm' ? 6 : 8;
  const px = size === 'sm' ? 12 : 14;

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: py,
        paddingHorizontal: px,
        borderRadius: 20,
        backgroundColor: selected ? accent : colors.bgSection,
        borderWidth: selected ? 0 : 1,
        borderColor: colors.borderCard,
      }}
    >
      <Text
        style={{
          color: selected ? '#FFF' : colors.textSecondary,
          fontSize: 13,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
