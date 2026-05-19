import { View, Text, TextInput, Pressable } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { launchImageLibrary } from 'react-native-image-picker';
import { ImagePlus, CheckCircle2 } from 'lucide-react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useUploadIdProof } from '@/services/pro/upload.query';
import type { RegisterProFormValues } from '@/utils/validations';

function FieldLabel({ label }: { label: string }) {
  const { colors } = useDribeeTheme();
  return (
    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
      {label.toUpperCase()}
    </Text>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useDribeeTheme();
  return (
    <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 4, marginTop: 8 }}>
      {title}
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

export function Step3KycAddress({ uploading: _ }: { uploading: boolean }) {
  const { colors } = useDribeeTheme();
  const { control, watch, setValue, formState: { errors } } = useFormContext<RegisterProFormValues>();
  const upload = useUploadIdProof();
  const idProofUrl = watch('idProofUrl');

  const pickIdProof = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    const url = await upload.mutateAsync({
      uri: asset.uri,
      name: asset.fileName ?? 'id-proof.jpg',
      type: asset.type ?? 'image/jpeg',
    });
    setValue('idProofUrl', url, { shouldValidate: true });
  };

  return (
    <View style={{ gap: 20 }}>
      <SectionHeader title="Address" />

      <Controller
        name="addressLine1"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="Address Line 1" />
            <StyledInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="House / flat / building"
              error={errors.addressLine1?.message}
            />
          </View>
        )}
      />
      <Controller
        name="addressLine2"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="Address Line 2 (Optional)" />
            <StyledInput
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder="Street / area / landmark"
            />
          </View>
        )}
      />
      <Controller
        name="pincode"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="Pincode" />
            <StyledInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="6-digit pincode"
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pincode?.message}
            />
          </View>
        )}
      />

      <SectionHeader title="KYC" />

      <Controller
        name="aadhaarLast4"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="Aadhaar Last 4 Digits" />
            <StyledInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="XXXX"
              keyboardType="number-pad"
              maxLength={4}
              error={errors.aadhaarLast4?.message}
            />
          </View>
        )}
      />
      <Controller
        name="panNumber"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="PAN Number" />
            <StyledInput
              value={field.value}
              onChangeText={(t) => field.onChange(t.toUpperCase())}
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              maxLength={10}
              error={errors.panNumber?.message}
            />
          </View>
        )}
      />

      <View>
        <FieldLabel label="ID Proof Image" />
        <Pressable
          onPress={pickIdProof}
          style={({ pressed }) => ({
            height: 56,
            backgroundColor: colors.bgInput,
            borderColor: errors.idProofUrl ? colors.statusRejected : idProofUrl ? colors.brandNavy : colors.borderInput,
            borderWidth: 1.5,
            borderRadius: 10,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          {idProofUrl ? (
            <CheckCircle2 size={20} color={colors.brandNavy} strokeWidth={1.5} />
          ) : (
            <ImagePlus size={20} color={colors.textTertiary} strokeWidth={1.5} />
          )}
          <Text style={{ color: upload.isPending ? colors.textTertiary : idProofUrl ? colors.brandNavy : colors.textTertiary, fontSize: 14 }}>
            {upload.isPending ? 'Uploading…' : idProofUrl ? 'Image uploaded — tap to change' : 'Tap to pick image'}
          </Text>
        </Pressable>
        {errors.idProofUrl?.message ? (
          <Text style={{ color: colors.statusRejected, fontSize: 12, marginTop: 4 }}>{errors.idProofUrl.message}</Text>
        ) : null}
      </View>

      <SectionHeader title="Bank Details" />

      <Controller
        name="bankAccountNumber"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="Bank Account Number" />
            <StyledInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter account number"
              keyboardType="number-pad"
              error={errors.bankAccountNumber?.message}
            />
          </View>
        )}
      />
      <Controller
        name="ifscCode"
        control={control}
        render={({ field }) => (
          <View>
            <FieldLabel label="IFSC Code" />
            <StyledInput
              value={field.value}
              onChangeText={(t) => field.onChange(t.toUpperCase())}
              placeholder="SBIN0001234"
              autoCapitalize="characters"
              maxLength={11}
              error={errors.ifscCode?.message}
            />
          </View>
        )}
      />
    </View>
  );
}
