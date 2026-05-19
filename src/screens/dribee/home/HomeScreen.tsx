import { useNavigation } from '@react-navigation/native';
import { Bell, Briefcase, Calendar, Clock, MapPin, Wallet } from 'lucide-react-native';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { Avatar, PrimaryButton, StatCard, StatusChip } from '@/components/dribee';
import { CompleteProfileModal } from '@/components/dribee/CompleteProfileModal';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useLocationBootstrap } from '@/hooks/useLocationBootstrap';
import { useProMe } from '@/services/pro/pro.query';
import { useZones } from '@/services/master/master.query';
import { useBookings, useJobs } from '@/services/jobs/jobs.query';
import { useEarnings } from '@/services/earnings/earnings.query';
import {
  formatINR,
  jobStatusColor,
  jobStatusLabel,
  useDribeeTheme,
} from '@/hooks/useDribeeTheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAvailable } from '@/store/slices/proSlice';
import type { BookingApi } from '@/types/service-api';

import type { AppTabParamList, HomeStackParamList } from '@/navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type HomeNav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export function HomeScreen() {
  const { colors } = useDribeeTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<HomeNav>();
  const pro = useAppSelector((s) => s.pro.pro);

  const proMe = useProMe();
  const proId = proMe.data?.id;
  const { data: allZones } = useZones();
  const { data: assignedBookings } = useBookings(
    proId ? { status: 'assigned', pro_id: proId } : { status: 'assigned' },
  );
  const { data: confirmedBookings } = useBookings(
    proId ? { status: 'confirmed', pro_id: proId } : { status: 'confirmed' },
  );
  const { data: completedJobs } = useJobs({ status: 'completed' });
  const { data: earnings } = useEarnings(
    proId ? { pro_id: proId } : undefined,
  );
  useLocationBootstrap();

  const zoneNames = proMe.data
    ? (allZones ?? []).filter((z) => proMe.data!.zone_ids.includes(z.id)).map((z) => z.name)
    : pro.zones;

  const profileIncomplete =
    proMe.data != null &&
    (!proMe.data.state ||
      !proMe.data.city_id ||
      proMe.data.service_type_ids.length === 0 ||
      proMe.data.zone_ids.length === 0 ||
      proMe.data.machine_types.length === 0);

  const upcomingBookings = [
    ...(assignedBookings ?? []),
    ...(confirmedBookings ?? []),
  ].sort((a, b) => (a.slot_date ?? a.created_at).localeCompare(b.slot_date ?? b.created_at));
  const todayStr = new Date().toISOString().slice(0, 10);

  const newCount = assignedBookings?.length ?? 0;
  const inProgressCount = proMe.data?.in_progress_count ?? 0;
  const completedTodayCount = (completedJobs ?? []).filter(
    (j) => j.completed_at && j.completed_at.slice(0, 10) === todayStr,
  ).length;
  const todayEarnings = (earnings ?? [])
    .filter((e) => e.created_at.slice(0, 10) === todayStr)
    .reduce((sum, e) => sum + e.net_earning, 0);

  return (
    <ScreenContainer>
      <CompleteProfileModal visible={profileIncomplete} />
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.bgHeader,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: colors.borderDivider,
        }}
      >
        <Text style={{ color: colors.brandNavy, fontSize: 18, fontWeight: '700' }}>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => navigation.navigate('AlertsTab')}
            style={{ padding: 6 }}
          >
            <Bell size={22} strokeWidth={1.5} color={colors.textPrimary} />
            <View
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.statusRejected,
              }}
            />
          </Pressable>
          <Avatar name={pro.name} uri={pro.avatar} size={36} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Availability */}
        <View
          style={{
            backgroundColor: colors.bgSection,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>You are</Text>
            <Text
              style={{
                color: pro.isAvailable ? colors.brandTeal : colors.statusRejected,
                fontSize: 13,
                fontWeight: '700',
              }}
            >
              {pro.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
          <Switch
            value={pro.isAvailable}
            onValueChange={(v) => dispatch(setAvailable(v))}
            trackColor={{ true: colors.brandTeal, false: colors.borderInput }}
            thumbColor="#FFF"
          />
        </View>

        {/* Zone pills */}
        {zoneNames.length > 0 && (
          <View style={{ paddingVertical: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 8,
                gap: 6,
              }}
            >
              <MapPin size={14} strokeWidth={1.5} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                Your Zones
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {zoneNames.map((zone) => (
                <View
                  key={zone}
                  style={{
                    backgroundColor: `${colors.brandNavy}12`,
                    paddingHorizontal: 14,
                    height: 34,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: `${colors.brandNavy}26`,
                  }}
                >
                  <Text style={{ color: colors.brandNavy, fontSize: 12, fontWeight: '500' }}>
                    {zone}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Today's overview */}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: '600',
            paddingHorizontal: 16,
            marginTop: 8,
          }}
        >
          Today's Overview
        </Text>
        <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard label="New Jobs" value={String(newCount)} accentColor={colors.brandAmber} />
            <StatCard
              label="In Progress"
              value={String(inProgressCount)}
              accentColor={colors.brandNavy}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard
              label="Completed Today"
              value={String(completedTodayCount)}
              accentColor={colors.brandTeal}
            />
            <StatCard
              label="Today's Earnings"
              value={formatINR(todayEarnings)}
              accentColor={colors.statusCompleted}
            />
          </View>
        </View>

        {/* Upcoming jobs */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginTop: 24,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
            Upcoming Services
          </Text>
          <Pressable onPress={() => navigation.navigate('JobsTab', { screen: 'JobList' })}>
            <Text style={{ color: colors.brandBlue, fontSize: 13, fontWeight: '500' }}>
              View All
            </Text>
          </Pressable>
        </View>

        {upcomingBookings.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, marginTop: 12, gap: 12 }}
          >
            {upcomingBookings.map((booking) => (
              <UpcomingServiceCard
                key={booking.id}
                booking={booking}
                colors={colors}
                onPress={() =>
                  navigation.navigate('JobsTab', {
                    screen: 'JobDetail',
                    params: { jobId: booking.id },
                  })
                }
              />
            ))}
          </ScrollView>
        ) : (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              paddingVertical: 24,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
              No upcoming services right now
            </Text>
          </View>
        )}

        {/* Quick actions */}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: '600',
            paddingHorizontal: 16,
            marginTop: 24,
          }}
        >
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 12 }}>
          <QuickAction
            label="My Earnings"
            icon={<Wallet size={20} strokeWidth={1.5} color={colors.brandAmber} />}
            color={colors.brandAmber}
            onPress={() => navigation.navigate('EarningsTab', { screen: 'Earnings' })}
          />
          <QuickAction
            label="Job History"
            icon={<Clock size={20} strokeWidth={1.5} color={colors.brandNavy} />}
            color={colors.brandNavy}
            onPress={() =>
              navigation.navigate('ProfileTab', { screen: 'JobHistory' })
            }
          />
          <QuickAction
            label="All Jobs"
            icon={<Briefcase size={20} strokeWidth={1.5} color={colors.brandTeal} />}
            color={colors.brandTeal}
            onPress={() => navigation.navigate('JobsTab', { screen: 'JobList' })}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

