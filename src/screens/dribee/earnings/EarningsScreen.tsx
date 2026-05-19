import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { EarningCard, EmptyState } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { formatINR, useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useEarnings } from '@/services/earnings/earnings.query';
import { earningApiToEarning } from '@/services/jobs/mappers';
import { useProMe } from '@/services/pro/pro.query';

import type { EarningsStackParamList } from '@/navigation/types';
import type { EarningStatus } from '@/types/dribee';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Filter = 'all' | EarningStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Failed' },
];

export function EarningsScreen() {
  const { colors } = useDribeeTheme();
  const navigation = useNavigation<NativeStackNavigationProp<EarningsStackParamList>>();
  const [filter, setFilter] = useState<Filter>('all');
  const { data: proMe } = useProMe();
  const { data: apiEarnings, isLoading } = useEarnings(
    proMe?.id ? { pro_id: proMe.id } : undefined,
  );

  const allEarnings = useMemo(
    () => (apiEarnings ?? []).map(earningApiToEarning),
    [apiEarnings],
  );

  const earnings = useMemo(
    () => (filter === 'all' ? allEarnings : allEarnings.filter((e) => e.status === filter)),
    [filter, allEarnings],
  );

  const totalEarned = allEarnings.reduce((sum, e) => sum + e.netEarning, 0);
  const monthEarned = totalEarned;
  const pendingTotal = allEarnings
    .filter((e) => e.status === 'pending' || e.status === 'approved')
    .reduce((sum, e) => sum + e.netEarning, 0);
  const paidTotal = allEarnings
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.netEarning, 0);

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
          My Earnings
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brandNavy} />
        </View>
      ) : (
      <FlatList
        data={earnings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <View
              style={{
                backgroundColor: colors.brandNavy,
                borderRadius: 16,
                margin: 16,
                padding: 18,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Total Earned</Text>
              <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '700', marginTop: 4 }}>
                {formatINR(totalEarned)}
              </Text>

              <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
                <SummaryStat label="This Month" value={formatINR(monthEarned)} />
                <Divider />
                <SummaryStat label="Pending" value={formatINR(pendingTotal)} />
                <Divider />
                <SummaryStat label="Paid Out" value={formatINR(paidTotal)} />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}
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
          </>
        }
        renderItem={({ item }) => (
          <EarningCard
            earning={item}
            onPress={() => {
              if (item.status === 'failed') {
                navigation.navigate('PayoutFailed', { earningId: item.id });
              } else {
                navigation.navigate('EarningDetail', { earningId: item.id });
              }
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No earnings yet"
            subtitle="Completed jobs will show up here."
          />
        }
      />
      )}
    </ScreenContainer>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{label}</Text>
      <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600', marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />;
}
