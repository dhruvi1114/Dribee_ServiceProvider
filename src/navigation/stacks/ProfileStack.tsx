import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AvailabilityScreen } from '@/screens/dribee/profile/AvailabilityScreen';
import { BankDetailsScreen } from '@/screens/dribee/profile/BankDetailsScreen';
import { EditProfileScreen } from '@/screens/dribee/profile/EditProfileScreen';
import { HelpSupportScreen } from '@/screens/dribee/profile/HelpSupportScreen';
import { JobHistoryScreen } from '@/screens/dribee/profile/JobHistoryScreen';
import { MyRatingsScreen } from '@/screens/dribee/profile/MyRatingsScreen';
import { ProfileScreen } from '@/screens/dribee/profile/ProfileScreen';
import { SkillsZonesScreen } from '@/screens/dribee/profile/SkillsZonesScreen';

import type { ProfileStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
      <Stack.Screen name="SkillsZones" component={SkillsZonesScreen} />
      <Stack.Screen name="Availability" component={AvailabilityScreen} />
      <Stack.Screen name="MyRatings" component={MyRatingsScreen} />
      <Stack.Screen name="JobHistory" component={JobHistoryScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}
