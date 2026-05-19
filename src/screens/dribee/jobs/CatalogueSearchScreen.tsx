import { Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { EmptyState, Header, StatusChip } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { mockProducts } from '@/constants/mockData';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';

import type { JobsStackScreenProps } from '@/navigation/types';

const RECENT_SEARCHES = ['Compressor', 'Drum Belt', 'Capacitor'];

export function CatalogueSearchScreen({ navigation }: JobsStackScreenProps<'CatalogueSearch'>) {
  const { colors } = useDribeeTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.variant.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <ScreenContainer>
      <Header title="Search Parts" />

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
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
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search parts…"
            placeholderTextColor={colors.textTertiary}
            autoFocus
            style={{ flex: 1, color: colors.textPrimary, fontSize: 14 }}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}>
              <X size={16} strokeWidth={1.5} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!query ? (
        <View style={{ padding: 16 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Recent Searches
          </Text>
          {RECENT_SEARCHES.map((r) => (
            <Pressable
              key={r}
              onPress={() => setQuery(r)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderDivider,
              }}
            >
              <Search size={16} strokeWidth={1.5} color={colors.textTertiary} />
              <Text style={{ color: colors.textPrimary, fontSize: 14, flex: 1 }}>{r}</Text>
            </Pressable>
          ))}
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          title={`No parts found for "${query}"`}
          subtitle="Contact admin to add this part to the catalogue."
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderDivider,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: colors.bgSection,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.variant}</Text>
              </View>
              <StatusChip
                label={item.available ? 'In Stock' : 'Out of Stock'}
                color={item.available ? colors.statusAvailable : colors.statusOutOfStock}
                size="sm"
              />
            </Pressable>
          )}
        />
      )}
    </ScreenContainer>
  );
}
