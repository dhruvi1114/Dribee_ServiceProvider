import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ── Root Stack ──
export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
  BookingOffer: { offerId: string; bookingId: string; expiresAt: string };
};

// ── Auth Stack ──
export type AuthStackParamList = {
  Login: undefined;
  Otp: { phone: string };
  Register: undefined;
  RegistrationSubmitted: undefined;
};

// ── App Bottom Tabs ──
export type AppTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  JobsTab: NavigatorScreenParams<JobsStackParamList>;
  EarningsTab: NavigatorScreenParams<EarningsStackParamList>;
  AlertsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ── Home Stack ──
export type HomeStackParamList = {
  Home: undefined;
};

// ── Jobs Stack ──
export type JobsStackParamList = {
  JobList: undefined;
  JobDetail: { jobId: string };
  JobAccept: { jobId: string };
  OtpEntry: { jobId: string };
  Diagnosis: { jobId: string };
  PartsListBuilder: {
    jobId: string;
    // Pushed back from PartsProductDetail when a non-default variant is added.
    // Consumed via useEffect, then cleared with navigation.setParams.
    pendingPart?: {
      productId: string;
      skuId: string;
      name: string;
      variant: string;
      qty: number;
      unitPrice: number;
      inStock: boolean;
    };
  };
  PartsProductDetail: { jobId: string; productId: string };
  CatalogueSearch: { jobId: string };
  PartsApprovalStatus: { jobId: string };
  ContinuationVisit: { jobId: string };
  JobCompletion: { jobId: string };
  JobMap: { jobId: string };
};

// ── Earnings Stack ──
export type EarningsStackParamList = {
  Earnings: undefined;
  EarningDetail: { earningId: string };
  PayoutFailed: { earningId: string };
};

// ── Profile Stack ──
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  BankDetails: undefined;
  SkillsZones: undefined;
  Availability: undefined;
  MyRatings: undefined;
  JobHistory: undefined;
  HelpSupport: undefined;
};

// ── Screen prop helpers ──
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type AppTabScreenProps<T extends keyof AppTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  AppTabScreenProps<keyof AppTabParamList>
>;

export type JobsStackScreenProps<T extends keyof JobsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<JobsStackParamList, T>,
  AppTabScreenProps<keyof AppTabParamList>
>;

export type EarningsStackScreenProps<T extends keyof EarningsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<EarningsStackParamList, T>,
    AppTabScreenProps<keyof AppTabParamList>
  >;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    AppTabScreenProps<keyof AppTabParamList>
  >;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
