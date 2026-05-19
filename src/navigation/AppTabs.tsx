import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, Briefcase, Home, User, Wallet } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { EarningsStack } from '@/navigation/stacks/EarningsStack';
import { HomeStack } from '@/navigation/stacks/HomeStack';
import { JobsStack } from '@/navigation/stacks/JobsStack';
import { ProfileStack } from '@/navigation/stacks/ProfileStack';
import { NotificationsScreen } from '@/screens/dribee/notifications/NotificationsScreen';

import type { AppTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppTabs() {
  const { colors } = useDribeeTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 4);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandNavy,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: colors.bgTabBar,
          borderTopWidth: 1,
          borderTopColor: colors.borderDivider,
          paddingTop: 4,
          paddingBottom: bottomPadding,
          height: 56 + bottomPadding,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <ActiveIconWrap focused={focused}>
              <Home size={size} strokeWidth={1.5} color={color} />
            </ActiveIconWrap>
          ),
        }}
      />
      <Tab.Screen
        name="JobsTab"
        component={JobsStack}
        options={{
          title: 'Jobs',
          tabBarBadge: 1,
          tabBarBadgeStyle: { backgroundColor: colors.statusRejected, color: '#FFF' },
          tabBarIcon: ({ color, size, focused }) => (
            <ActiveIconWrap focused={focused}>
              <Briefcase size={size} strokeWidth={1.5} color={color} />
            </ActiveIconWrap>
          ),
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsStack}
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size, focused }) => (
            <ActiveIconWrap focused={focused}>
              <Wallet size={size} strokeWidth={1.5} color={color} />
            </ActiveIconWrap>
          ),
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={NotificationsScreen}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size, focused }) => (
            <ActiveIconWrap focused={focused}>
              <Bell size={size} strokeWidth={1.5} color={color} />
            </ActiveIconWrap>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <ActiveIconWrap focused={focused}>
              <User size={size} strokeWidth={1.5} color={color} />
            </ActiveIconWrap>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function ActiveIconWrap({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useDribeeTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {children}
      <View
        style={{
          marginTop: 3,
          height: 3,
          width: 20,
          borderRadius: 2,
          backgroundColor: focused ? colors.brandAmber : 'transparent',
        }}
      />
    </View>
  );
}
