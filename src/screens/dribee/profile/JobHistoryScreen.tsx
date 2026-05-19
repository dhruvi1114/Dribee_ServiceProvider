import { useNavigation } from '@react-navigation/native';
import { Calendar, CheckCircle, Star } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { EmptyState, Header } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { formatINR, useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useBookings } from '@/services/jobs/jobs.query';
import { useEarnings } from '@/services/earnings/earnings.query';
import { useProMe } from '@/services/pro/pro.query';
import { bookingToJob, earningApiToEarning } from '@/services/jobs/mappers';

import type { AppTabParamList, JobsStackParamList } from '@/navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Range = 'week' | 'month' | 'q' | 'all';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<JobsStackParamList>,
  BottomTabNavigationProp<AppTabParamList>
>;

const RANGES: { key: Range; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'q', label: 'Last 3 Months' },
  { key: 'all', label: 'All Time' },
];

function getRangeStart(range: Range): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  if (range === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (range === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const d = new Date(now);
  d.setMonth(d.getMonth() - 3);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDate(raw: string): Date {
  return new Date(raw.replace(' ', 'T'));
}

function formatCardDateTime(raw: string): string {
  const d = new Date(raw.replace(' ', 'T'));
  if (isNaN(d.getTime())) return raw;
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const hour = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${dateStr}, ${hour % 12 || 12}:${min} ${ampm}`;
}

export function JobHistoryScreen() {
  const { colors } = useDribeeTheme();
  const navigation = useNavigation<Nav>();
  const [range, setRange] = useState<Range>('month');

  const { data: proMe } = useProMe();
  const { data: bookings, isLoading: bookingsLoading } = useBookings(
    proMe?.id ? { status: 'completed', pro_id: proMe.id } : { status: 'completed' },
  );
  const { data: apiEarnings } = useEarnings(
    proMe?.id ? { pro_id: proMe.id } : undefined,
  );

  const allCompleted = useMemo(
    () => (bookings ?? []).map(bookingToJob),
    [bookings],
  );

  const allEarnings = useMemo(
    () => (apiEarnings ?? []).map(earningApiToEarning),
    [apiEarnings],
  );

  const rangeStart = useMemo(() => getRangeStart(range), [range]);

  const filtered = useMemo(
    () =>
      rangeStart
        ? allCompleted.filter((j) => parseDate(j.date) >= rangeStart)
        : allCompleted,
    [allCompleted, rangeStart],
  );

  const filteredEarnings = useMemo(
    () =>
      rangeStart
        ? allEarnings.filter((e) => parseDate(e.date) >= rangeStart)
        : allEarnings,
    [allEarnings, rangeStart],
  );

  const completedCount = filtered.length;
  const totalEarned = filteredEarnings.reduce((sum, e) => sum + e.netEarning, 0);
  const avgRating = proMe?.avg_rating ?? 0;

  const renderItem = useCallback(
    ({ item }: { item: (typeof filtered)[number] }) => {
      const jobEarning = allEarnings.find((e) => e.jobId === item.serviceJobId);
      const starCount = item.rating ?? 0;
      const completedLabel = item.completedAt
        ? formatCardDateTime(item.completedAt)
        : item.date;

      return (
        <Pressable
          onPress={() =>
            navigation.navigate('JobsTab', {
              screen: 'JobDetail',
              params: { jobId: item.id },
            })
          }
          style={{
            backgroundColor: colors.bgCard,
            marginHorizontal: 16,
            marginVertical: 6,
            padding: 16,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          {/* Top: service info + completed date */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexShrink: 1, gap: 2 }}>
              <Text
                numberOfLines={1}
                style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}
              >
                {item.serviceType}
              </Text>
              <Text
                numberOfLines={1}
                style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}
              >
                {item.serviceName}
              </Text>
              {item.machineType ? (
                <Text
                  numberOfLines={1}
                  style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}
                >
                  {item.machineType}
                </Text>
              ) : null}
            </View>

            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={11} strokeWidth={1.5} color={colors.brandTeal} />
                <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '500' }}>
                  {completedLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Rating + Earning */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={`star-${i}`}
                    size={14}
                    strokeWidth={1.5}
                    color={i < starCount ? colors.brandAmber : colors.borderCard}
                    fill={i < starCount ? colors.brandAmber : 'transparent'}
                  />
                ))}
              </View>
              {starCount > 0 ? (
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {starCount.toFixed(1)}
                </Text>
              ) : (
                <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                  No rating
                </Text>
              )}
            </View>
            <Text style={{ color: colors.brandTeal, fontSize: 15, fontWeight: '700' }}>
              {jobEarning ? formatINR(jobEarning.netEarning) : '—'}
            </Text>
          </View>
        </Pressable>
      );
    },
    [allEarnings, colors, navigation],
  );

  return (
    <ScreenContainer>
      <Header title="Job History" />

      <View style={{ flexDirection: 'row', padding: 16, gap: 8, flexWrap: 'wrap' }}>
        {RANGES.map((r) => {
          const active = range === r.key;
          return (
            <Pressable
              key={r.key}
              onPress={() => setRange(r.key)}
              style={{
                paddingHorizontal: 14,
                height: 32,
                borderRadius: 20,
                backgroundColor: active ? colors.brandNavy : colors.bgSection,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: active ? '#FFF' : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={{
          backgroundColor: colors.bgCard,
          borderRadius: 10,
          marginHorizontal: 16,
          padding: 14,
          flexDirection: 'row',
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      >
        <SummaryCol value={String(completedCount)} label="Completed" />
        <SummaryCol value={formatINR(totalEarned)} label="Earned" />
        <SummaryCol value={avgRating.toFixed(1)} label="Avg Rating" last />
      </View>

      {bookingsLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brandNavy} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              title="No completed jobs"
              subtitle="Completed jobs will appear here."
            />
          }
        />
      )}
    </ScreenContainer>
  );
}

function SummaryCol({
  value,
  label,
  last,
}: {
  value: string;
  label: string;
  last?: boolean;
}) {
  const { colors } = useDribeeTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        borderRightWidth: last ? 0 : 1,
        borderRightColor: colors.borderDivider,
      }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
        {value}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
