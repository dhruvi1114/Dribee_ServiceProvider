import { useQuery } from '@tanstack/react-query';

import { apiService } from '@/services/api/apiService';
import { queryKeys } from '@/services/react-query/queryKeys';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';

export interface StorefrontPriceApi {
  amount: number;
  source: 'warehouse' | 'base';
  gst_rate: number | null;
  gst_amount: number | null;
  price_with_gst: number | null;
}

export interface StorefrontProductListItemApi {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  brand_id: number | null;
  brand_name: string | null;
  images: string[];
  default_variant: {
    variant_id: number;
    display_name: string;
    attribute_combination: Record<string, string> | null;
    price: StorefrontPriceApi | null;
    in_stock: boolean;
    image: string | null;
  } | null;
}

export interface StorefrontVariantDetailApi {
  variant_id: number;
  display_name: string;
  attribute_combination: Record<string, string> | null;
  is_default: boolean;
  is_active_here: boolean;
  in_stock: boolean;
  price: StorefrontPriceApi | null;
  image: string | null;
}

export interface StorefrontProductDetailApi {
  id: number;
  name: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
  brand_id: number | null;
  brand_name: string | null;
  hsn_code: string | null;
  uom: string | null;
  compatible_machines: string[];
  images: string[];
  variants: StorefrontVariantDetailApi[];
}

interface ListEnvelope {
  items: StorefrontProductListItemApi[];
  warehouse_resolution: unknown;
}

interface DetailEnvelope {
  product: StorefrontProductDetailApi;
  warehouse_resolution: unknown;
}

interface GeoParams {
  latitude?: number | null;
  longitude?: number | null;
  pincode?: string | null;
}

const buildGeoKey = (geo: GeoParams): string =>
  `${geo.latitude ?? ''}_${geo.longitude ?? ''}_${geo.pincode ?? ''}`;

const stripNulls = (params: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null && v !== undefined));

export function useStorefrontProducts(
  geo: GeoParams,
  filters?: { category_id?: number; search?: string; isActive?: boolean },
  options?: { enabled?: boolean },
) {
  const params = stripNulls({
    latitude: geo.latitude,
    longitude: geo.longitude,
    pincode: geo.pincode,
    isActive: filters?.isActive ?? true,
    category_id: filters?.category_id,
    search: filters?.search,
  });
  // Caller can pass enabled:true to fire once booking is confirmed loaded
  // (even if the booking has no geo data — backend returns base-price products).
  const isEnabled = options?.enabled ?? (geo.latitude != null || geo.longitude != null || !!geo.pincode);
  return useQuery({
    queryKey: queryKeys.storefront.list(buildGeoKey(geo), params),
    queryFn: () =>
      apiService.get<ListEnvelope>(API_ENDPOINTS.STOREFRONT.PRODUCTS, { params }),
    enabled: isEnabled,
    staleTime: 60 * 1000,
  });
}

export function useStorefrontProduct(
  geo: GeoParams,
  productId: string | number | undefined,
  options?: { enabled?: boolean },
) {
  const params = stripNulls({
    latitude: geo.latitude,
    longitude: geo.longitude,
    pincode: geo.pincode,
  });
  const hasGeo = geo.latitude != null || geo.longitude != null || !!geo.pincode;
  const isEnabled = options?.enabled !== undefined
    ? options.enabled && !!productId
    : !!productId && hasGeo;
  return useQuery({
    queryKey: queryKeys.storefront.detail(buildGeoKey(geo), productId ?? ''),
    queryFn: async () => {
      const resp = await apiService.get<DetailEnvelope>(
        API_ENDPOINTS.STOREFRONT.PRODUCT_DETAIL(productId!),
        { params },
      );
      return resp.product;
    },
    enabled: isEnabled,
    staleTime: 60 * 1000,
  });
}
