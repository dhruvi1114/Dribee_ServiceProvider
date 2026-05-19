import { Text, View } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface StatCardProps {
  label: string;
  value: string;
  accentColor: string;
}

export function StatCard({ label, value, accentColor }: StatCardProps) {
  const { colors } = useDribeeTheme();
  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        height: 88,
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
        flex: 1,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      }}
    >
      <Text style={{ color: accentColor, fontSize: 28, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{label}</Text>
    </View>
  );
}
