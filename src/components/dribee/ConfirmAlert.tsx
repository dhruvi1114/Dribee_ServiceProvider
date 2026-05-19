import { Modal, Pressable, Text, View } from 'react-native';

import { useDribeeTheme } from '@/hooks/useDribeeTheme';

interface ConfirmAlertProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmAlert({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmAlertProps) {
  const { colors } = useDribeeTheme();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 16,
            width: '100%',
            maxWidth: 360,
            overflow: 'hidden',
          }}
        >
          {/* Header stripe */}
          <View
            style={{
              backgroundColor: destructive ? '#E11D48' : colors.brandNavy,
              paddingVertical: 16,
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>{title}</Text>
          </View>

          {/* Body */}
          <View style={{ padding: 20 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21 }}>
              {message}
            </Text>
          </View>

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: colors.borderDivider ?? '#E5E7EB',
            }}
          >
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 14,
                alignItems: 'center',
                borderRightWidth: 1,
                borderRightColor: colors.borderDivider ?? '#E5E7EB',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600' }}>
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  color: destructive ? '#E11D48' : colors.brandNavy,
                  fontSize: 14,
                  fontWeight: '700',
                }}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
