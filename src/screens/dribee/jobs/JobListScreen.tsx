import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { EmptyState, JobCard } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useBookings } from '@/services/jobs/jobs.query';
import { bookingToJob } from '@/services/jobs/mappers';
import { useProMe } from '@/services/pro/pro.query';

import type { JobsStackParamList } from '@/navigation/types';
import type { JobStatus } from '@/types/dribee';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Filter = 'all' | JobStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'readyResume', label: 'Ready to Resume' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

export function JobListScreen() {
  const { colors } = useDribeeTheme();
  const navigation = useNavigation<NativeStackNavigationProp<JobsStackParamList>>();
  const [filter, setFilter] = useState<Filter>('all');
  const { data: proMe } = useProMe();
  const { data: bookings, isLoading, isFetching, refetch } = useBookings(
    proMe?.id ? { pro_id: proMe.id } : undefined,
  );

  const allJobs = useMemo(
    () => (bookings ?? []).map(bookingToJob),
    [bookings],
  );

  const jobs = useMemo(
    () => (filter === 'all' ? allJobs : allJobs.filter((j) => j.status === filter)),
    [filter, allJobs],
  );

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
          My Jobs
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                paddingHorizontal: 14,
                height: 34,
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
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text
        style={{
          color: colors.textTertiary,
          fontSize: 12,
          paddingHorizontal: 16,
          paddingVertical: 4,
        }}
      >
        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
      </Text>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brandNavy} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              colors={[colors.brandNavy]}
              tintColor={colors.brandNavy}
            />
          }
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
              onAccept={() => navigation.navigate('JobAccept', { jobId: item.id })}
              onReject={() => navigation.navigate('JobAccept', { jobId: item.id })}
              onContinue={() =>
                item.status === 'readyResume'
                  ? navigation.navigate('ContinuationVisit', { jobId: item.id })
                  : navigation.navigate('JobDetail', { jobId: item.id })
              }
              onDirections={() => navigation.navigate('JobMap', { jobId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No jobs here"
              subtitle="When new jobs are assigned to you, they'll appear in this list."
            />
          }
        />
      )}
    </ScreenContainer>
  );
}
