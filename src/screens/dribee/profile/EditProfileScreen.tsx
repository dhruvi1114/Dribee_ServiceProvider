import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import type { ImagePickerResponse } from 'react-native-image-picker';

import { Avatar, Header, PrimaryButton, TextField } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePro } from '@/store/slices/proSlice';
import { useProMe, useUpdateOwnPro } from '@/services/pro/pro.query';

import type { ProfileStackScreenProps } from '@/navigation/types';

export function EditProfileScreen({ navigation }: ProfileStackScreenProps<'EditProfile'>) {
  const { colors } = useDribeeTheme();
  const dispatch = useAppDispatch();
  const { data: apiPro } = useProMe();
  const updateOwnProMutation = useUpdateOwnPro();
  const reduxPro = useAppSelector((s) => s.pro.pro);
  const initialName = apiPro?.name ?? reduxPro.name;
  const initialEmail = apiPro?.email ?? reduxPro.email;
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [avatar, setAvatar] = useState<string | null>(reduxPro.avatar);

  const dirty = name !== initialName || email !== initialEmail || avatar !== reduxPro.avatar;

  const onSave = () => {
    updateOwnProMutation.mutate(
      { name, email },
      {
        onSuccess: () => {
          // Avatar isn't backed by API yet — keep it in Redux for now.
          dispatch(updatePro({ name, email, avatar }));
          navigation.goBack();
        },
      },
    );
  };

  const handlePickerResult = (res: ImagePickerResponse) => {
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Could not pick image', res.errorMessage ?? res.errorCode);
      return;
    }
    const uri = res.assets?.[0]?.uri;
    if (uri) setAvatar(uri);
  };

  const onChangePhoto = () => {
    Alert.alert('Change Photo', 'Choose a source', [
      {
        text: 'Take Photo',
        onPress: () =>
          launchCamera(
            { mediaType: 'photo', quality: 0.8, saveToPhotos: true },
            handlePickerResult,
          ),
      },
      {
        text: 'Pick from Library',
        onPress: () =>
          launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
            handlePickerResult,
          ),
      },
      ...(avatar
        ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => setAvatar(null) }]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <ScreenContainer>
      <Header
        title="Edit Profile"
        rightElement={
          <Pressable disabled={!dirty} onPress={onSave} style={{ padding: 8 }}>
            <Text
              style={{
                color: dirty ? colors.brandBlue : colors.textTertiary,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Save
            </Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Avatar name={name} uri={avatar} size={84} fontSize={28} />
          <Pressable onPress={onChangePhoto} hitSlop={8}>
            <Text style={{ color: colors.brandBlue, fontSize: 13, fontWeight: '500' }}>
              Change Photo
            </Text>
          </Pressable>
        </View>

        <TextField label="Full Name" value={name} onChangeText={setName} />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
          Phone number cannot be changed here. Contact admin.
        </Text>

        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            label="Save Changes"
            onPress={onSave}
            disabled={!dirty || updateOwnProMutation.isPending}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
