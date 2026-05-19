import { Check } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ConfirmAlert, Header, InfoCard, PrimaryButton, SectionLabel } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useBooking, useCompleteJob } from '@/services/jobs/jobs.query';
import { bookingToJob } from '@/services/jobs/mappers';

import type { JobsStackScreenProps } from '@/navigation/types';

// "All parts in the approved list have been installed" only applies when the
// booking actually has parts — built dynamically below based on booking.parts.
const BASE_CHECKLIST_BEFORE_PARTS = ['All diagnosed issues have been resolved'];
const PARTS_CHECKLIST_ITEM = 'All parts in the approved list have been installed';
const BASE_CHECKLIST_AFTER_PARTS = [
  'Machine has been tested and is functioning',
  'Work area has been cleaned',
];

export function JobCompletionScreen({
  navigation,
  route,
}: JobsStackScreenProps<'JobCompletion'>) {
  const { colors } = useDribeeTheme();
  const { data: booking } = useBooking(route.params.jobId);
  const completeJobMutation = useCompleteJob();
  const hasParts = (booking?.parts?.length ?? 0) > 0;
  // Build the checklist conditionally — drop the parts row if no parts were
  // created (No Parts Needed flow from Diagnosis screen).
  const CHECKLIST = hasParts
    ? [...BASE_CHECKLIST_BEFORE_PARTS, PARTS_CHECKLIST_ITEM, ...BASE_CHECKLIST_AFTER_PARTS]
    : [...BASE_CHECKLIST_BEFORE_PARTS, ...BASE_CHECKLIST_AFTER_PARTS];
  const [checked, setChecked] = useState<boolean[]>([]);
  // Resync checked array length whenever the checklist size changes (e.g. when
  // booking finishes loading and we know whether parts exist).
  useEffect(() => {
    setChecked((prev) => {
      if (prev.length === CHECKLIST.length) return prev;
      return CHECKLIST.map((_, i) => prev[i] ?? false);
    });
  }, [CHECKLIST.length]);
  const [notes, setNotes] = useState('');
  // Force-complete is for cases where the job didn't follow the normal path —
  // most often the customer declined a revisit while parts_pending. Backend
  // requires a non-empty reason when this is on.
  const [forceComplete, setForceComplete] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  if (!booking) {
    return (
      <ScreenContainer>
        <Header title="Loading…" />
      </ScreenContainer>
    );
  }

  const job = bookingToJob(booking);
  const allChecked = checked.every(Boolean);
  const trimmedNotes = notes.trim();
  const reasonRequired = forceComplete;
  const reasonMissing = reasonRequired && trimmedNotes.length === 0;
  const canSubmit = forceComplete ? !reasonMissing : allChecked;

  const onComplete = useCallback(() => setAlertVisible(true), []);

  const handleConfirm = useCallback(() => {
    setAlertVisible(false);
    if (!job.serviceJobId) return;
    completeJobMutation.mutate(
      {
        jobId: job.serviceJobId,
        data: {
          completionNotes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
          force: forceComplete || undefined,
        },
      },
      {
        onSuccess: () => {
          navigation.navigate('JobDetail', { jobId: route.params.jobId });
        },
      },
    );
  }, [completeJobMutation, forceComplete, job.serviceJobId, navigation, route.params.jobId, trimmedNotes]);

  return (
    <ScreenContainer>
      <Header title="Complete Job" />

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
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
            {job.id}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            {job.serviceType} · {job.machineType}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{job.customerName}</Text>
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
          <SectionLabel label="Completion Checklist" marginTop={0} />
          <View style={{ marginTop: 12, gap: 12 }}>
            {CHECKLIST.map((item, i) => (
              <Pressable
                key={item}
                onPress={() =>
                  setChecked((arr) => arr.map((v, idx) => (idx === i ? !v : v)))
                }
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: checked[i] ? colors.brandNavy : colors.borderInput,
                    backgroundColor: checked[i] ? colors.brandNavy : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {checked[i] ? <Check size={14} strokeWidth={3} color="#FFF" /> : null}
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: 14, flex: 1 }}>{item}</Text>
              </Pressable>
            ))}
          </View>
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
          <SectionLabel
            label={
              reasonRequired
                ? 'Reason (required)'
                : 'Completion Notes (optional)'
            }
            marginTop={0}
          />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder={
              reasonRequired
                ? 'Why is this job being force-completed? (e.g. customer declined revisit)'
                : 'Describe the work completed, any observations…'
            }
            placeholderTextColor={colors.textTertiary}
            style={{
              backgroundColor: colors.bgInput,
              borderColor: reasonMissing ? colors.statusRejected : colors.borderInput,
              borderWidth: 1.5,
              borderRadius: 10,
              padding: 12,
              minHeight: 100,
              fontSize: 13,
              color: colors.textPrimary,
              marginTop: 12,
              textAlignVertical: 'top',
            }}
          />
        </View>

        <Pressable
          onPress={() => setForceComplete((v) => !v)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
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
              width: 22,
              height: 22,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: forceComplete ? colors.brandNavy : colors.borderInput,
              backgroundColor: forceComplete ? colors.brandNavy : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            {forceComplete ? <Check size={14} strokeWidth={3} color="#FFF" /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
              Force-complete this job
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              Use only when the job can't finish normally — e.g. customer declined a revisit. A reason is required and the checklist is bypassed.
            </Text>
          </View>
        </Pressable>

        <InfoCard tone="amber">
          {forceComplete
            ? 'This job will be closed without finishing all parts. The reason you provide will be permanently recorded.'
            : 'Once you mark this job as complete, the customer will be notified to make final payment. This action cannot be undone.'}
        </InfoCard>

        <PrimaryButton
          label={forceComplete ? 'Force-Complete Job' : 'Mark Job as Complete'}
          onPress={onComplete}
          disabled={!canSubmit || completeJobMutation.isPending}
        />
      </ScrollView>

      <ConfirmAlert
        visible={alertVisible}
        title={forceComplete ? 'Force-complete this job?' : 'Mark Job as Complete?'}
        message={
          forceComplete
            ? 'The job will be closed without going through the normal flow. Your reason will be saved on the record. This cannot be undone.'
            : 'This will notify the customer to make final payment. This action cannot be undone.'
        }
        confirmLabel={forceComplete ? 'Force Complete' : 'Yes, Complete'}
        cancelLabel="Cancel"
        destructive={forceComplete}
        onConfirm={handleConfirm}
        onCancel={() => setAlertVisible(false)}
      />
    </ScreenContainer>
  );
}
