import { Calendar, CheckCircle, MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/dribee/PrimaryButton';
import {
  jobStatusColor,
  jobStatusLabel,
  useDribeeTheme,
} from '@/hooks/useDribeeTheme';
import type { Job } from '@/types/dribee';

interface JobCardProps {
  job: Job;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onContinue?: () => void;
  onDirections?: () => void;
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

export function JobCard({
  job,
  onPress,
  onAccept,
  onReject,
  onContinue,
  onDirections,
}: JobCardProps) {
  const { colors } = useDribeeTheme();
  const statusColor = jobStatusColor(job.status, colors);
  const { dateStr, timeStr } = formatCardDate(job.date);

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
      {/* Top row: service badge + date */}
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
              {job.serviceType}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}
          >
            {job.serviceType}
          </Text>
          {job.machineType ? (
            <Text
              numberOfLines={1}
              style={{ color: colors.textSecondary, fontSize: 12 }}
            >
              {job.machineType}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Calendar size={11} strokeWidth={1.5} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '500' }}>
            {dateStr}{timeStr ? ` - ${timeStr}` : ''}
          </Text>
        </View>
      </View>

      {/* Address */}
      {job.address ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
          <MapPin size={13} strokeWidth={1.5} color={colors.textTertiary} />
          <Text
            numberOfLines={2}
            style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}
          >
            {job.address}
          </Text>
        </View>
      ) : job.zone ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
          <MapPin size={13} strokeWidth={1.5} color={colors.textTertiary} />
          <Text
            numberOfLines={1}
            style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}
          >
            {job.zone}
          </Text>
        </View>
      ) : null}

      {/* Status chip */}
      <View
        style={{
          marginTop: 10,
          backgroundColor: `${statusColor}1A`,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>
          {jobStatusLabel(job.status)}
        </Text>
      </View>

      {/* Completed at */}
      {job.status === 'completed' && job.completedAt ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
          <CheckCircle size={13} strokeWidth={1.5} color={colors.brandTeal} />
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Completed on {formatCardDate(job.completedAt).dateStr} at{' '}
            {formatCardDate(job.completedAt).timeStr}
          </Text>
        </View>
      ) : null}

      {/* Action buttons */}
      <View
        style={{ height: 1, backgroundColor: colors.borderDivider, marginTop: 12, marginBottom: 12 }}
      />

      {job.status === 'new' ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Reject"
              onPress={() => onReject?.()}
              variant="outlined"
              color={colors.statusRejected}
              height={38}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Accept" onPress={() => onAccept?.()} height={38} />
          </View>
        </View>
      ) : job.status === 'inProgress' ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="View Details"
              onPress={onPress}
              variant="outlined"
              color={colors.brandNavy}
              height={38}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Directions"
              onPress={() => onDirections?.()}
              variant="outlined"
              color={colors.brandTeal}
              height={38}
            />
          </View>
        </View>
      ) : job.status === 'readyResume' ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Start Continuation Visit"
              onPress={() => onContinue?.()}
              height={38}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Directions"
              onPress={() => onDirections?.()}
              variant="outlined"
              color={colors.brandTeal}
              height={38}
            />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="View Details"
              onPress={onPress}
              variant="outlined"
              color={colors.brandNavy}
              height={38}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Directions"
              onPress={() => onDirections?.()}
              variant="outlined"
              color={colors.brandTeal}
              height={38}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
}
