import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { ArrowRight, CheckCircle } from 'lucide-react-native';

import { Chip, Header, PrimaryButton, SectionLabel } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useIssueTags } from '@/services/master/master.query';
import { useBooking, useAddDiagnosis } from '@/services/jobs/jobs.query';
import { bookingToJob } from '@/services/jobs/mappers';

import type { JobsStackScreenProps } from '@/navigation/types';

export function DiagnosisScreen({ navigation, route }: JobsStackScreenProps<'Diagnosis'>) {
  const { colors } = useDribeeTheme();
  const { data: booking } = useBooking(route.params.jobId);
  const { data: issueTags = [], isLoading: tagsLoading } = useIssueTags();
  const addDiagnosisMutation = useAddDiagnosis();
  const [tags, setTags] = useState<string[]>([]);
  const [notesEnabled, setNotesEnabled] = useState(false);
  const [notes, setNotes] = useState('');

  if (!booking) {
    return (
      <ScreenContainer>
        <Header title="Loading…" />
      </ScreenContainer>
    );
  }

  const job = bookingToJob(booking);

  const toggle = (t: string) =>
    setTags((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));

  // `next` controls where we go after diagnosis succeeds:
  //   'parts'    → build a parts list (default flow when repair needs parts).
  //   'complete' → skip parts list, go straight to Job Completion (no parts
  //                needed; pro just confirmed and finished the work).
  const submitDiagnosis = (next: 'parts' | 'complete') => {
    if (!job.serviceJobId) return;
    const serviceJobId = job.serviceJobId;
    addDiagnosisMutation.mutate(
      {
        jobId: serviceJobId,
        data: {
          issueTags: tags,
          notes: notesEnabled && notes ? notes : undefined,
        },
      },
      {
        onSuccess: () => {
          // Downstream screens take the booking id; they resolve the
          // service_jobs.id via useBooking → service_job_id at API-call time.
          if (next === 'parts') {
            navigation.replace('PartsListBuilder', { jobId: job.id });
          } else {
            navigation.replace('JobCompletion', { jobId: job.id });
          }
        },
      },
    );
  };

  return (
    <ScreenContainer>
      <Header title="Diagnose Problem" />

      <View
        style={{
          backgroundColor: `${colors.brandAmber}1A`,
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}>
          {job.serviceName}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
          {job.serviceType} · {job.machineType} · {job.zone}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
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
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Select all issues that apply. This helps document the job accurately.
          </Text>
        </View>

        <SectionLabel label="Issue Tags" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {tagsLoading ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Loading…</Text>
          ) : issueTags.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              No issue tags configured. Ask your admin to add some in Master settings.
            </Text>
          ) : (
            issueTags.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                selected={tags.includes(t.name)}
                onPress={() => toggle(t.name)}
              />
            ))
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 24,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
            Other / Additional Notes
          </Text>
          <Switch
            value={notesEnabled}
            onValueChange={setNotesEnabled}
            trackColor={{ true: colors.brandTeal, false: colors.borderInput }}
            thumbColor="#FFF"
          />
        </View>
        {notesEnabled ? (
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Describe the issue in detail…"
            placeholderTextColor={colors.textTertiary}
            style={{
              backgroundColor: colors.bgInput,
              borderColor: colors.borderInput,
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
        ) : null}

        {tags.length > 0 ? (
          <Text
            style={{
              color: colors.brandTeal,
              fontSize: 13,
              fontWeight: '600',
              marginTop: 16,
            }}
          >
            {tags.length} issue{tags.length === 1 ? '' : 's'} selected
          </Text>
        ) : null}

        <View style={{ marginTop: 28 }}>
          <Pressable
            onPress={() => submitDiagnosis('parts')}
            disabled={tags.length === 0 || addDiagnosisMutation.isPending}
          >
            <View
              style={{
                height: 54,
                width: '100%',
                backgroundColor: tags.length === 0 || addDiagnosisMutation.isPending ? '#93B4F5' : '#2563EB',
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
                <ArrowRight size={15} strokeWidth={2} color="#FFFFFF" />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                Proceed to Parts List
              </Text>
            </View>
          </Pressable>
        </View>
        <View style={{ marginTop: 12 }}>
          <Pressable
            onPress={() => submitDiagnosis('complete')}
            disabled={tags.length === 0 || addDiagnosisMutation.isPending}
          >
            <View
              style={{
                height: 54,
                width: '100%',
                backgroundColor: tags.length === 0 || addDiagnosisMutation.isPending ? '#A7F3D0' : '#059669',
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
                No Parts Needed — Complete Job
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
