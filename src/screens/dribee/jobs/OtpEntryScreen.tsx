import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Header, PrimaryButton } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useBooking, useVerifyBookingOtp } from '@/services/jobs/jobs.query';
import { bookingToJob } from '@/services/jobs/mappers';

import type { JobsStackScreenProps } from '@/navigation/types';

export function OtpEntryScreen({ navigation, route }: JobsStackScreenProps<'OtpEntry'>) {
  const { colors } = useDribeeTheme();
  const { data: booking } = useBooking(route.params.jobId);
  const verifyOtpMutation = useVerifyBookingOtp();
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const shake = useSharedValue(0);

  if (!booking) {
    return (
      <ScreenContainer>
        <Header title="Loading…" />
      </ScreenContainer>
    );
  }

  const job = bookingToJob(booking);

  const setDigit = (i: number, v: string) => {
    const c = v.replace(/[^0-9]/g, '').slice(0, 1);
    setError(false);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });
    if (c && i < 3) inputs.current[i + 1]?.focus();
  };

  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  };

  const onVerify = () => {
    const code = digits.join('');
    verifyOtpMutation.mutate(
      { bookingId: job.id, data: { otp: code } },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => navigation.replace('Diagnosis', { jobId: job.id }), 800);
        },
        onError: () => {
          setError(true);
          triggerShake();
        },
      },
    );
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const isComplete = digits.every((d) => d !== '');

  return (
    <ScreenContainer>
      <Header title="Verify Customer OTP" />

      <View style={{ padding: 20 }}>
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
            gap: 6,
          }}
        >
          <Row label="Job ID" value={job.id} />
          <Row label="Customer" value={job.customerName} />
          <Row label="Address" value={job.address ?? '—'} />
        </View>

        <View
          style={{
            backgroundColor: colors.bgSection,
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
          }}
        >
          <Text
            style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center' }}
          >
            Ask the customer to open their app and share the 4-digit OTP. Enter it below to start
            the job.
          </Text>
        </View>

        <Animated.View
          style={[
            { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 24 },
            shakeStyle,
          ]}
        >
          {digits.map((d, i) => {
            const filled = d !== '';
            const borderColor = error
              ? colors.statusRejected
              : filled
                ? success
                  ? colors.brandTeal
                  : colors.brandNavy
                : colors.borderInput;
            const bg = success
              ? colors.brandTeal
              : filled
                ? colors.brandNavy
                : colors.bgInput;
            return (
              <TextInput
                key={i}
                ref={(r) => {
                  inputs.current[i] = r;
                }}
                value={d}
                onChangeText={(t) => setDigit(i, t)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !d && i > 0) {
                    inputs.current[i - 1]?.focus();
                  }
                }}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  flex: 1,
                  height: 64,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor,
                  backgroundColor: bg,
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: '700',
                  color: filled || success ? colors.textInverse : colors.textPrimary,
                }}
              />
            );
          })}
        </Animated.View>

        {error ? (
          <Text style={{ color: colors.statusRejected, fontSize: 13, marginTop: 12 }}>
            Incorrect OTP. Ask the customer to regenerate.
          </Text>
        ) : null}

        <View style={{ marginTop: 28 }}>
          <PrimaryButton
            label="Verify OTP"
            onPress={onVerify}
            disabled={!isComplete || success || verifyOtpMutation.isPending}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useDribeeTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{label}</Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 13,
          fontWeight: '500',
          textAlign: 'right',
          flexShrink: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
