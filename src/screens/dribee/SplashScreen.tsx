import { useEffect } from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { LightColors } from '@/constants/dribee';
import { env } from '@/config/env';
import { useAppSelector } from '@/store/hooks';

import type { RootStackScreenProps } from '@/navigation/types';

export function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const wordmarkScale = useSharedValue(0.8);
  const wordmarkOpacity = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    wordmarkOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    wordmarkScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    badgeOpacity.value = withDelay(700, withTiming(1, { duration: 300 }));
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));

    const t = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('App', { screen: 'HomeTab', params: { screen: 'Home' } });
      } else {
        navigation.replace('Auth', { screen: 'Login' });
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [
    badgeOpacity,
    isAuthenticated,
    navigation,
    taglineOpacity,
    wordmarkOpacity,
    wordmarkScale,
  ]);

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ scale: wordmarkScale.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({ opacity: badgeOpacity.value }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <>
      <StatusBar hidden />
      <LinearGradient
        colors={[LightColors.brandNavy, '#0F1F33']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Animated.Text
          style={[
            { color: '#FFF', fontSize: 36, fontWeight: '700', letterSpacing: -1 },
            wordmarkStyle,
          ]}
        >
          {env.APP_NAME}
        </Animated.Text>

        <Animated.View
          style={[
            {
              backgroundColor: LightColors.brandAmber,
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 999,
              marginTop: 12,
            },
            badgeStyle,
          ]}
        >
          <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Provider</Text>
        </Animated.View>

        <Animated.Text
          style={[
            { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 12 },
            taglineStyle,
          ]}
        >
          Built for field professionals
        </Animated.Text>

        <View style={{ marginTop: 48 }}>
          <ActivityIndicator color={LightColors.brandTeal} size="small" />
        </View>
      </LinearGradient>
    </>
  );
}
