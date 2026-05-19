import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import {
  useAcceptBookingOffer,
  useActiveOffer,
  useRejectBookingOffer,
} from '@/services/bookings/offers.query';

import type { RootStackScreenProps } from '@/navigation/types';

export function BookingOfferScreen({ route, navigation }: RootStackScreenProps<'BookingOffer'>) {
  const { colors } = useDribeeTheme();
  const { offerId, bookingId, expiresAt: expiresAtParam } = route.params;
  const offerQuery = useActiveOffer(true);
  const accept = useAcceptBookingOffer();
  const reject = useRejectBookingOffer();

  const offer = offerQuery.data;
  // Trust server's expires_at if present; fall back to nav param.
  const expiresAtMs = useMemo(() => {
    const value = offer?.expires_at ?? expiresAtParam;
    return value ? new Date(value).getTime() : 0;
  }, [offer?.expires_at, expiresAtParam]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((expiresAtMs - now) / 1000));
  const expired = expiresAtMs > 0 && remainingSeconds <= 0;

  // When the server reports no active offer (rejected, expired, or accepted by
  // a different device), get out of this screen.
  useEffect(() => {
    if (offerQuery.isFetched && offer === null) {
      navigation.goBack();
    }
  }, [offerQuery.isFetched, offer, navigation]);

  const handleAccept = () => {
    accept.mutate(bookingId, {
      onSuccess: () => {
        navigation.replace('App', {
          screen: 'JobsTab',
          params: { screen: 'JobDetail', params: { jobId: bookingId } },
        });
      },
    });
  };

  const handleReject = () => {
    reject.mutate(bookingId, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  };

  // The actual offer payload shown — prefer fresh server data, fall back to
  // params for the brief window before /active-offer responds.
  const showLoading = offerQuery.isLoading && !offer;

  if (showLoading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.brandTeal} />
        </View>
      </ScreenContainer>
    );
  }

  const addressLine = offer?.customer_address ?? null;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            gap: 12,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
            NEW BOOKING NEARBY
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: '700' }}>
            {offer?.service_type_name ?? 'Service'}
          </Text>

          {null}
          {offer?.distance_km !== null && offer?.distance_km !== undefined ? (
            <Row label="Distance" value={`${offer.distance_km.toFixed(1)} km`} colors={colors} />
          ) : null}
          {offer?.priority ? (
            <Row label="Urgency" value={offer.priority} colors={colors} />
          ) : null}
          {offer?.slot_date ? <Row label="Slot" value={offer.slot_date} colors={colors} /> : null}
          {addressLine ? <Row label="Address" value={addressLine} colors={colors} /> : null}
          {null}
        </View>

        <View
          style={{
            backgroundColor: expired ? colors.statusRejected : colors.brandTeal,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600', letterSpacing: 1 }}>
            {expired ? 'OFFER EXPIRED' : 'TIME LEFT'}
          </Text>
          {!expired ? (
            <Text style={{ color: '#FFF', fontSize: 36, fontWeight: '800', marginTop: 4 }}>
              {remainingSeconds}s
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <Pressable
          onPress={handleReject}
          disabled={expired || reject.isPending}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.statusRejected,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: expired || reject.isPending ? 0.5 : 1,
          }}
        >
          <Text style={{ color: colors.statusRejected, fontSize: 16, fontWeight: '600' }}>
            {reject.isPending ? 'Rejecting…' : 'Reject'}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleAccept}
          disabled={expired || accept.isPending}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 12,
            backgroundColor: colors.brandTeal,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: expired || accept.isPending ? 0.5 : 1,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
            {accept.isPending ? 'Accepting…' : 'Accept'}
          </Text>
        </Pressable>
      </View>
      <View>
        <Text style={{ color: 'transparent' }}>{offerId}</Text>
      </View>
    </ScreenContainer>
  );
}

function Row({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useDribeeTheme>['colors'] }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500', flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}
