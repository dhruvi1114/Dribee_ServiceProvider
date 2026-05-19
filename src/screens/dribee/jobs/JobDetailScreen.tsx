import { useNavigation } from '@react-navigation/native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Calendar, CheckCircle, ClipboardList, Eye, MapPin, Phone, Share2, ShieldCheck, User } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Header, InfoCard, PrimaryButton } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import {
  jobStatusColor,
  jobStatusLabel,
  formatINR,
  useDribeeTheme,
} from '@/hooks/useDribeeTheme';
import { useBooking, useConfirmCodPayment, useVerifyBookingOtp } from '@/services/jobs/jobs.query';
import { bookingToJob } from '@/services/jobs/mappers';

import type { JobsStackParamList, JobsStackScreenProps } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<JobsStackParamList>;

function formatSlotDateTime(raw: string): string {
  const d = new Date(raw.replace(' ', 'T'));
  if (isNaN(d.getTime())) return raw;
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const hour = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${dateStr}, ${hour % 12 || 12}:${min} ${ampm}`;
}

export function JobDetailScreen({ route }: JobsStackScreenProps<'JobDetail'>) {
  const { colors } = useDribeeTheme();
  const navigation = useNavigation<Nav>();
  const { data: booking, isLoading } = useBooking(route.params.jobId);
  const confirmCod = useConfirmCodPayment();
  const verifyOtpMutation = useVerifyBookingOtp();

  const otpSheetRef = useRef<BottomSheetModal>(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const otpInputs = useRef<(TextInput | null)[]>([]);
  const shake = useSharedValue(0);

  const openOtpSheet = useCallback(() => {
    setOtpDigits(['', '', '', '']);
    setOtpError(false);
    setOtpSuccess(false);
    otpSheetRef.current?.present();
  }, []);

  const setDigit = useCallback((i: number, v: string) => {
    const c = v.replace(/[^0-9]/g, '').slice(0, 1);
    setOtpError(false);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });
    if (c && i < 3) otpInputs.current[i + 1]?.focus();
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

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
  const statusColor = jobStatusColor(job.status, colors);
  const isAccepted = job.status !== 'new' && job.status !== 'rejected';

  const onShare = () => {
    Share.share({ message: `Dribee Pro Job ${job.id} – ${job.serviceType} (${job.zone})` });
  };

  const onVerifyOtp = () => {
    const code = otpDigits.join('');
    verifyOtpMutation.mutate(
      { bookingId: job.id, data: { otp: code } },
      {
        onSuccess: () => {
          setOtpSuccess(true);
          setTimeout(() => {
            otpSheetRef.current?.dismiss();
            navigation.replace('Diagnosis', { jobId: job.id });
          }, 800);
        },
        onError: () => {
          setOtpError(true);
          shake.value = withSequence(
            withTiming(-8, { duration: 60 }),
            withTiming(8, { duration: 60 }),
            withTiming(-8, { duration: 60 }),
            withTiming(0, { duration: 60 }),
          );
        },
      },
    );
  };

  const renderActions = () => {
    switch (job.status) {
      case 'new':
        return (
          <Pressable onPress={() => navigation.navigate('JobAccept', { jobId: job.id })}>
            <View
              style={{
                height: 54,
                width: '100%',
                backgroundColor: colors.brandNavy,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <CheckCircle size={15} strokeWidth={2} color="#FFFFFF" />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                Accept Job
              </Text>
            </View>
          </Pressable>
        );
      case 'accepted':
        return (
          <Pressable onPress={openOtpSheet}>
            <View
              style={{
                height: 54,
                width: '100%',
                backgroundColor: '#2563EB',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <ShieldCheck size={15} strokeWidth={2} color="#FFFFFF" />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                Enter Customer OTP
              </Text>
            </View>
          </Pressable>
        );
      case 'inProgress':
        if (!job.diagnosis || job.diagnosis.length === 0) {
          return (
            <Pressable onPress={() => navigation.navigate('Diagnosis', { jobId: job.id })}>
              <View
                style={{
                  height: 54,
                  width: '100%',
                  backgroundColor: '#2563EB',
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  <ClipboardList size={15} strokeWidth={2} color="#FFFFFF" />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                  Diagnose & Add Parts
                </Text>
              </View>
            </Pressable>
          );
        }
        if (job.parts.length === 0) {
          return (
            <Pressable onPress={() => navigation.navigate('PartsListBuilder', { jobId: job.id })}>
              <View
                style={{
                  height: 54,
                  width: '100%',
                  backgroundColor: '#2563EB',
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 26, height: 26, borderRadius: 13,
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    alignItems: 'center', justifyContent: 'center', marginRight: 8,
                  }}
                >
                  <ClipboardList size={15} strokeWidth={2} color="#FFFFFF" />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                  Build Parts List
                </Text>
              </View>
            </Pressable>
          );
        }
        return (
          <View style={{ gap: 10 }}>
            <InfoCard tone="amber">Waiting for the customer to approve the parts list.</InfoCard>
            <Pressable onPress={() => navigation.navigate('PartsApprovalStatus', { jobId: job.id })}>
              <View
                style={{
                  height: 54,
                  width: '100%',
                  backgroundColor: 'transparent',
                  borderWidth: 1.5,
                  borderColor: colors.brandNavy,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 26, height: 26, borderRadius: 13,
                    backgroundColor: `${colors.brandNavy}20`,
                    alignItems: 'center', justifyContent: 'center', marginRight: 8,
                  }}
                >
                  <Eye size={15} strokeWidth={2} color={colors.brandNavy} />
                </View>
                <Text style={{ color: colors.brandNavy, fontSize: 15, fontWeight: '600' }}>
                  View Parts Approval Status
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('JobCompletion', { jobId: job.id })}>
              <View
                style={{
                  height: 54,
                  width: '100%',
                  backgroundColor: '#059669',
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 26, height: 26, borderRadius: 13,
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    alignItems: 'center', justifyContent: 'center', marginRight: 8,
                  }}
                >
                  <CheckCircle size={15} strokeWidth={2} color="#FFFFFF" />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                  Mark Job Complete
                </Text>
              </View>
            </Pressable>
          </View>
        );
      case 'readyResume':
        return (
          <Pressable onPress={() => navigation.navigate('ContinuationVisit', { jobId: job.id })}>
            <View
              style={{
                height: 54,
                width: '100%',
                backgroundColor: '#2563EB',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <CheckCircle size={15} strokeWidth={2} color="#FFFFFF" />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                Start Continuation Visit
              </Text>
            </View>
          </Pressable>
        );
      case 'completed':
        return (
          <View style={{ gap: 10 }}>
            <InfoCard tone="teal">
              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500' }}>
                Job completed
              </Text>
              {job.earning ? (
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                  Net earning: {formatINR(job.earning)}
                </Text>
              ) : null}
            </InfoCard>
            {booking.pending_cod_payment ? (
              <PrimaryButton
                label={`Confirm Cash Received — ₹${booking.pending_cod_payment.amount.toLocaleString('en-IN')}`}
                onPress={() => booking.pending_cod_payment && confirmCod.mutate(booking.pending_cod_payment.id)}
                disabled={confirmCod.isPending}
              />
            ) : null}
            {job.rating ? (
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                Customer rating: {job.rating}★
              </Text>
            ) : null}
          </View>
        );
      case 'rejected':
        return null;
    }
  };

  const otpIsComplete = otpDigits.every((d) => d !== '');

  return (
    <ScreenContainer>
      <Header
        title={job.id}
        rightElement={
          <Pressable onPress={onShare} style={{ padding: 8 }}>
            <Share2 size={20} strokeWidth={1.5} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Cancelled banner */}
        {job.status === 'rejected' && (job.cancellationReason || job.cancelledAt) ? (
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              marginTop: 16,
              marginHorizontal: 16,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#E11D48',
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: 1,
            }}
          >
            <Text style={{ color: colors.textTertiary, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>
              Booking cancelled
            </Text>
            {job.cancellationReason ? (
              <Text style={{ color: colors.textPrimary, fontSize: 14, marginBottom: 4 }}>
                {job.cancellationReason}
              </Text>
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>
                The customer or admin cancelled this booking.
              </Text>
            )}
            {job.cancelledAt ? (
              <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                Cancelled at {(() => {
                  try { return new Date(job.cancelledAt).toLocaleString('en-IN'); } catch { return job.cancelledAt; }
                })()}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Service Details Card */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            margin: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexShrink: 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}>
                {job.serviceType}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                {job.serviceName}
              </Text>
              {job.machineType ? (
                <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>
                  {job.machineType}
                </Text>
              ) : null}
            </View>
            <View
              style={{
                backgroundColor: `${statusColor}1A`,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>
                {jobStatusLabel(job.status)}
              </Text>
            </View>
          </View>

          {job.description ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 10, lineHeight: 18 }}>
              {job.description}
            </Text>
          ) : null}

          <View style={{ height: 1, backgroundColor: colors.borderDivider, marginVertical: 12 }} />

          <View style={{ gap: 8 }}>
            {job.price != null ? (
              <DetailRow label="Price" value={formatINR(job.price)} colors={colors} />
            ) : null}
            <DetailRow
              label="Slot"
              value={formatSlotDateTime(job.slot)}
              colors={colors}
              icon={<Calendar size={13} strokeWidth={1.5} color={colors.textTertiary} />}
            />
          </View>
        </View>

        {/* Customer Info Card — only visible after provider accepts */}
        {isAccepted ? (
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              marginHorizontal: 16,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: 1,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Customer Info
            </Text>

            <View style={{ gap: 10 }}>
              <DetailRow
                label="Customer"
                value={job.customerName}
                colors={colors}
                icon={<User size={13} strokeWidth={1.5} color={colors.textTertiary} />}
              />
              {(booking.customer_phone || booking.dealer_phone) ? (
                <DetailRow
                  label="Phone"
                  value={(booking.customer_phone || booking.dealer_phone) ?? ''}
                  colors={colors}
                  icon={<Phone size={13} strokeWidth={1.5} color={colors.textTertiary} />}
                />
              ) : null}
              <DetailRow
                label="Address"
                value={job.address ?? '—'}
                colors={colors}
                icon={<MapPin size={13} strokeWidth={1.5} color={colors.textTertiary} />}
              />
              <DetailRow label="Zone" value={job.zone} colors={colors} />
            </View>
          </View>
        ) : null}

        {/* Actions */}
        <View style={{ marginHorizontal: 16, marginTop: 16, gap: 10 }}>{renderActions()}</View>
      </ScrollView>

      {/* OTP Bottom Sheet */}
      <BottomSheetModal
        ref={otpSheetRef}
        enableDynamicSizing
        backgroundStyle={{ backgroundColor: colors.bgCard }}
        handleIndicatorStyle={{ backgroundColor: colors.borderDivider }}
      >
        <BottomSheetView style={{ padding: 24, paddingBottom: 40 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
            Enter Customer OTP
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 }}
          >
            Ask the customer to share the 4-digit OTP from their app.
          </Text>

          <Animated.View
            style={[
              { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 24 },
              shakeStyle,
            ]}
          >
            {otpDigits.map((d, i) => {
              const filled = d !== '';
              const borderColor = otpError
                ? colors.statusRejected
                : filled
                  ? otpSuccess ? colors.brandTeal : colors.brandNavy
                  : colors.borderInput;
              const bg = otpSuccess
                ? colors.brandTeal
                : filled ? colors.brandNavy : colors.bgInput;
              return (
                <TextInput
                  key={`otp-${i}`}
                  ref={(r) => { otpInputs.current[i] = r; }}
                  value={d}
                  onChangeText={(t) => setDigit(i, t)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !d && i > 0) {
                      otpInputs.current[i - 1]?.focus();
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={{
                    width: 56,
                    height: 64,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor,
                    backgroundColor: bg,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: '700',
                    color: filled || otpSuccess ? colors.textInverse : colors.textPrimary,
                  }}
                />
              );
            })}
          </Animated.View>

          {otpError ? (
            <Text style={{ color: colors.statusRejected, fontSize: 13, marginTop: 12, textAlign: 'center' }}>
              Incorrect OTP. Ask the customer to regenerate.
            </Text>
          ) : null}

          <View style={{ marginTop: 24 }}>
            <PrimaryButton
              label="Verify OTP"
              onPress={onVerifyOtp}
              disabled={!otpIsComplete || otpSuccess || verifyOtpMutation.isPending}
              loading={verifyOtpMutation.isPending}
              color={colors.brandBlue ?? colors.brandNavy}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </ScreenContainer>
  );
}

function DetailRow({
  label,
  value,
  colors,
  icon,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useDribeeTheme>['colors'];
  icon?: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {icon ?? null}
        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{label}</Text>
      </View>
      <Text
        style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500', textAlign: 'right', flexShrink: 1, flexWrap: 'wrap' }}
      >
        {value}
      </Text>
    </View>
  );
}
