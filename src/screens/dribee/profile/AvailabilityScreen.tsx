import { Check, Pause } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

import { Chip, Header, InfoCard, PrimaryButton, SectionLabel } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { UNAVAILABILITY_REASONS } from '@/constants/mockData';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAvailable, setUnavailabilityReason } from '@/store/slices/proSlice';
import { useProMe, useSetOwnAvailability } from '@/services/pro/pro.query';

import type { ProfileStackScreenProps } from '@/navigation/types';

export function AvailabilityScreen({ navigation }: ProfileStackScreenProps<'Availability'>) {
  const { colors } = useDribeeTheme();
  const dispatch = useAppDispatch();
  const { data: pro } = useProMe();
  const setAvailabilityMutation = useSetOwnAvailability();
  const reduxIsAvailable = useAppSelector((s) => s.pro.pro.isAvailable);
  const reason = useAppSelector((s) => s.pro.unavailabilityReason);
  const isAvailable = pro?.is_available ?? reduxIsAvailable;
  const [draftAvailable, setDraftAvailable] = useState(isAvailable);
  const [draftReason, setDraftReason] = useState<string | null>(reason);

  const onSave = () => {
    setAvailabilityMutation.mutate(draftAvailable, {
      onSuccess: () => {
        // Mirror to Redux so other screens reading the store stay in sync.
        dispatch(setAvailable(draftAvailable));
        dispatch(setUnavailabilityReason(draftAvailable ? null : draftReason));
        navigation.goBack();
      },
    });
  };

  return (
    <ScreenContainer>
      <Header title="Availability" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: draftAvailable ? `${colors.brandTeal}26` : colors.bgSection,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {draftAvailable ? (
              <Check size={36} strokeWidth={2} color={colors.brandTeal} />
            ) : (
              <Pause size={36} strokeWidth={2} color={colors.textTertiary} />
            )}
          </View>

          <Text
            style={{
              color: draftAvailable ? colors.brandTeal : colors.textTertiary,
              fontSize: 20,
              fontWeight: '700',
            }}
          >
            You are {draftAvailable ? 'Available' : 'Unavailable'}
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}
          >
            {draftAvailable
              ? 'New jobs will be assigned to you'
              : 'No new jobs will be assigned'}
          </Text>

          <Switch
            value={draftAvailable}
            onValueChange={setDraftAvailable}
            trackColor={{ true: colors.brandTeal, false: colors.borderInput }}
            thumbColor="#FFF"
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], marginTop: 4 }}
          />
        </View>

        {!draftAvailable ? (
          <View>
            <SectionLabel label="Reason (Optional)" marginTop={0} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {UNAVAILABILITY_REASONS.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  selected={draftReason === r}
                  onPress={() => setDraftReason((cur) => (cur === r ? null : r))}
                />
              ))}
            </View>
          </View>
        ) : null}

        <InfoCard tone="amber">
          Your availability status affects job assignments in real-time. Turn off when you cannot
          take new jobs.
        </InfoCard>

        <PrimaryButton
          label="Save Availability"
          onPress={onSave}
          disabled={setAvailabilityMutation.isPending}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
