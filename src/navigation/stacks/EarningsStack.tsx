import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EarningDetailScreen } from '@/screens/dribee/earnings/EarningDetailScreen';
import { EarningsScreen } from '@/screens/dribee/earnings/EarningsScreen';
import { PayoutFailedScreen } from '@/screens/dribee/earnings/PayoutFailedScreen';

import type { EarningsStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<EarningsStackParamList>();

export function EarningsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="EarningDetail" component={EarningDetailScreen} />
      <Stack.Screen name="PayoutFailed" component={PayoutFailedScreen} />
    </Stack.Navigator>
  );
}
