import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppTabs } from '@/navigation/AppTabs';
import { AuthStack } from '@/navigation/AuthStack';
import { linking } from '@/navigation/linking';
import { useBookingOfferListener } from '@/hooks/useBookingOfferListener';
import { BookingOfferScreen } from '@/screens/dribee/jobs/BookingOfferScreen';
import { SplashScreen } from '@/screens/dribee/SplashScreen';

import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStackNavigator() {
  // Mounted inside NavigationContainer so it can call useNavigation, and
  // inside Redux/QueryClient so it can read auth state and run queries.
  useBookingOfferListener();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="App" component={AppTabs} />
      <Stack.Screen
        name="BookingOffer"
        component={BookingOfferScreen}
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
