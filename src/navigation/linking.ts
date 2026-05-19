import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['dribeepro://', 'https://pro.dribee.com'],
  config: {
    screens: {
      Splash: 'splash',
      Auth: {
        screens: {
          Login: 'login',
          Otp: 'otp',
          Register: 'register',
          RegistrationSubmitted: 'registration-submitted',
        },
      },
      App: {
        screens: {
          HomeTab: { screens: { Home: 'home' } },
          JobsTab: {
            screens: {
              JobList: 'jobs',
              JobDetail: 'jobs/:jobId',
            },
          },
          EarningsTab: { screens: { Earnings: 'earnings' } },
          AlertsTab: 'alerts',
          ProfileTab: { screens: { Profile: 'profile' } },
        },
      },
    },
  },
};
