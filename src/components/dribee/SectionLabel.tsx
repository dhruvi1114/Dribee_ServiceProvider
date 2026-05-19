import { Text } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

export function SectionLabel({
  label,
  marginTop = 20,
}: {
  label: string;
  marginTop?: number;
}) {
  const { colors } = useDribeeTheme();
  return (
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop,
      }}
    >
      {label}
    </Text>
  );
}
