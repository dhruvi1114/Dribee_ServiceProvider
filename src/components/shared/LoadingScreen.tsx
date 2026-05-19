import { ActivityIndicator, View } from 'react-native';

import { COLORS } from '@/constants/colors';

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={COLORS.primary[500]} />
    </View>
  );
}
