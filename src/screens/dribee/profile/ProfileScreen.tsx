import { useNavigation } from '@react-navigation/native';
import {
  Bell,
  Briefcase,
  ChevronRight,
  Clock,
  Headset,
  LogOut,
  Moon,
  Star,
  ToggleLeft,
  Wallet,
  Wrench,
  Landmark,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { Avatar, PrimaryButton } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useLogout } from '@/hooks/useLogout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useProMe } from '@/services/pro/pro.query';
import { setThemeMode } from '@/store/slices/themeSlice';

import type {
  AppTabParamList,
  ProfileStackParamList,
  ProfileStackScreenProps,
} from '@/navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LucideIcon } from 'lucide-react-native';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'Profile'>,
  BottomTabNavigationProp<AppTabParamList>
>;

interface MenuItem {
  key: keyof ProfileStackParamList | 'logout' | 'darkMode' | 'notifications';
  label: string;
  icon: LucideIcon;
  iconColor: 'navy' | 'amber' | 'teal' | 'blue' | 'red';
  onPress?: () => void;
  rightSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
}

export function ProfileScreen(_props: ProfileStackScreenProps<'Profile'>) {
  const { colors, isDark } = useDribeeTheme();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.theme.mode);
  const reduxPro = useAppSelector((s) => s.pro.pro);
  const { data: apiPro } = useProMe();
  const performLogout = useLogout();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void performLogout();
        },
      },
    ]);
  };

  const handleThemeToggle = (value: boolean) => {
    dispatch(setThemeMode(value ? 'dark' : 'light'));
  };

  const themeLabel =
    themeMode === 'system' ? 'Dark Mode (system)' : themeMode === 'dark' ? 'Dark Mode' : 'Light Mode';
  // Live API drives everything that exists server-side. Redux only supplies
  // fields we haven't wired yet (e.g. avatar). Stats come from the backend
  // subqueries on /service/pros/me — never from mock data.
  const pro = apiPro
    ? {
        ...reduxPro,
        name: apiPro.name,
        phone: apiPro.phone,
        email: apiPro.email ?? reduxPro.email,
        isAvailable: apiPro.is_available,
        status: apiPro.status === 'active' ? ('approved' as const) : reduxPro.status,
        rating: apiPro.avg_rating ?? 0,
        totalJobs: apiPro.jobs_completed ?? 0,
      }
    : reduxPro;

  const colorMap: Record<MenuItem['iconColor'], string> = {
    navy: colors.brandNavy,
    amber: colors.brandAmber,
    teal: colors.brandTeal,
    blue: colors.brandBlue,
    red: colors.statusRejected,
  };

  const menu: MenuItem[] = [
    {
      key: 'MyRatings',
      label: 'My Ratings',
      icon: Star,
      iconColor: 'amber',
      onPress: () => navigation.navigate('MyRatings'),
    },
    {
      key: 'JobHistory',
      label: 'Job History',
      icon: Clock,
      iconColor: 'navy',
      onPress: () => navigation.navigate('JobHistory'),
    },
    {
      key: 'notifications',
      label: 'My Earnings',
      icon: Wallet,
      iconColor: 'teal',
      onPress: () => navigation.navigate('EarningsTab', { screen: 'Earnings' }),
    },
    {
      key: 'BankDetails',
      label: 'Bank Details',
      icon: Landmark,
      iconColor: 'navy',
      onPress: () => navigation.navigate('BankDetails'),
    },
    {
      key: 'SkillsZones',
      label: 'Skills & Zones',
      icon: Wrench,
      iconColor: 'blue',
      onPress: () => navigation.navigate('SkillsZones'),
    },
    {
      key: 'Availability',
      label: 'Availability Settings',
      icon: ToggleLeft,
      iconColor: 'teal',
      onPress: () => navigation.navigate('Availability'),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: Bell,
      iconColor: 'navy',
      onPress: () => navigation.navigate('AlertsTab'),
    },
    {
      key: 'HelpSupport',
      label: 'Help & Support',
      icon: Headset,
      iconColor: 'navy',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      key: 'darkMode',
      label: themeLabel,
      icon: Moon,
      iconColor: 'navy',
      rightSwitch: true,
      switchValue: isDark,
      onSwitchChange: handleThemeToggle,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: LogOut,
      iconColor: 'red',
      destructive: true,
      onPress: handleLogout,
    },
  ];

  return (
    <ScreenContainer>
      <View
        style={{
          backgroundColor: colors.bgHeader,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderDivider,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Profile card */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            margin: 16,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          <Avatar name={pro.name} uri={pro.avatar} size={72} fontSize={24} />
          <Text
            style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 12 }}
          >
            {pro.name}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
            {pro.phone}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pill bg={`${colors.brandAmber}26`} color={colors.brandAmber} label="Pro" />
            <Pill
              bg={`${pro.isAvailable ? colors.brandTeal : colors.statusRejected}26`}
              color={pro.isAvailable ? colors.brandTeal : colors.statusRejected}
              label={pro.isAvailable ? 'Available' : 'Unavailable'}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginTop: 10,
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                strokeWidth={1.5}
                color={i < Math.round(pro.rating) ? colors.brandAmber : colors.borderCard}
                fill={i < Math.round(pro.rating) ? colors.brandAmber : 'transparent'}
              />
            ))}
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 4 }}>
              {pro.rating.toFixed(1)} ({pro.totalJobs} jobs)
            </Text>
          </View>

          <View style={{ marginTop: 12, width: 140 }}>
            <PrimaryButton
              label="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
              variant="outlined"
              color={colors.textPrimary}
              height={36}
            />
          </View>
        </View>

        {/* Menu */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
            overflow: 'hidden',
          }}
        >
          {menu.map((item, idx) => (
            <MenuRow
              key={`${item.key}-${idx}`}
              item={item}
              iconColor={colorMap[item.iconColor]}
              isLast={idx === menu.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Pill({ bg, color, label }: { bg: string; color: string; label: string }) {
  return (
    <View style={{ backgroundColor: bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function MenuRow({
  item,
  iconColor,
  isLast,
}: {
  item: MenuItem;
  iconColor: string;
  isLast: boolean;
}) {
  const { colors } = useDribeeTheme();
  const Icon: ComponentType<{ size: number; strokeWidth: number; color: string }> = item.icon;

  return (
    <Pressable
      onPress={item.onPress}
      style={{
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.borderDivider,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.bgSection,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} strokeWidth={1.5} color={iconColor} />
      </View>
      <Text
        style={{
          flex: 1,
          color: item.destructive ? colors.statusRejected : colors.textPrimary,
          fontSize: 15,
          fontWeight: '500',
        }}
      >
        {item.label}
      </Text>
      {item.rightSwitch ? (
        <Switch
          value={item.switchValue ?? false}
          onValueChange={item.onSwitchChange}
          trackColor={{ true: colors.brandTeal, false: colors.borderInput }}
          thumbColor="#FFF"
        />
      ) : (
        <ChevronRight size={16} strokeWidth={1.5} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}
