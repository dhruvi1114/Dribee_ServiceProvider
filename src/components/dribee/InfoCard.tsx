import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface InfoCardProps {
  tone?: 'amber' | 'teal' | 'navy' | 'red';
  children: ReactNode | string;
  icon?: ReactNode;
}

export function InfoCard({ tone = 'amber', children, icon }: InfoCardProps) {
  const { colors } = useDribeeTheme();
  const accent =
    tone === 'amber'
      ? colors.brandAmber
      : tone === 'teal'
        ? colors.brandTeal
        : tone === 'navy'
          ? colors.brandNavy
          : colors.statusRejected;

  return (
    <View
      style={{
        backgroundColor: `${accent}1A`,
        borderLeftColor: accent,
        borderLeftWidth: 3,
        borderRadius: 8,
        padding: 12,
        flexDirection: icon ? 'row' : 'column',
        gap: 10,
      }}
    >
      {icon ? <View style={{ marginTop: 2 }}>{icon}</View> : null}
      {typeof children === 'string' ? (
        <Text style={{ color: colors.textPrimary, fontSize: 13, flex: 1, lineHeight: 18 }}>
          {children}
        </Text>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </View>
  );
}
