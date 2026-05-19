import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface ScreenContainerProps {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  noSafeArea?: boolean;
}

export function ScreenContainer({
  children,
  edges = ['top', 'left', 'right'],
  noSafeArea = false,
}: ScreenContainerProps) {
  const { colors } = useDribeeTheme();
  if (noSafeArea) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgApp }}>{children}</View>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={edges}>
      {children}
    </SafeAreaView>
  );
}
