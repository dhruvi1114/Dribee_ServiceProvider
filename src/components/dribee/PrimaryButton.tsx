import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined';
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  height?: number;
  className?: string;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'filled',
  color,
  disabled = false,
  loading = false,
  fullWidth = true,
  height = 54,
  className,
}: PrimaryButtonProps) {
  const { colors } = useDribeeTheme();
  const c = color ?? colors.brandAmber;
  const isDisabled = disabled || loading;
  const filled = variant === 'filled';

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        height,
        width: fullWidth ? '100%' : undefined,
        backgroundColor: filled ? c : 'transparent',
        borderColor: c,
        borderWidth: filled ? 0 : 1.5,
        borderRadius: 10,
        opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
      })}
      className={`items-center justify-center px-4 ${className ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator color={filled ? colors.textInverse : c} />
      ) : (
        <Text
          style={{
            color: filled ? colors.textInverse : c,
            fontSize: 15,
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
