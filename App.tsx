import './global.css';

import { StatusBar } from 'react-native';

import { AppProviders } from '@/providers/AppProviders';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <AppNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
}
