import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { ChevronLeft, Minus, Plus, Star } from 'lucide-react-native';

import { Header, StatusChip } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useBooking } from '@/services/jobs/jobs.query';
import { useStorefrontProduct } from '@/services/storefront/storefront.query';
import type { StorefrontVariantDetailApi } from '@/services/storefront/storefront.query';
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';

import type { JobsStackScreenProps } from '@/navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PartsProductDetailScreen({ route, navigation }: JobsStackScreenProps<'PartsProductDetail'>) {
  const { colors } = useDribeeTheme();
  const { jobId: bookingId, productId } = route.params;
  const { data: booking } = useBooking(bookingId);
  const { data: product, isLoading } = useStorefrontProduct(
    {
      latitude: booking?.service_lat ?? booking?.customer_last_lat ?? null,
      longitude: booking?.service_lng ?? booking?.customer_last_lng ?? null,
      pincode: booking?.customer_last_pincode ?? null,
    },
    productId,
    { enabled: !!booking },
  );

  const variants = product?.variants ?? [];
  const defaultVariantId = useMemo(
    () => variants.find((v) => v.is_default)?.variant_id ?? variants[0]?.variant_id ?? null,
    [variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageScrollRef = useRef<ScrollViewType>(null);

  const activeVariantId = selectedVariantId ?? defaultVariantId;
  const activeVariant = variants.find((v) => v.variant_id === activeVariantId) ?? null;

  useEffect(() => {
    setActiveImageIndex(0);
    imageScrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [activeVariantId]);

  const variantImages = activeVariant?.image ? [activeVariant.image] : [];
  const displayImages = useMemo(() => {
    const productImgs = (product?.images ?? []).map((u) => resolveMediaUrl(u)).filter(Boolean) as string[];
    const varImgs = variantImages.map((u) => resolveMediaUrl(u)).filter(Boolean) as string[];
    if (varImgs.length > 0) {
      return [...varImgs, ...productImgs.filter((u) => !varImgs.includes(u))];
    }
    return productImgs;
  }, [product?.images, variantImages]);

  const inStock = activeVariant?.in_stock ?? false;
  const price = activeVariant?.price?.amount ?? null;
  const priceSource = activeVariant?.price?.source ?? null;
  const canAdd = !!product && !!activeVariant && qty > 0;
  const initials = product?.name?.slice(0, 2).toUpperCase() ?? '';

  const handleAdd = () => {
    if (!canAdd || !activeVariant || !product) return;
    navigation.navigate('PartsListBuilder', {
      jobId: bookingId,
      pendingPart: {
        productId: String(product.id),
        skuId: String(activeVariant.variant_id),
        name: product.name,
        variant: activeVariant.display_name,
        qty,
        unitPrice: activeVariant.price?.amount ?? 0,
        inStock: activeVariant.in_stock,
      },
    });
  };

  if (isLoading || !product) {
    return (
      <ScreenContainer>
        <Header title="Loading…" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.brandTeal} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image Carousel */}
          {displayImages.length > 0 ? (
            <View>
              <ScrollView
                ref={imageScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setActiveImageIndex(idx);
                }}
              >
                {displayImages.map((uri, i) => (
                  <Image
                    key={`${uri}-${i}`}
                    source={{ uri }}
                    style={{ width: SCREEN_WIDTH, height: 300, backgroundColor: colors.bgSection }}
                    resizeMode="contain"
                  />
                ))}
              </ScrollView>
              {displayImages.length > 1 && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    alignSelf: 'center',
                    flexDirection: 'row',
                    gap: 6,
                  }}
                >
                  {displayImages.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: i === activeImageIndex ? colors.brandNavy : colors.borderDivider,
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View
              style={{
                height: 300,
                backgroundColor: colors.bgSection,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 64, fontWeight: '700', color: colors.brandNavy, opacity: 0.3 }}>
                {initials}
              </Text>
            </View>
          )}

          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.bgCard,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={1.5} />
          </Pressable>

          {/* Product Info Card */}
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              marginTop: -20,
              padding: 20,
            }}
          >
            {/* Brand & Category Badges */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {product.brand_name ? (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: colors.bgSection,
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>{product.brand_name}</Text>
                </View>
              ) : null}
              {product.category_name ? (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: colors.bgSection,
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>{product.category_name}</Text>
                </View>
              ) : null}
            </View>

            {/* Product Name */}
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
              {product.name}
            </Text>

            {/* Price */}
            {price != null ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 26, fontWeight: '700', color: colors.brandNavy }}>
                  ₹{price.toLocaleString('en-IN')}
                </Text>
                {priceSource === 'warehouse' ? (
                  <Text style={{ fontSize: 11, color: colors.brandNavy, fontWeight: '600' }}>
                    Local price
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* Stock Badge */}
            <View style={{ height: 1, backgroundColor: colors.borderDivider, marginVertical: 16 }} />
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                backgroundColor: inStock ? '#05966920' : '#E11D4820',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: inStock ? '#059669' : '#E11D48' }}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>

            {/* Variant Selector */}
            {variants.length > 0 ? (
              <>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 }}>
                  Select Variant
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {variants.map((v) => {
                    const selected = v.variant_id === activeVariantId;
                    return (
                      <Pressable
                        key={v.variant_id}
                        onPress={() => setSelectedVariantId(v.variant_id)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: 8,
                          borderWidth: 1.5,
                          borderColor: selected ? colors.brandNavy : colors.borderDivider,
                          backgroundColor: selected ? colors.brandNavy : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: selected ? '#FFF' : colors.textSecondary,
                          }}
                        >
                          {v.display_name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <View
                            style={{
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 10,
                              backgroundColor: selected
                                ? 'rgba(255,255,255,0.2)'
                                : v.in_stock ? '#05966920' : '#E11D4820',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: '600',
                                color: selected ? '#FFF' : v.in_stock ? '#059669' : '#E11D48',
                              }}
                            >
                              {v.in_stock ? 'In Stock' : 'OOS'}
                            </Text>
                          </View>
                          {v.price ? (
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: selected ? '#FFF' : colors.textPrimary,
                              }}
                            >
                              ₹{v.price.amount.toLocaleString('en-IN')}
                            </Text>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {/* Quantity */}
            <View style={{ height: 1, backgroundColor: colors.borderDivider, marginVertical: 16 }} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 }}>
              Quantity
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.bgSection,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Minus size={16} strokeWidth={2} color={colors.textPrimary} />
              </Pressable>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textPrimary,
                  minWidth: 32,
                  textAlign: 'center',
                }}
              >
                {qty}
              </Text>
              <Pressable
                onPress={() => setQty((q) => q + 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.bgSection,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={16} strokeWidth={2} color={colors.textPrimary} />
              </Pressable>
            </View>

            {/* Description */}
            {product.description ? (
              <>
                <View style={{ height: 1, backgroundColor: colors.borderDivider, marginVertical: 16 }} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                  Description
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 22 }}>
                  {product.description}
                </Text>
              </>
            ) : null}

            {/* Compatible Machines */}
            {product.compatible_machines && product.compatible_machines.length > 0 ? (
              <>
                <View style={{ height: 1, backgroundColor: colors.borderDivider, marginVertical: 16 }} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                  Compatible Machines
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {product.compatible_machines.map((m) => (
                    <View
                      key={m}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: colors.bgSection,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>{m}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {/* Specifications */}
            {(product.uom || product.hsn_code || product.brand_name || product.category_name || activeVariant) ? (
              <>
                <View style={{ height: 1, backgroundColor: colors.borderDivider, marginVertical: 16 }} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                  Specifications
                </Text>
                {product.brand_name ? <SpecRow label="Brand" value={product.brand_name} colors={colors} /> : null}
                {product.category_name ? <SpecRow label="Category" value={product.category_name} colors={colors} /> : null}
                {product.uom ? <SpecRow label="Unit of Measure" value={product.uom} colors={colors} /> : null}
                {product.hsn_code ? <SpecRow label="HSN Code" value={product.hsn_code} colors={colors} /> : null}
                {activeVariant ? (
                  <SpecRow label="Variant" value={activeVariant.display_name} colors={colors} />
                ) : null}
                {activeVariant?.attribute_combination
                  ? Object.entries(activeVariant.attribute_combination).map(([key, value]) => (
                      <SpecRow key={key} label={key} value={String(value)} colors={colors} />
                    ))
                  : null}
              </>
            ) : null}
          </View>
        </ScrollView>

        {/* Sticky Add to List Bar */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 20,
            borderTopWidth: 1,
            borderTopColor: colors.borderDivider,
          }}
        >
          <Pressable onPress={handleAdd} disabled={!canAdd}>
            <View
              style={{
                height: 54,
                width: '100%',
                backgroundColor: canAdd ? '#2563EB' : '#93B4F5',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {!inStock
                  ? 'Out of Stock'
                  : price != null
                    ? `Add to List — ₹${(price * qty).toLocaleString('en-IN')}`
                    : 'Add to List'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

function SpecRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useDribeeTheme>['colors'];
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDivider,
      }}
    >
      <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary }}>{label}</Text>
      <Text
        style={{
          flex: 1.2,
          fontSize: 13,
          color: colors.textPrimary,
          fontWeight: '600',
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}
