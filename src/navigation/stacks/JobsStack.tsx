import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CatalogueSearchScreen } from '@/screens/dribee/jobs/CatalogueSearchScreen';
import { ContinuationVisitScreen } from '@/screens/dribee/jobs/ContinuationVisitScreen';
import { DiagnosisScreen } from '@/screens/dribee/jobs/DiagnosisScreen';
import { JobAcceptScreen } from '@/screens/dribee/jobs/JobAcceptScreen';
import { JobCompletionScreen } from '@/screens/dribee/jobs/JobCompletionScreen';
import { JobDetailScreen } from '@/screens/dribee/jobs/JobDetailScreen';
import { JobListScreen } from '@/screens/dribee/jobs/JobListScreen';
import { JobMapScreen } from '@/screens/dribee/jobs/JobMapScreen';
import { OtpEntryScreen } from '@/screens/dribee/jobs/OtpEntryScreen';
import { PartsApprovalStatusScreen } from '@/screens/dribee/jobs/PartsApprovalStatusScreen';
import { PartsListBuilderScreen } from '@/screens/dribee/jobs/PartsListBuilderScreen';
import { PartsProductDetailScreen } from '@/screens/dribee/jobs/PartsProductDetailScreen';

import type { JobsStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<JobsStackParamList>();

export function JobsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobList" component={JobListScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen
        name="JobAccept"
        component={JobAcceptScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="OtpEntry" component={OtpEntryScreen} />
      <Stack.Screen name="Diagnosis" component={DiagnosisScreen} />
      <Stack.Screen name="PartsListBuilder" component={PartsListBuilderScreen} />
      <Stack.Screen name="PartsProductDetail" component={PartsProductDetailScreen} />
      <Stack.Screen name="CatalogueSearch" component={CatalogueSearchScreen} />
      <Stack.Screen name="PartsApprovalStatus" component={PartsApprovalStatusScreen} />
      <Stack.Screen name="ContinuationVisit" component={ContinuationVisitScreen} />
      <Stack.Screen name="JobCompletion" component={JobCompletionScreen} />
      <Stack.Screen name="JobMap" component={JobMapScreen} />
    </Stack.Navigator>
  );
}