function QuickAction({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}) {
  const { colors } = useDribeeTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 14,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        gap: 8,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: `${color}1A`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}

function parseTimestamp(raw: string): Date {
  const normalized = raw.replace(' ', 'T');
  return new Date(normalized);
}

function formatSlotDateTime(slotDate: string | null, slotTime: string | null): { dateStr: string; timeStr: string } {
  const raw = slotDate ?? slotTime;
  if (!raw) return { dateStr: '—', timeStr: '—' };

  const d = parseTimestamp(raw);
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const hour = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const timeStr = `${hour % 12 || 12}:${min} ${ampm}`;
  return { dateStr, timeStr };
}

function bookingStatusLabel(status: BookingApi['status']): string {
  switch (status) {
    case 'assigned':
      return 'New';
    case 'confirmed':
      return 'Accepted';
    default:
      return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function UpcomingServiceCard({
  booking,
  colors,
  onPress,
}: {
  booking: BookingApi;
  colors: ReturnType<typeof useDribeeTheme>['colors'];
  onPress: () => void;
}) {
  const { dateStr, timeStr } = formatSlotDateTime(
    booking.slot_date,
    booking.slot_start_time,
  );
  const isNew = booking.status === 'assigned';
  const statusColor = isNew ? colors.brandAmber : colors.brandTeal;

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        width: 320,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexShrink: 1, gap: 6 }}>
          <View
            style={{
              backgroundColor: colors.brandNavy,
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 20,
              alignSelf: 'flex-start',
            }}
          >
            <Text numberOfLines={1} style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>
              {booking.service_type_name ?? 'Service'}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}
          >
            {booking.service_name ?? booking.service_type_name ?? 'Service'}
          </Text>
          {booking.machine_type ? (
            <Text
              numberOfLines={1}
              style={{ color: colors.textSecondary, fontSize: 12 }}
            >
              {booking.machine_type}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Calendar size={11} strokeWidth={1.5} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '500' }}>
            {dateStr} - {timeStr || 'Time TBD'}
          </Text>
        </View>
      </View>

      {booking.customer_address ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
          <MapPin size={13} strokeWidth={1.5} color={colors.textTertiary} />
          <Text
            numberOfLines={2}
            style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}
          >
            {booking.customer_address}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          marginTop: 10,
          backgroundColor: `${statusColor}1A`,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>
          {bookingStatusLabel(booking.status)}
        </Text>
      </View>

      <Pressable onPress={onPress} style={{ marginTop: 12, alignSelf: 'center' }}>
        <Text style={{ color: colors.brandNavy, fontSize: 13, fontWeight: '600' }}>
          View Job Details
        </Text>
      </Pressable>
    </Pressable>
  );
}
