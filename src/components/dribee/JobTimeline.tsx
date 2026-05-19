import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import type { TimelineStep } from '@/types/dribee';

interface JobTimelineProps {
  steps: TimelineStep[];
}

function PulseDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[
        {
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function JobTimeline({ steps }: JobTimelineProps) {
  const { colors } = useDribeeTheme();

  return (
    <View>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const lineColor =
          step.status === 'completed' ? colors.brandTeal : colors.borderDivider;

        return (
          <View key={step.key} className="flex-row">
            <View className="items-center" style={{ width: 28 }}>
              {step.status === 'completed' ? (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: colors.brandTeal,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={12} strokeWidth={3} color={colors.textInverse} />
                </View>
              ) : step.status === 'active' ? (
                <PulseDot color={colors.brandAmber} />
              ) : (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: colors.borderCard,
                  }}
                />
              )}
              {!isLast ? (
                <View style={{ width: 2, flex: 1, backgroundColor: lineColor, minHeight: 24 }} />
              ) : null}
            </View>

            <View className="flex-1 pb-5 pl-3">
              <Text
                style={{
                  color:
                    step.status === 'pending'
                      ? colors.textTertiary
                      : colors.textPrimary,
                  fontSize: 14,
                  fontWeight: step.status === 'active' ? '600' : '500',
                }}
              >
                {step.label}
              </Text>
              {step.timestamp ? (
                <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>
                  {step.timestamp}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
