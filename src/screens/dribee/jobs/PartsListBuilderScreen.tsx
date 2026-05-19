import { useNavigation } from '@react-navigation/native';
import { Minus, Plus, Search } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native';

import {
  Chip,
  Header,
  InfoCard,
  PrimaryButton,
  StatusChip,
} from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { PART_CATEGORIES } from '@/constants/mockData';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useAddJobPart, useSendPartsList, useBooking } from '@/services/jobs/jobs.query';
import { useStorefrontProducts } from '@/services/storefront/storefront.query';
import type { StorefrontProductListItemApi } from '@/services/storefront/storefront.query';

import type { JobsStackParamList, JobsStackScreenProps } from '@/navigation/types';
import type { JobPart } from '@/types/dribee';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';

type Nav = NativeStackNavigationProp<JobsStackParamList>;

export function PartsListBuilderScreen({ route }: JobsStackScreenProps<'PartsListBuilder'>) {
  const { colors } = useDribeeTheme();
  const navigation = useNavigation<Nav>();
  const { jobId: bookingId, pendingPart } = route.params;
  const { data: booking } = useBooking(bookingId);
  const serviceJobId = booking?.service_job_id ?? null;
  const addJobPartMutation = useAddJobPart();
  const sendPartsListMutation = useSendPartsList();
  const [category, setCategory] = useState('All');
  const [list, setList] = useState<Record<string, JobPart>>({});
  const [submitting, setSubmitting] = useState(false);

  // Prefer the booking's actual service location; fall back to the customer's
  // last known coords (or pincode) so warehouse resolution works even when the
  // booking row lacks lat/lng (legacy bookings, manually-created rows, etc.).
  const { data: productsResp, isLoading: productsLoading } = useStorefrontProducts(
    {
      latitude: booking?.service_lat ?? booking?.customer_last_lat ?? null,
      longitude: booking?.service_lng ?? booking?.customer_last_lng ?? null,
      pincode: booking?.customer_last_pincode ?? null,
    },
    undefined,
    { enabled: !!booking },
  );
  const products = productsResp?.items ?? [];
  // Drain the pendingPart param pushed by PartsProductDetail. We merge into
  // local cart state, then clear the param so a back-and-forward navigation
  // doesn't double-add the same selection.
  useEffect(() => {
    if (!pendingPart) return;
    const key = `${pendingPart.productId}:${pendingPart.skuId}`;
    setList((prev) => ({
      ...prev,
      [key]: {
        partId: pendingPart.productId,
        skuId: pendingPart.skuId,
        name: pendingPart.name,
        variant: pendingPart.variant,
        qty: pendingPart.qty,
        unitPrice: pendingPart.unitPrice,
        status: pendingPart.inStock ? 'available' : 'outOfStock',
      },
    }));
    navigation.setParams({ pendingPart: undefined });
  }, [pendingPart, navigation]);

  const filtered = useMemo(
    () =>
      category === 'All'
        ? products
        : products.filter((p) => (p.category_name ?? '') === category),
    [products, category],
  );

  const partsArray = Object.values(list);
  const oosCount = partsArray.filter((p) => p.status === 'outOfStock').length;
  const availCount = partsArray.filter((p) => p.status === 'available').length;
  const canSend = partsArray.length > 0;

  const setQty = (product: StorefrontProductListItemApi, qty: number) => {
    const dv = product.default_variant;
    if (!dv) return;
    const key = `${product.id}:${dv.variant_id}`;
    setList((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[key];
      } else {
        next[key] = {
          partId: String(product.id),
          // Carry the chosen sku id and unit price so handleSend can forward
          // them to the backend; addJobPart needs productId + skuId + price.
          skuId: String(dv.variant_id),
          name: product.name,
          variant: dv.display_name,
          qty,
          unitPrice: dv.price?.amount ?? 0,
          status: dv.in_stock ? 'available' : 'outOfStock',
        };
      }
      return next;
    });
  };

  const handleSend = async () => {
    if (submitting || !serviceJobId) return;
    setSubmitting(true);
    try {
      for (const p of partsArray) {
        if (!p.skuId) continue;
        await addJobPartMutation.mutateAsync({
          jobId: serviceJobId,
          data: {
            productId: p.partId,
            skuId: p.skuId,
            quantity: p.qty,
            unitPrice: p.unitPrice ?? 0,
          },
        });
      }
      await sendPartsListMutation.mutateAsync(serviceJobId);
      navigation.replace('PartsApprovalStatus', { jobId: bookingId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Header
        title="Build Parts List"
        rightElement={
          <Pressable
            onPress={canSend ? handleSend : undefined}
            disabled={!canSend}
            style={{ padding: 8 }}
          >
            <Text
              style={{
                color: canSend ? colors.brandBlue : colors.textTertiary,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Send
            </Text>
          </Pressable>
        }
      />

      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Pressable
          onPress={() => navigation.navigate('CatalogueSearch', { jobId: bookingId })}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 44,
            backgroundColor: colors.bgInput,
            borderRadius: 10,
            paddingHorizontal: 12,
            gap: 8,
          }}
        >
          <Search size={18} strokeWidth={1.5} color={colors.textTertiary} />
          <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
            Search parts by name or category…
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        {PART_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={category === c}
            onPress={() => setCategory(c)}
            size="sm"
          />
        ))}
      </ScrollView>

      {oosCount > 0 ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <InfoCard tone="amber">
            {`${oosCount} part${oosCount === 1 ? '' : 's'} out of stock. Admin has been notified automatically and will procure them.`}
          </InfoCard>
        </View>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          productsLoading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator color={colors.brandTeal} />
            </View>
          ) : (
            <View style={{ padding: 24 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
                No products available for this location.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const dv = item.default_variant;
          const key = dv ? `${item.id}:${dv.variant_id}` : String(item.id);
          const inList = list[key];
          const qty = inList?.qty ?? 0;
          const inStock = dv?.in_stock ?? false;
          const price = dv?.price?.amount ?? null;
          const imageUri = resolveMediaUrl(dv?.image ?? item.images?.[0] ?? null);
          return (
            <Pressable
              onPress={() => navigation.navigate('PartsProductDetail', { jobId: bookingId, productId: String(item.id) })}
              style={{
                backgroundColor: colors.bgCard,
                marginHorizontal: 16,
                marginVertical: 6,
                padding: 14,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.bgSection }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.bgSection }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                  {dv?.display_name ?? '—'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <StatusChip
                    label={inStock ? 'In Stock' : 'Out of Stock'}
                    color={inStock ? colors.statusAvailable : colors.statusOutOfStock}
                    size="sm"
                  />
                  {price != null ? (
                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                      ₹{price.toLocaleString('en-IN')}
                    </Text>
                  ) : null}
                </View>
              </View>

              {qty === 0 ? (
                <Pressable
                  onPress={() => setQty(item, 1)}
                  style={{
                    backgroundColor: colors.brandAmber,
                    paddingHorizontal: 14,
                    height: 32,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Add</Text>
                </Pressable>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Pressable
                    onPress={() => setQty(item, qty - 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.bgSection,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Minus size={16} strokeWidth={1.5} color={colors.textPrimary} />
                  </Pressable>
                  <Text
                    style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', width: 18, textAlign: 'center' }}
                  >
                    {qty}
                  </Text>
                  <Pressable
                    onPress={() => setQty(item, qty + 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.bgSection,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={16} strokeWidth={1.5} color={colors.textPrimary} />
                  </Pressable>
                </View>
              )}
            </Pressable>
          );
        }}
      />

      {/* Sticky bottom bar */}
      {canSend ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.bgCard,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 20,
            borderTopWidth: 1,
            borderTopColor: colors.borderDivider,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flexShrink: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
              {partsArray.length} part{partsArray.length === 1 ? '' : 's'} added
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
              {availCount} available · {oosCount} out of stock
            </Text>
          </View>
          <View style={{ width: 160 }}>
            <PrimaryButton label="Review & Send" onPress={handleSend} height={44} />
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
