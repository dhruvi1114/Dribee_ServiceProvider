import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  prefix?: string;
  error?: string;
}

export function TextField({ label, prefix, error, style, ...rest }: TextFieldProps) {
  const { colors } = useDribeeTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.statusRejected
    : focused
      ? colors.borderFocus
      : colors.borderInput;

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 56,
          backgroundColor: colors.bgInput,
          borderColor,
          borderWidth: 1.5,
          borderRadius: 10,
          paddingHorizontal: 14,
        }}
      >
        {prefix ? (
          <>
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
              {prefix}
            </Text>
            <View
              style={{
                width: 1,
                height: 24,
                backgroundColor: colors.borderInput,
                marginHorizontal: 12,
              }}
            />
          </>
        ) : null}
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.textTertiary}
          style={[{ flex: 1, color: colors.textPrimary, fontSize: 14 }, style]}
        />
      </View>
      {error ? (
        <Text style={{ color: colors.statusRejected, fontSize: 12 }}>{error}</Text>
      ) : null}
    </View>
  );
}
