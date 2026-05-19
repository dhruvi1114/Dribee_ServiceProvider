import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2 } from 'lucide-react-native';

import { PrimaryButton } from '@/components/dribee';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';

export function RegistrationSubmittedScreen() {
  const { colors } = useDribeeTheme();
  const navigation = useNavigation<any>();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgApp }}>
      <LinearGradient
        colors={[colors.brandNavy, '#0F1F33']}
        style={{ height: 200, paddingHorizontal: 20, paddingTop: 60 }}
      >
        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>Dribee Pro</Text>
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32 }}>
          <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700' }}>Application Sent</Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 }}>
            We'll review and get back to you
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
          paddingTop: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckCircle2 size={72} color={colors.brandAmber} strokeWidth={1.5} />
        <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 20, textAlign: 'center' }}>
          Registration Submitted!
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
          Our team will review your application and notify you once it's approved. You'll then be able to log in.
        </Text>

        <View style={{ width: '100%', marginTop: 40 }}>
          <PrimaryButton
            label="Back to Login"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          />
        </View>
      </View>
    </View>
  );
}
