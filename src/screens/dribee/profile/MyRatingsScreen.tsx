import { Star } from 'lucide-react-native';
import { FlatList, Text, View } from 'react-native';

import { EmptyState, Header } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { mockRatings } from '@/constants/mockData';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useAppSelector } from '@/store/hooks';

export function MyRatingsScreen() {
  const { colors } = useDribeeTheme();
  const pro = useAppSelector((s) => s.pro.pro);

  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: mockRatings.filter((r) => r.stars === stars).length,
  }));
  const total = mockRatings.length;
  const max = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <ScreenContainer>
      <Header title="My Ratings" />

      <FlatList
        data={mockRatings}
        keyExtractor={(item) => item.jobId}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <View
              style={{
                backgroundColor: colors.brandNavy,
                borderRadius: 16,
                margin: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 48, fontWeight: '700' }}>
                {pro.rating.toFixed(1)}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    strokeWidth={1.5}
                    color={i < Math.round(pro.rating) ? colors.brandAmber : 'rgba(255,255,255,0.25)'}
                    fill={i < Math.round(pro.rating) ? colors.brandAmber : 'transparent'}
                  />
                ))}
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>
                Based on {total} ratings
              </Text>

              <View style={{ width: '100%', marginTop: 16, gap: 6 }}>
                {breakdown.map((b) => (
                  <View
                    key={b.stars}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 12, width: 24 }}>{b.stars}★</Text>
                    <View
                      style={{
                        flex: 1,
                        height: 6,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${(b.count / max) * 100}%`,
                          height: 6,
                          backgroundColor: colors.brandAmber,
                        }}
                      />
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, width: 24 }}>
                      {b.count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1,
                textTransform: 'uppercase',
                paddingHorizontal: 16,
              }}
            >
              Recent Reviews
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              marginHorizontal: 16,
              marginVertical: 6,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    strokeWidth={1.5}
                    color={i < item.stars ? colors.brandAmber : colors.borderCard}
                    fill={i < item.stars ? colors.brandAmber : 'transparent'}
                  />
                ))}
              </View>
              <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{item.date}</Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>
              {item.serviceType} · {item.machineType}
            </Text>
            <Text
              style={{ color: colors.textPrimary, fontSize: 13, fontStyle: 'italic', marginTop: 8 }}
              numberOfLines={3}
            >
              "{item.comment}"
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 8 }}>
              {item.jobId}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No ratings yet"
            subtitle="Complete your first job to receive ratings."
            icon={<Star size={32} strokeWidth={1.5} color={colors.textTertiary} />}
          />
        }
      />
    </ScreenContainer>
  );
}
