import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import { PrimaryButton } from '@/components/dribee';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { registerProSchema, type RegisterProFormValues } from '@/utils/validations';
import { useRegisterPro } from '@/services/pro/pro.query';
import { useUploadIdProof } from '@/services/pro/upload.query';
import { getApiErrorMessage } from '@/utils/common-functions';

import { Step1Basic } from './register/Step1Basic';
import { Step3KycAddress } from './register/Step3KycAddress';

const STEP_TITLES = ['Basic Info', 'KYC & Bank'];

export function RegisterScreen() {
  const { colors } = useDribeeTheme();
  const [step, setStep] = useState(1);
  const navigation = useNavigation<any>();
  const upload = useUploadIdProof();
  const register = useRegisterPro();

  const form = useForm<RegisterProFormValues>({
    resolver: zodResolver(registerProSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      pincode: '',
      aadhaarLast4: '',
      panNumber: '',
      idProofUrl: '',
      bankAccountNumber: '',
      ifscCode: '',
    },
  });

  const next = () => setStep((s) => Math.min(2, s + 1));

  const submit = form.handleSubmit(
    async (values) => {
      try {
        await register.mutateAsync(values);
        Toast.show({ type: 'success', text1: 'Registration submitted' });
        navigation.reset({ index: 0, routes: [{ name: 'RegistrationSubmitted' as never }] });
      } catch (err) {
        Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Registration failed') });
      }
    },
    (errors) => {
      const firstError = Object.values(errors)[0] as { message?: string } | undefined;
      Toast.show({
        type: 'error',
        text1: 'Please complete all required fields',
        text2: firstError?.message,
      });
    },
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgApp }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={[colors.brandNavy, '#0F1F33']}
            style={{ height: 200, paddingHorizontal: 20, paddingTop: 60 }}
          >
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>Dribee Pro</Text>
            <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32 }}>
              <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700' }}>Apply as a Pro</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 }}>
                Step {step} of 2 · {STEP_TITLES[step - 1]}
              </Text>
            </View>
          </LinearGradient>

          <View
            style={{
              flex: 1,
              backgroundColor: colors.bgCard,
              marginTop: -20,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 28,
              paddingBottom: 32,
            }}
          >
            {/* Step progress dots */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
              {[1, 2].map((s) => (
                <View
                  key={s}
                  style={{
                    height: 4,
                    flex: 1,
                    borderRadius: 2,
                    backgroundColor: s <= step ? colors.brandAmber : colors.borderInput,
                  }}
                />
              ))}
            </View>

            <FormProvider {...form}>
              {step === 1 && <Step1Basic />}
              {step === 2 && <Step3KycAddress uploading={upload.isPending} />}
            </FormProvider>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              {step > 1 && (
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    variant="outlined"
                    label="Back"
                    onPress={() => setStep((s) => s - 1)}
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                {step < 2 ? (
                  <PrimaryButton label="Next" onPress={next} />
                ) : (
                  <PrimaryButton
                    label="Submit"
                    onPress={submit}
                    loading={register.isPending}
                    disabled={register.isPending}
                  />
                )}
              </View>
            </View>

            {step === 1 && (
              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <Text
                  onPress={() => navigation.navigate('Login')}
                  style={{ color: colors.brandBlue, fontSize: 14, fontWeight: '500' }}
                >
                  Already a Pro? Login
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
