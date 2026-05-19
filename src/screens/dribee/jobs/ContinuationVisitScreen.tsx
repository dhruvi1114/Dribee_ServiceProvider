import { Lock } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import {
  Chip,
  Header,
  InfoCard,
  PrimaryButton,
  SectionLabel,
} from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useBooking } from '@/services/jobs/jobs.query';
import { bookingToJob } from '@/services/jobs/mappers';

import type { JobsStackScreenProps } from '@/navigation/types';

export function ContinuationVisitScreen({
  navigation,
  route,
}: JobsStackScreenProps<'ContinuationVisit'>) {
  const { colors } = useDribeeTheme();
  const { data: booking } = useBooking(route.params.jobId);

  if (!booking) {
    return (
      <ScreenContainer>
        <Header title="Loading…" />
      </ScreenContainer>
    );
  }

  const job = bookingToJob(booking);

  return (
    <ScreenContainer>
      <Header title="Continuation Visit" />

      <View
        style={{
          backgroundColor: colors.brandTeal,
          paddingVertical: 14,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
          Parts have arrived. Time to complete the job!
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
        <Card>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
            {job.slot}
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 14, marginTop: 6 }}>
            {job.customerName}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
            {job.address ?? '—'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            Zone: {job.zone}
          </Text>
        </Card>

        <Card>
          <SectionLabel label="From Previous Visit" marginTop={0} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {(job.diagnosis ?? []).map((d) => (
              <Chip key={d} label={d} selected onPress={() => {}} />
            ))}
          </View>
          <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 12 }}>
            Original visit: {job.date}
          </Text>
        </Card>

        <Card>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <SectionLabel label="Locked Parts List" marginTop={0} />
            <Lock size={16} strokeWidth={1.5} color={colors.textTertiary} />
          </View>
          {job.parts.map((p, idx) => (
            <View
              key={p.partId}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: idx === job.parts.length - 1 ? 0 : 1,
                borderBottomColor: colors.borderDivider,
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
                  {p.name}
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{p.variant}</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>× {p.qty}</Text>
            </View>
          ))}
        </Card>

        <InfoCard tone="amber">
          A continuation visit fee applies because a second visit was required. This will be
          included in the final bill.
        </InfoCard>

        <PrimaryButton
          label="Start Continuation Visit"
          onPress={() => navigation.replace('JobCompletion', { jobId: job.id })}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { colors } = useDribeeTheme();
  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    >
      {children}
    </View>
  );
}
