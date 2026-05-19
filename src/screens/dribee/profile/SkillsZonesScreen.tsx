import { Check } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Header, SectionLabel } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useAppSelector } from '@/store/hooks';
import { useProMe } from '@/services/pro/pro.query';
import { useZones, useServiceTypes } from '@/services/master/master.query';

export function SkillsZonesScreen() {
  const { colors } = useDribeeTheme();
  const reduxPro = useAppSelector((s) => s.pro.pro);
  const { data: apiPro } = useProMe();
  const { data: apiZones } = useZones();
  const { data: apiServiceTypes } = useServiceTypes();

  // Translate API IDs back to display names for read-only presentation.
  const zoneNames = apiPro
    ? (apiZones ?? []).filter((z) => apiPro.zone_ids.includes(z.id)).map((z) => z.name)
    : reduxPro.zones;
  const skillNames = apiPro
    ? (apiServiceTypes ?? [])
        .filter((s) => apiPro.service_type_ids.includes(s.id))
        .map((s) => s.name)
    : reduxPro.skills;
  const machineTypeNames = apiPro ? apiPro.machine_types : reduxPro.machineTypes;

  const pro = {
    ...reduxPro,
    zones: zoneNames,
    skills: skillNames,
    machineTypes: machineTypeNames,
  };

  return (
    <ScreenContainer>
      <Header title="Skills & Zones" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View
          style={{
            backgroundColor: colors.bgSection,
            borderRadius: 10,
            padding: 12,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Your skills and zones are assigned by admin. Contact admin to update them.
          </Text>
        </View>

        <Card>
          <SectionLabel label="My Skills" marginTop={0} />
          <ChipRow values={pro.skills} bg={`${colors.brandNavy}26`} fg={colors.brandNavy} />
          <SectionLabel label="Certified Machine Types" />
          <ChipRow values={pro.machineTypes} bg={`${colors.brandTeal}26`} fg={colors.brandTeal} />
        </Card>

        <Card>
          <SectionLabel label="My Zones" marginTop={0} />
          <ChipRow values={pro.zones} bg={`${colors.brandAmber}26`} fg={colors.brandAmber} />
        </Card>

        <Card>
          <SectionLabel label="Qualified Services" marginTop={0} />
          <View style={{ marginTop: 12, gap: 10 }}>
            {pro.serviceTypes.map((s) => (
              <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Check size={16} strokeWidth={2} color={colors.brandTeal} />
                <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{s}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { colors } = useDribeeTheme();
  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    >
      {children}
    </View>
  );
}

function ChipRow({ values, bg, fg }: { values: string[]; bg: string; fg: string }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
      {values.map((v) => (
        <View
          key={v}
          style={{
            backgroundColor: bg,
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: fg, fontSize: 13, fontWeight: '600' }}>{v}</Text>
        </View>
      ))}
    </View>
  );
}
