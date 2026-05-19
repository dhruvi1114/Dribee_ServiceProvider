import { AlertTriangle, Bell, Briefcase, Wallet, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';

import { EmptyState } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { mockNotifications } from '@/constants/mockData';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';

import type { AppNotification, NotificationType } from '@/types/dribee';

type Filter = 'all' | NotificationType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'job', label: 'Jobs' },
  { key: 'payment', label: 'Payments' },
  { key: 'alert', label: 'Alerts' },
];

function typeColor(type: NotificationType, colors: ReturnType<typeof useDribeeTheme>['colors']) {
  switch (type) {
    case 'job':
      return colors.brandNavy;
    case 'payment':
      return colors.brandTeal;
    case 'alert':
      return colors.brandAmber;
    case 'failure':
      return colors.statusRejected;
  }
}

function typeIcon(type: NotificationType) {
  switch (type) {
    case 'job':
      return Briefcase;
    case 'payment':
      return Wallet;
    case 'alert':
      return Bell;
    case 'failure':
      return AlertTriangle;
  }
}

export function NotificationsScreen() {
  const { colors } = useDribeeTheme();
  const [items, setItems] = useState<AppNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? items
        : items.filter((n) =>
            filter === 'alert' ? n.type === 'alert' || n.type === 'failure' : n.type === filter,
          ),
    [items, filter],
  );

  const sections = useMemo(() => {
    const today = filtered.filter((n) => /^[0-9]+m ago|^[0-9]+h ago/.test(n.time));
    const yesterday = filtered.filter((n) => n.time === 'Yesterday');
    const earlier = filtered.filter(
      (n) => !today.includes(n) && !yesterday.includes(n),
    );
    return [
      { title: 'Today', data: today },
      { title: 'Yesterday', data: yesterday },
      { title: 'Earlier', data: earlier },
    ].filter((s) => s.data.length > 0);
  }, [filtered]);

  const dismiss = (id: string) => setItems((arr) => arr.filter((n) => n.id !== id));
  const markAllRead = () => setItems((arr) => arr.map((n) => ({ ...n, read: true })));

  return (
    <ScreenContainer>
      <View
        style={{
          backgroundColor: colors.bgHeader,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderDivider,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
          Notifications
        </Text>
        <Pressable onPress={markAllRead}>
          <Text style={{ color: colors.brandBlue, fontSize: 13, fontWeight: '500' }}>
            Mark All Read
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                paddingHorizontal: 14,
                height: 32,
                borderRadius: 20,
                backgroundColor: active ? colors.brandNavy : colors.bgSection,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: active ? '#FFF' : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderSectionHeader={({ section }) => (
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: 12,
              fontWeight: '600',
              letterSpacing: 1,
              textTransform: 'uppercase',
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 4,
            }}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const color = typeColor(item.type, colors);
          const Icon = typeIcon(item.type);
          return (
            <View
              style={{
                backgroundColor: item.read ? colors.bgCard : colors.bgSection,
                borderLeftWidth: item.read ? 0 : 3,
                borderLeftColor: color,
                marginHorizontal: 16,
                marginVertical: 4,
                borderRadius: 12,
                padding: 14,
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={18} strokeWidth={1.5} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
                  {item.title}
                </Text>
                <Text
                  style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}
                  numberOfLines={2}
                >
                  {item.message}
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 4 }}>
                  {item.time}
                </Text>
              </View>
              <Pressable onPress={() => dismiss(item.id)} hitSlop={8}>
                <X size={16} strokeWidth={1.5} color={colors.textTertiary} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState title="No notifications" subtitle="You're all caught up." />
        }
      />
    </ScreenContainer>
  );
}
