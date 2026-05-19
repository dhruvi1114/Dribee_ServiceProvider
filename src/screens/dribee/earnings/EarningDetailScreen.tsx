import { Star } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Header, PrimaryButton, StatusChip } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { mockRatings } from '@/constants/mockData';
import {
  earningStatusColor,
  earningStatusLabel,
  formatINR,
  useDribeeTheme,
} from '@/hooks/useDribeeTheme';
import { useEarnings } from '@/services/earnings/earnings.query';
import { earningApiToEarning } from '@/services/jobs/mappers';
import { useProMe } from '@/services/pro/pro.query';

import type { EarningsStackScreenProps } from '@/navigation/types';

export function EarningDetailScreen({
  navigation,
  route,
}: EarningsStackScreenProps<'EarningDetail'>) {
  const { colors } = useDribeeTheme();
  const { data: proMe } = useProMe();
  const { data: apiEarnings } = useEarnings(
    proMe?.id ? { pro_id: proMe.id } : undefined,
  );
  const earning = (apiEarnings ?? [])
    .map(earningApiToEarning)
    .find((e) => e.id === route.params.earningId);

  if (!earning) {
    return (
      <ScreenContainer>
        <Header title="Earning not found" />
      </ScreenContainer>
    );
  }

  const statusColor = earningStatusColor(earning.status, colors);
  const rating = mockRatings.find((r) => r.jobId === earning.jobId);

  return (
    <ScreenContainer>
      <Header title={earning.jobId} />

      {/* <View style={{ backgroundColor: statusColor, paddingVertical: 14, paddingHorizontal: 16 }}>
        <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
          Payout {earningStatusLabel(earning.status)}
        </Text>
      </View> */}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
        <Card>
          <Row label="Service Type" value={earning.serviceType} />
          <Row label="Service Name" value={earning.serviceName} />
          <Row label="Machine Type" value={earning.machineType} />
          {earning.description ? (
            <Row label="Description" value={earning.description} />
          ) : null}
          <Row
            last
            label="Completed"
            value={earning.completedAt ? formatDateTime(earning.completedAt) : '—'}
          />
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Payout Status
            </Text>
            <StatusChip
              label={earningStatusLabel(earning.status)}
              color={statusColor}
              size="sm"
            />
          </View>

          {earning.status === 'paid' && earning.paidOn ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>
              Paid on {earning.paidOn} · ••••1234
            </Text>
          ) : earning.status === 'pending' ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>
              Awaiting for payment
            </Text>
          ) : earning.status === 'failed' ? (
            <View style={{ marginTop: 12, gap: 10 }}>
              <Text style={{ color: colors.statusRejected, fontSize: 13 }}>
                {earning.failReason}
              </Text>
              <PrimaryButton
                label="Update Bank Details"
                onPress={() => navigation.navigate('PayoutFailed', { earningId: earning.id })}
                height={44}
              />
            </View>
          ) : (
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>
              Done payout
            </Text>
          )}
        </Card>

        <Card>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Earnings Breakdown
          </Text>
          <Row label="Service Fee" value={formatINR(earning.grossEarning)} />
          {earning.continuationFee ? (
            <Row label="Continuation Fee" value={formatINR(earning.continuationFee)} />
          ) : null}
          <Row label="Gross Earning" value={formatINR(earning.grossEarning)} bold />
          <Divider />
          <Row
            label={`Commission (${earning.commissionPct}%)`}
            value={`-${formatINR(earning.commissionAmount)}`}
            valueColor={colors.statusRejected}
          />
          <View
            style={{
              height: 1,
              backgroundColor: colors.borderCard,
              marginVertical: 8,
            }}
          />
          <Row
            last
            label="NET EARNING"
            value={formatINR(earning.netEarning)}
            bold
            valueColor={colors.brandTeal}
            big
          />
        </Card>

        {rating ? (
          <Card>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Customer Rating
            </Text>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  strokeWidth={1.5}
                  color={i < rating.stars ? colors.brandAmber : colors.borderCard}
                  fill={i < rating.stars ? colors.brandAmber : 'transparent'}
                />
              ))}
            </View>
            <Text
              style={{ color: colors.textSecondary, fontSize: 13, fontStyle: 'italic' }}
            >
              "{rating.comment}"
            </Text>
          </Card>
        ) : null}
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

function Row({
  label,
  value,
  bold,
  big,
  last,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  big?: boolean;
  last?: boolean;
  valueColor?: string;
}) {
  const { colors } = useDribeeTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.borderDivider,
        gap: 12,
      }}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: bold ? 14 : 13,
          fontWeight: bold ? '600' : '400',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: valueColor ?? colors.textPrimary,
          fontSize: big ? 18 : 14,
          fontWeight: bold ? '700' : '500',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const { colors } = useDribeeTheme();
  return <View style={{ height: 1, backgroundColor: colors.borderDivider, marginVertical: 4 }} />;
}

function formatDateTime(raw: string): string {
  const d = new Date(raw.replace(' ', 'T'));
  if (isNaN(d.getTime())) return raw;
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const hour = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${dateStr}, ${hour % 12 || 12}:${min} ${ampm}`;
}
