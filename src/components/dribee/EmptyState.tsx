import { Inbox } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/dribee/PrimaryButton';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, subtitle, icon, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useDribeeTheme();
  return (
    <View className="items-center justify-center px-8 py-16" style={{ gap: 12 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.bgSection,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon ?? <Inbox size={36} strokeWidth={1.5} color={colors.textTertiary} />}
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{title}</Text>
      {subtitle ? (
        <Text
          style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}
        >
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: 8 }}>
          <PrimaryButton label={actionLabel} onPress={onAction} fullWidth={false} height={44} />
        </View>
      ) : null}
    </View>
  );
}
