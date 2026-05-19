import { AlertTriangle, Calendar, CheckCircle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import {
  earningStatusColor,
  earningStatusLabel,
  formatINR,
  useDribeeTheme,
} from '@/hooks/useDribeeTheme';
import type { Earning } from '@/types/dribee';

interface EarningCardProps {
  earning: Earning;
  onPress: () => void;
}

function formatCardDate(raw: string): { dateStr: string; timeStr: string } {
  const d = new Date(raw.replace(' ', 'T'));
  if (isNaN(d.getTime())) return { dateStr: raw, timeStr: '' };
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const hour = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const timeStr = `${hour % 12 || 12}:${min} ${ampm}`;
  return { dateStr, timeStr };
}

export function EarningCard({ earning, onPress }: EarningCardProps) {
  const { colors } = useDribeeTheme();
  const statusColor = earningStatusColor(earning.status, colors);

  return (
    <Pressable
      onPress={onPress}
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
      {/* Top row: service badge + status chip */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexShrink: 1, gap: 6 }}>
          <View
            style={{
              backgroundColor: colors.brandNavy,
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 20,
              alignSelf: 'flex-start',
            }}
          >
            <Text numberOfLines={1} style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>
              {earning.serviceType}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}
          >
            {earning.serviceName}
          </Text>
          {earning.machineType && earning.machineType !== '—' ? (
            <Text
              numberOfLines={1}
              style={{ color: colors.textSecondary, fontSize: 12 }}
            >
              {earning.machineType}
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
            {earningStatusLabel(earning.status)}
          </Text>
        </View>
      </View>

      {/* Completed date/time */}
      {earning.completedAt ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
          <CheckCircle size={13} strokeWidth={1.5} color={colors.brandTeal} />
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Completed on {formatCardDate(earning.completedAt).dateStr} at{' '}
            {formatCardDate(earning.completedAt).timeStr}
          </Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
          <Calendar size={13} strokeWidth={1.5} color={colors.textTertiary} />
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            {formatCardDate(earning.date).dateStr}
          </Text>
        </View>
      )}

      {/* Totals section */}
      <View
        style={{ height: 1, backgroundColor: colors.borderDivider, marginTop: 12, marginBottom: 12 }}
      />

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Service Fee</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 13 }}>
            {formatINR(earning.grossEarning)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
            Commission ({earning.commissionPct}%)
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
            − {formatINR(earning.commissionAmount)}
          </Text>
        </View>
        <View
          style={{ height: 1, backgroundColor: colors.borderDivider, marginVertical: 4 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
            Your Earning
          </Text>
          <Text style={{ color: colors.brandNavy, fontSize: 16, fontWeight: '700' }}>
            {formatINR(earning.netEarning)}
          </Text>
        </View>
      </View>

      {earning.status === 'failed' ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${colors.brandAmber}1A`,
            borderRadius: 8,
            padding: 8,
            gap: 8,
            marginTop: 12,
          }}
        >
          <AlertTriangle size={14} strokeWidth={1.5} color={colors.brandAmber} />
          <Text style={{ color: colors.brandAmber, fontSize: 12, flex: 1 }}>
            Payout failed — tap to fix
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
