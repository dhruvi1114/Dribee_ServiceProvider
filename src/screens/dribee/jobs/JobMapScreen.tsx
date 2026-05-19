import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { Header, PrimaryButton, StatusChip } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useBooking } from '@/services/jobs/jobs.query';
import { bookingToJob } from '@/services/jobs/mappers';

import type { JobsStackScreenProps } from '@/navigation/types';

// Surat city default — used when we don't have geocoded coords for the address
const DEFAULT_REGION = {
  latitude: 21.1702,
  longitude: 72.8311,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function JobMapScreen({ route }: JobsStackScreenProps<'JobMap'>) {
  const { colors } = useDribeeTheme();
  const { data: booking } = useBooking(route.params.jobId);

  if (!booking) {
    return (
      <ScreenContainer>
        <Header title="Loading…" />
      </ScreenContainer>
    );
  }

  const job = bookingToJob(booking);

  const address = job.address ?? job.zone;

  const openMaps = () => {
    const q = encodeURIComponent(address);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${q}`,
      android: `geo:0,0?q=${q}`,
    })!;
    Linking.openURL(url);
  };

  return (
    <ScreenContainer noSafeArea>
      <Header
        title="Job Location"
        rightElement={
          <Text
            onPress={openMaps}
            style={{ color: colors.brandTeal, fontSize: 14, fontWeight: '600', padding: 8 }}
          >
            Navigate
          </Text>
        }
      />

      <View style={{ flex: 1 }}>
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFill}
          initialRegion={DEFAULT_REGION}
        >
          <Marker
            coordinate={DEFAULT_REGION}
            title={job.customerName}
            description={address}
          />
        </MapView>
      </View>

      <View
        style={{
          backgroundColor: colors.bgCard,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: -2 },
          elevation: 6,
          gap: 10,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
          {address}
        </Text>
        <View style={{ alignSelf: 'flex-start' }}>
          <StatusChip label={job.zone} color={colors.brandNavy} size="sm" />
        </View>
        <PrimaryButton label="Open in Maps" onPress={openMaps} height={48} />
      </View>
    </ScreenContainer>
  );
}
