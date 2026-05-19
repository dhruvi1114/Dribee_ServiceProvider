import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Header, PrimaryButton } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { REJECT_REASONS } from '@/constants/mockData';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useBooking, useAcceptBooking, useRejectBooking } from '@/services/jobs/jobs.query';
import { useActiveOffer } from '@/services/bookings/offers.query';
import { bookingToJob } from '@/services/jobs/mappers';

import type { JobsStackScreenProps } from '@/navigation/types';

const ACCEPT_WINDOW_SECONDS = 600; // 10 min

export function JobAcceptScreen({ navigation, route }: JobsStackScreenProps<'JobAccept'>) {
  const { colors } = useDribeeTheme();
  const { data: booking, isLoading } = useBooking(route.params.jobId);
  const { data: activeOffer } = useActiveOffer();
  const acceptMutation = useAcceptBooking();
  const rejectMutation = useRejectBooking();
  const hasActiveOfferForThisBooking =
    !!activeOffer && String(activeOffer.booking_id) === String(route.params.jobId);
  const [secondsLeft, setSecondsLeft] = useState(ACCEPT_WINDOW_SECONDS);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (booking?.status === 'assigned') {
      navigation.replace('JobDetail', { jobId: route.params.jobId });
    }
  }, [booking?.status]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  if (isLoading || !booking) {
    return (
      <ScreenContainer>
        <Header title={isLoading ? 'Loading…' : 'Job not found'} />
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.brandNavy} />
          </View>
        ) : null}
      </ScreenContainer>
    );
  }

  const job = bookingToJob(booking);
  const minutesLeft = Math.max(0, Math.ceil(secondsLeft / 60));
  const progress = Math.max(0, secondsLeft / ACCEPT_WINDOW_SECONDS);

  const handleAccept = () => {
    acceptMutation.mutate(job.id, {
      onSuccess: () => {
        navigation.replace('JobDetail', { jobId: job.id });
      },
    });
  };

  const handleReject = () => {
    if (!reason) return;
    rejectMutation.mutate(
      { bookingId: job.id, data: { reason } },
      { onSuccess: () => navigation.popToTop() },
    );
  };

  return (
    <ScreenContainer>
      <Header title="New Job Request" />

      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 18,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
            gap: 6,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
            {job.serviceType}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{job.machineType}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Clock size={14} strokeWidth={1.5} color={colors.textSecondary} />
            <Text style={{ color: colors.textPrimary, fontSize: 13 }}>{job.slot}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} strokeWidth={1.5} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{job.zone}</Text>
          </View>
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 12,
              fontStyle: 'italic',
              marginTop: 8,
            }}
          >
            Customer address will be revealed after you accept.
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.bgSection,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: 6,
                backgroundColor: colors.brandAmber,
              }}
            />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 6 }}>
            {minutesLeft} {minutesLeft === 1 ? 'minute' : 'minutes'} to respond
          </Text>
        </View>

        {!rejecting ? (
          <View style={{ marginTop: 24, gap: 10 }}>
            {!hasActiveOfferForThisBooking ? (
              <Text
                style={{
                  color: colors.statusRejected,
                  fontSize: 13,
                  textAlign: 'center',
                  marginBottom: 4,
                }}
              >
                This offer is no longer available. It may have expired or been assigned to another
                pro.
              </Text>
            ) : null}
            <PrimaryButton
              label="Accept Job"
              onPress={handleAccept}
              disabled={acceptMutation.isPending}
            />
            <PrimaryButton
              label="Reject with Reason"
              onPress={() => setRejecting(true)}
              variant="outlined"
              color={colors.statusRejected}
              height={50}
              disabled={acceptMutation.isPending}
            />
          </View>
        ) : (
          <View style={{ marginTop: 24, gap: 10 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Reason
            </Text>
            {REJECT_REASONS.map((r) => {
              const selected = reason === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setReason(r)}
                  style={{
                    backgroundColor: selected
                      ? `${colors.statusRejected}26`
                      : colors.bgSection,
                    borderColor: selected ? colors.statusRejected : 'transparent',
                    borderWidth: 1.5,
                    borderRadius: 10,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: selected ? colors.statusRejected : colors.borderInput,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selected ? (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.statusRejected,
                        }}
                      />
                    ) : null}
                  </View>
                  <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{r}</Text>
                </Pressable>
              );
            })}
            <PrimaryButton
              label="Confirm Rejection"
              onPress={handleReject}
              color={colors.statusRejected}
              disabled={!reason || rejectMutation.isPending}
            />
            <PrimaryButton
              label="Cancel"
              onPress={() => {
                setRejecting(false);
                setReason(null);
              }}
              variant="outlined"
              color={colors.textSecondary}
              height={44}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
