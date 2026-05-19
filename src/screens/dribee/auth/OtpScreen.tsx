import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PrimaryButton } from '@/components/dribee';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useAppDispatch } from '@/store/hooks';
import { setAuthenticated, setUser } from '@/store/slices/authSlice';
import { useSendAuthOtp, useVerifyAuthOtp } from '@/services/auth/auth.query';
import { setToken } from '@/lib/keychain';

import type { AuthScreenProps } from '@/navigation/types';

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return phone;
  const last10 = digits.slice(-10);
  return `+91 ${last10.slice(0, 5)} ••••••`;
}

export function OtpScreen({ navigation, route }: AuthScreenProps<'Otp'>) {
  const { colors } = useDribeeTheme();
  const dispatch = useAppDispatch();
  const sendOtpMutation = useSendAuthOtp();
  const verifyOtpMutation = useVerifyAuthOtp();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [resendIn, setResendIn] = useState(28);
  const inputs = useRef<(TextInput | null)[]>([]);
  const shake = useSharedValue(0);

  const phoneDigits = route.params.phone.replace(/\D/g, '').slice(-10);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const setDigit = (index: number, value: string) => {
    const v = value.replace(/[^0-9]/g, '').slice(0, 1);
    setError(false);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < 5) inputs.current[index + 1]?.focus();
  };

  const triggerShake = () => {
    shake.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  };

  const handleVerify = () => {
    const code = digits.join('');
    verifyOtpMutation.mutate(
      { phone: phoneDigits, otp: code },
      {
        onSuccess: async (res) => {
          if (res.user.role !== 'pro') {
            Toast.show({
              type: 'error',
              text1: 'Not a service provider',
              text2: 'This account is not registered as a pro. Use the customer app.',
            });
            return;
          }
          if (res.token) {
            await setToken(res.token);
          }
          dispatch(
            setUser({
              id: res.user.id,
              email: res.user.email ?? '',
              name: res.user.name,
            }),
          );
          dispatch(setAuthenticated(true));
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'App',
                  state: {
                    routes: [
                      {
                        name: 'HomeTab',
                        state: { routes: [{ name: 'Home' }] },
                      },
                    ],
                  },
                },
              ],
            }),
          );
        },
        onError: () => {
          setError(true);
          triggerShake();
        },
      },
    );
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const isComplete = digits.every((d) => d !== '');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgApp }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={[colors.brandNavy, '#0F1F33']}
            style={{ height: 220, paddingHorizontal: 20, paddingTop: 60 }}
          >
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>AAS Tech Pro</Text>
            <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 36 }}>
              <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700' }}>Verify OTP</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 }}>
                Sent to {maskPhone(route.params.phone)}
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
              paddingTop: 32,
              paddingBottom: 32,
            }}
          >
            <Animated.View
              style={[{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, shakeStyle]}
            >
              {digits.map((d, i) => {
                const filled = d !== '';
                const borderColor = error
                  ? colors.statusRejected
                  : filled
                    ? colors.brandNavy
                    : colors.borderInput;
                return (
                  <TextInput
                    key={i}
                    ref={(r) => {
                      inputs.current[i] = r;
                    }}
                    value={d}
                    onChangeText={(t) => setDigit(i, t)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !d && i > 0) {
                        inputs.current[i - 1]?.focus();
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={{
                      flex: 1,
                      height: 64,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor,
                      backgroundColor: filled ? colors.brandNavy : colors.bgInput,
                      textAlign: 'center',
                      fontSize: 24,
                      fontWeight: '700',
                      color: filled ? colors.textInverse : colors.textPrimary,
                    }}
                  />
                );
              })}
            </Animated.View>

            {error ? (
              <Text style={{ color: colors.statusRejected, fontSize: 13, marginTop: 12 }}>
                Incorrect OTP. Try again or resend.
              </Text>
            ) : null}

            <View style={{ marginTop: 12, alignItems: 'flex-start' }}>
              {resendIn > 0 ? (
                <Text style={{ color: colors.textTertiary, fontSize: 13 }}>Resend in {resendIn}s</Text>
              ) : (
                <Text
                  onPress={() => {
                    sendOtpMutation.mutate({ phone: phoneDigits });
                    setResendIn(28);
                  }}
                  style={{ color: colors.brandBlue, fontSize: 13, fontWeight: '500' }}
                >
                  Resend OTP
                </Text>
              )}
            </View>

            <View style={{ marginTop: 28 }}>
              <PrimaryButton
                label="Verify & Login"
                onPress={handleVerify}
                disabled={!isComplete || verifyOtpMutation.isPending}
                loading={verifyOtpMutation.isPending}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
