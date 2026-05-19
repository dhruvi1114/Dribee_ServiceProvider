import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { PrimaryButton } from '@/components/dribee';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useSendAuthOtp } from '@/services/auth/auth.query';

import type { AuthScreenProps } from '@/navigation/types';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const { colors } = useDribeeTheme();
  const [phone, setPhone] = useState('');
  const sendOtpMutation = useSendAuthOtp();
  const isValid = phone.length === 10;

  const handleSendOtp = () => {
    sendOtpMutation.mutate(
      { phone },
      {
        onSuccess: () => {
          navigation.navigate('Otp', { phone: `+91 ${phone}` });
        },
      },
    );
  };

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
              <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700' }}>Welcome Back</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 }}>
                Login to continue
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
            }}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 1,
              }}
            >
              MOBILE NUMBER
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 56,
                backgroundColor: colors.bgInput,
                borderColor: colors.borderInput,
                borderWidth: 1.5,
                borderRadius: 10,
                paddingHorizontal: 14,
                marginTop: 8,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
                +91
              </Text>
              <View
                style={{
                  width: 1,
                  height: 24,
                  backgroundColor: colors.borderInput,
                  marginHorizontal: 12,
                }}
              />
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
                keyboardType="number-pad"
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textTertiary}
                style={{ flex: 1, color: colors.textPrimary, fontSize: 14 }}
                maxLength={10}
              />
            </View>

            <View style={{ marginTop: 24 }}>
              <PrimaryButton
                label="Send OTP"
                onPress={handleSendOtp}
                disabled={!isValid || sendOtpMutation.isPending}
              />
            </View>

            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 11,
                textAlign: 'center',
                marginTop: 16,
                paddingHorizontal: 16,
              }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>

            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <Text
                onPress={() => navigation.navigate('Register')}
                style={{ color: colors.brandBlue, fontSize: 14, fontWeight: '500' }}
              >
                New here? Apply as a Pro
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
