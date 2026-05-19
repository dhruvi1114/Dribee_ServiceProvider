import { View, Text, TextInput } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import type { RegisterProFormValues } from '@/utils/validations';

function FieldLabel({ label }: { label: string }) {
  const { colors } = useDribeeTheme();
  return (
    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
      {label.toUpperCase()}
    </Text>
  );
}

function StyledInput({
  value,
  onChangeText,
  error,
  ...props
}: {
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
} & Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText'>) {
  const { colors } = useDribeeTheme();
  return (
    <>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textTertiary}
        style={{
          height: 56,
          backgroundColor: colors.bgInput,
          borderColor: error ? colors.statusRejected : colors.borderInput,
          borderWidth: 1.5,
          borderRadius: 10,
          paddingHorizontal: 14,
          color: colors.textPrimary,
          fontSize: 14,
        }}
        {...props}
      />
      {error ? (
        <Text style={{ color: colors.statusRejected, fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : null}
    </>
  );
}

export function Step1Basic() {
  const { control, formState: { errors } } = useFormContext<RegisterProFormValues>();

  return (
    <View style={{ gap: 20 }}>
      <Controller
        name="fullName"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="Full Name" />
            <StyledInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter your full name"
              error={errors.fullName?.message}
            />
          </View>
        )}
      />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="Phone" />
            <StyledInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="10-digit mobile number"
              keyboardType="number-pad"
              maxLength={10}
              error={errors.phone?.message}
            />
          </View>
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="Email (Optional)" />
            <StyledInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter email address"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email?.message}
            />
          </View>
        )}
      />
    </View>
  );
}
