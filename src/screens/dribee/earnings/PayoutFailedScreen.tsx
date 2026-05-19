import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Header, PrimaryButton } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { formatINR, useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useEarnings } from '@/services/earnings/earnings.query';
import { earningApiToEarning } from '@/services/jobs/mappers';
import { useProMe } from '@/services/pro/pro.query';

import type { AppTabParamList, EarningsStackScreenProps } from '@/navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList>,
  BottomTabNavigationProp<AppTabParamList>
>;

export function PayoutFailedScreen({ route }: EarningsStackScreenProps<'PayoutFailed'>) {
  const { colors } = useDribeeTheme();
  const navigation = useNavigation<Nav>();
  const { data: proMe } = useProMe();
  const { data: apiEarnings } = useEarnings(
    proMe?.id ? { pro_id: proMe.id } : undefined,
  );
  const earning = (apiEarnings ?? [])
    .map(earningApiToEarning)
    .find((e) => e.id === route.params.earningId);

  if (!earning) {
    return (
      <ScreenContainer>
        <Header title="Earning not found" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Payout Failed" />

      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: `${colors.statusRejected}26`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={48} strokeWidth={2} color={colors.statusRejected} />
        </View>

        <Text
          style={{ color: colors.textPrimary, fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 8 }}
        >
          Payout Transfer Failed
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            paddingHorizontal: 16,
          }}
        >
          Your payout of {formatINR(earning.netEarning)} for Job {earning.jobId} could not be
          processed.
        </Text>

        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 12,
            padding: 16,
            width: '100%',
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
            marginTop: 12,
          }}
        >
          <Text style={{ color: colors.textTertiary, fontSize: 11, textTransform: 'uppercase' }}>
            Failure Reason
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 14, marginTop: 6 }}>
            {earning.failReason ?? 'Unknown error.'}
          </Text>
        </View>

        <View style={{ width: '100%', marginTop: 16, gap: 10 }}>
          <PrimaryButton
            label="Update Bank Details"
            onPress={() =>
              navigation.navigate('ProfileTab', { screen: 'BankDetails' })
            }
          />
          <PrimaryButton
            label="Contact Admin"
            onPress={() =>
              navigation.navigate('ProfileTab', { screen: 'HelpSupport' })
            }
            variant="outlined"
            color={colors.brandNavy}
            height={50}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
