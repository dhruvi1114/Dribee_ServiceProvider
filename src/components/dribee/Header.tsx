import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: ReactNode;
  onBack?: () => void;
}

export function Header({ title, showBack = true, rightElement, onBack }: HeaderProps) {
  const { colors } = useDribeeTheme();
  const navigation = useNavigation();
  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <View
      style={{
        backgroundColor: colors.bgHeader,
        borderBottomColor: colors.borderDivider,
        borderBottomWidth: 1,
      }}
      className="h-14 flex-row items-center justify-between px-2"
    >
      <View className="w-12">
        {showBack ? (
          <Pressable onPress={handleBack} className="h-12 w-12 items-center justify-center">
            <ChevronLeft size={24} strokeWidth={1.5} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}
      >
        {title}
      </Text>
      <View className="w-12 items-end pr-2">{rightElement ?? null}</View>
    </View>
  );
}
