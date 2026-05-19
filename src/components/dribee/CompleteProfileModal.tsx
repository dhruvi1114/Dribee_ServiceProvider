import { useEffect } from 'react';
import { Modal, ScrollView, Text, View, Pressable } from 'react-native';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

import { AppButton } from '@/components/ui/Button';
import { ChipSelector } from '@/components/shared/ChipSelector';
import {
  useStates,
  useCities,
  useServiceTypes,
  useZones,
  useMachineTypes,
} from '@/services/master/master.query';
import { useCompleteProProfile } from '@/services/pro/pro.query';
import { useAppSelector } from '@/store/hooks';
import {
  completeProProfileSchema,
  type CompleteProProfileFormValues,
} from '@/utils/validations';

export function CompleteProfileModal({ visible }: { visible: boolean }) {
  const detectedAddress = useAppSelector((s) => s.location.address);
  const form = useForm<CompleteProProfileFormValues>({
    resolver: zodResolver(completeProProfileSchema),
    mode: 'onTouched',
    defaultValues: {
      state: '',
      cityId: '',
      serviceTypeIds: [],
      zoneIds: [],
      machineTypes: [],
    },
  });

  const complete = useCompleteProProfile();

  const submit = form.handleSubmit(
    async (values) => {
      await complete.mutateAsync(values);
    },
    (errors) => {
      const first = Object.values(errors)[0] as { message?: string } | undefined;
      Toast.show({
        type: 'error',
        text1: 'Please complete all fields',
        text2: first?.message,
      });
    },
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] p-4">
          <Text className="text-xl font-semibold mb-2">Complete your profile</Text>
          <Text className="text-sm text-gray-600 mb-3">
            Tell us where you work and what you can do so we can match you with jobs.
          </Text>
          {detectedAddress?.state || detectedAddress?.city ? (
            <Text className="text-xs text-gray-500 mb-3">
              Detected: {[detectedAddress.city, detectedAddress.state].filter(Boolean).join(', ')}
            </Text>
          ) : null}
          <FormProvider {...form}>
            <ProfileFields />
          </FormProvider>
          <AppButton
            className="mt-3"
            title="Save"
            onPress={submit}
            isLoading={complete.isPending}
          />
        </View>
      </View>
    </Modal>
  );
}

function ProfileFields() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CompleteProProfileFormValues>();

  const detectedAddress = useAppSelector((s) => s.location.address);
  const states = useStates();
  const cities = useCities(watch('state') || undefined);

  // Pre-fill state from detected address once, when the user hasn't picked one yet.
  useEffect(() => {
    if (!detectedAddress?.state || watch('state')) return;
    const match = (states.data ?? []).find(
      (s) => s.name.toLowerCase() === detectedAddress.state?.toLowerCase(),
    );
    if (match) {
      setValue('state', match.name, { shouldValidate: true });
    }
  }, [detectedAddress?.state, states.data, setValue, watch]);

  // Pre-fill city once cities have loaded for the detected state.
  useEffect(() => {
    if (!detectedAddress?.city || watch('cityId')) return;
    const match = (cities.data ?? []).find(
      (c) => c.name.toLowerCase() === detectedAddress.city?.toLowerCase(),
    );
    if (match) {
      setValue('cityId', String(match.id), { shouldValidate: true });
    }
  }, [detectedAddress?.city, cities.data, setValue, watch]);

  const services = useServiceTypes();
  const zones = useZones();
  const machines = useMachineTypes();

  const state = watch('state');
  const cityId = watch('cityId');

  return (
    <ScrollView contentContainerClassName="gap-4 pb-2">
      <View className="gap-2">
        <Text className="text-sm font-medium">State</Text>
        <View className="flex-row flex-wrap gap-2">
          {(states.data ?? []).map((s) => (
            <Pressable
              key={s.name}
              onPress={() => {
                setValue('state', s.name, { shouldValidate: true });
                setValue('cityId', '', { shouldValidate: false });
              }}
              className={`px-3 py-2 rounded-full border ${
                state === s.name
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-gray-300'
              }`}
            >
              <Text className={state === s.name ? 'text-white' : 'text-gray-700'}>
                {s.name}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.state?.message ? (
          <Text className="text-red-500 text-xs">{errors.state.message}</Text>
        ) : null}
      </View>

      {state ? (
        <View className="gap-2">
          <Text className="text-sm font-medium">City</Text>
          <View className="flex-row flex-wrap gap-2">
            {(cities.data ?? []).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setValue('cityId', String(c.id), { shouldValidate: true })}
                className={`px-3 py-2 rounded-full border ${
                  cityId === String(c.id)
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300'
                }`}
              >
                <Text className={cityId === String(c.id) ? 'text-white' : 'text-gray-700'}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.cityId?.message ? (
            <Text className="text-red-500 text-xs">{errors.cityId.message}</Text>
          ) : null}
        </View>
      ) : null}

      <ChipSelector
        label="Skills (service types)"
        options={(services.data ?? []).map((s) => ({ id: s.id, name: s.name }))}
        value={watch('serviceTypeIds')}
        onChange={(v) => setValue('serviceTypeIds', v as string[], { shouldValidate: true })}
        error={errors.serviceTypeIds?.message}
      />
      <ChipSelector
        label="Service zones"
        options={(zones.data ?? []).map((z) => ({ id: z.id, name: z.name }))}
        value={watch('zoneIds')}
        onChange={(v) => setValue('zoneIds', v as string[], { shouldValidate: true })}
        error={errors.zoneIds?.message}
      />
      <ChipSelector
        label="Machine types"
        options={(machines.data ?? []).map((m) => ({ id: m.name, name: m.name }))}
        value={watch('machineTypes')}
        onChange={(v) => setValue('machineTypes', v as string[], { shouldValidate: true })}
        error={errors.machineTypes?.message}
      />
    </ScrollView>
  );
}
