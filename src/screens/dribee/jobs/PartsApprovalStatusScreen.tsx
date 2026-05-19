import { Lock } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Header, PrimaryButton, StatusChip } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import {
  partAvailabilityColor,
  partAvailabilityLabel,
  useDribeeTheme,
} from '@/hooks/useDribeeTheme';
import { useBooking } from '@/services/jobs/jobs.query';
import { bookingToJob } from '@/services/jobs/mappers';

import type { JobsStackScreenProps } from '@/navigation/types';

export function PartsApprovalStatusScreen({
  navigation,
  route,
}: JobsStackScreenProps<'PartsApprovalStatus'>) {
  const { colors } = useDribeeTheme();
  const { data: booking, refetch } = useBooking(route.params.jobId);

  if (!booking) {
    return (
      <ScreenContainer>
        <Header title="Loading…" />
      </ScreenContainer>
    );
  }

  const job = bookingToJob(booking);
  const parts = booking.parts ?? [];
  const isLocked = parts.length > 0 && parts.every((p) => p.customer_approved);
  const banner = isLocked
    ? { bg: colors.brandTeal, label: 'Parts list approved and locked' }
    : { bg: colors.brandAmber, label: 'Waiting for customer to review' };

  return (
    <ScreenContainer>
      <Header title="Parts List Status" />

      <View style={{ backgroundColor: banner.bg, paddingVertical: 14, paddingHorizontal: 16 }}>
        <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>{banner.label}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
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
          <Text style={{ color: colors.textTertiary, fontSize: 11, textTransform: 'uppercase' }}>
            Job Reference
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 14, marginTop: 6 }}>
            {job.id} · {job.serviceType} · {job.zone}
          </Text>
        </View>

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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Parts List · {job.parts.length}
            </Text>
            {isLocked ? <Lock size={16} strokeWidth={1.5} color={colors.textTertiary} /> : null}
          </View>

          {job.parts.map((p, idx) => {
            const lineTotal = p.unitPrice != null ? p.unitPrice * p.qty : null;
            const gstAmt = lineTotal != null && p.gstRate != null ? +(lineTotal * p.gstRate / 100).toFixed(2) : null;
            return (
              <View
                key={p.partId}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: idx === job.parts.length - 1 ? 0 : 1,
                  borderBottomColor: colors.borderDivider,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
                      {p.name}
                    </Text>
                    <Text style={{ color: colors.textTertiary, fontSize: 12 }}>{p.variant}</Text>
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>× {p.qty}</Text>
                  <StatusChip
                    label={partAvailabilityLabel(p.status)}
                    color={partAvailabilityColor(p.status, colors)}
                    size="sm"
                  />
                </View>
                {lineTotal != null ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                      ₹{p.unitPrice!.toLocaleString('en-IN')} × {p.qty}
                    </Text>
                    {gstAmt != null && p.gstRate! > 0 ? (
                      <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                        + GST ({p.gstRate}%) ₹{gstAmt.toLocaleString('en-IN')}
                      </Text>
                    ) : null}
                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                      ₹{(lineTotal + (gstAmt ?? 0)).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {/* Grand Total */}
          {job.parts.some((p) => p.unitPrice != null) ? (() => {
            const subtotal = job.parts.reduce((s, p) => s + (p.unitPrice != null ? p.unitPrice * p.qty : 0), 0);
            const totalGst = job.parts.reduce((s, p) => {
              if (p.unitPrice == null || p.gstRate == null) return s;
              return s + +((p.unitPrice * p.qty) * p.gstRate / 100).toFixed(2);
            }, 0);
            return (
              <View style={{ borderTopWidth: 1, borderTopColor: colors.borderDivider, marginTop: 8, paddingTop: 10, gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Subtotal</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>₹{subtotal.toLocaleString('en-IN')}</Text>
                </View>
                {totalGst > 0 ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>GST</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>₹{totalGst.toLocaleString('en-IN')}</Text>
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700' }}>Total</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700' }}>
                    ₹{(subtotal + totalGst).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            );
          })() : null}
        </View>

        {!isLocked ? (
          <PrimaryButton
            label="Refresh Status"
            onPress={() => { void refetch(); }}
            color={colors.brandTeal}
            height={44}
          />
        ) : (
          <PrimaryButton
            label="Continue"
            onPress={() => navigation.replace('JobDetail', { jobId: job.id })}
            height={44}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
