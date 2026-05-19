import { ChevronRight, MessageSquare, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Header, SectionLabel } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How do I accept a job?',
    a: 'Open the job from your Jobs tab and tap "Accept Job". You have 10 minutes to respond before the job is offered to another Pro.',
  },
  {
    q: 'What if the customer\'s OTP expires?',
    a: 'Ask the customer to regenerate the OTP from their app. Each OTP is valid for 5 minutes.',
  },
  {
    q: 'What happens when a part is out of stock?',
    a: 'You can still add out-of-stock parts to the list. Admin is automatically notified to procure them, and you\'ll receive a continuation visit when they arrive.',
  },
  {
    q: 'How are my earnings calculated?',
    a: 'Net earning = Service fee + Continuation fee (if any) − Commission. Commission is set in your contract.',
  },
  {
    q: 'When will I receive my payout?',
    a: 'Payouts are processed within 48 hours of customer payment. You\'ll be notified once the transfer is complete.',
  },
  {
    q: 'How do I update my bank details?',
    a: 'Go to Profile → Bank Details → Edit. Changes are reviewed before the next payout.',
  },
  {
    q: 'Can I reject a job after accepting?',
    a: 'Once accepted, jobs cannot be rejected from the app. Contact admin if you need to cancel an accepted job.',
  },
];

export function HelpSupportScreen() {
  const { colors } = useDribeeTheme();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <ScreenContainer>
      <Header title="Help & Support" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
        <Card>
          <SectionLabel label="Frequently Asked Questions" marginTop={0} />
          <View style={{ marginTop: 8 }}>
            {FAQS.map((f, i) => (
              <FaqRow
                key={f.q}
                item={f}
                open={openIdx === i}
                onToggle={() => setOpenIdx((cur) => (cur === i ? null : i))}
                isLast={i === FAQS.length - 1}
              />
            ))}
          </View>
        </Card>

        <Card>
          <SectionLabel label="Contact Admin" marginTop={0} />
          <ContactRow
            icon={<Phone size={20} strokeWidth={1.5} color={colors.brandTeal} />}
            label="Call Admin"
            value="+91 80000 12345"
            onPress={() => Linking.openURL('tel:+918000012345')}
          />
          <ContactRow
            icon={<MessageSquare size={20} strokeWidth={1.5} color={colors.brandNavy} />}
            label="Send Message"
            value="In-app message"
            onPress={() => {}}
            isLast
          />
        </Card>

        <View style={{ alignItems: 'center', paddingTop: 12 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
            Dribee Pro
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 2 }}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function FaqRow({
  item,
  open,
  onToggle,
  isLast,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const { colors } = useDribeeTheme();
  const rotate = useSharedValue(0);

  rotate.value = withTiming(open ? 1 : 0, { duration: 200 });
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 90}deg` }],
  }));

  return (
    <View style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.borderDivider }}>
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          gap: 12,
        }}
      >
        <Text
          style={{ flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}
        >
          {item.q}
        </Text>
        <Animated.View style={chevronStyle}>
          <ChevronRight size={16} strokeWidth={1.5} color={colors.textTertiary} />
        </Animated.View>
      </Pressable>
      {open ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            paddingBottom: 14,
            lineHeight: 18,
          }}
        >
          {item.a}
        </Text>
      ) : null}
    </View>
  );
}

function ContactRow({
  icon,
  label,
  value,
  onPress,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const { colors } = useDribeeTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.borderDivider,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.bgSection,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
          {label}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 1 }}>
          {value}
        </Text>
      </View>
      <ChevronRight size={16} strokeWidth={1.5} color={colors.textTertiary} />
    </Pressable>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { colors } = useDribeeTheme();
  return (
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
      {children}
    </View>
  );
}
