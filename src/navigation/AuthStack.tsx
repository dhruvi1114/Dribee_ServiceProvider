import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@/screens/dribee/auth/LoginScreen';
import { OtpScreen } from '@/screens/dribee/auth/OtpScreen';
import { RegisterScreen } from '@/screens/dribee/auth/RegisterScreen';
import { RegistrationSubmittedScreen } from '@/screens/dribee/auth/RegistrationSubmittedScreen';

import type { AuthStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegistrationSubmitted" component={RegistrationSubmittedScreen} />
    </Stack.Navigator>
  );
}
