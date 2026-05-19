import { View, Text, Pressable } from 'react-native';

import { cn } from '@/lib/utils';

type Option = { id: string | number; name: string };

export function ChipSelector({
  options,
  value,
  onChange,
  label,
  error,
}: {
  options: Option[];
  value: (string | number)[];
  onChange: (next: (string | number)[]) => void;
  label: string;
  error?: string;
}) {
  const toggle = (id: string | number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => {
          const selected = value.includes(o.id);
          return (
            <Pressable
              key={String(o.id)}
              onPress={() => toggle(o.id)}
              className={cn(
                'px-3 py-2 rounded-full border',
                selected ? 'bg-primary-500 border-primary-500' : 'border-gray-300',
              )}
            >
              <Text className={cn(selected ? 'text-white' : 'text-gray-700')}>{o.name}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="text-red-500 text-xs">{error}</Text> : null}
    </View>
  );
}
