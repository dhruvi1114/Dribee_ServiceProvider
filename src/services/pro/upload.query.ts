import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { baseService } from '@/services/api/baseService';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';
import { getApiErrorMessage } from '@/utils/common-functions';

type UploadIdProofAsset = { uri: string; name: string; type: string };

export function useUploadIdProof() {
  return useMutation({
    mutationFn: async (asset: UploadIdProofAsset): Promise<string> => {
      const form = new FormData();
      form.append('idProof', {
        uri: asset.uri,
        name: asset.name,
        type: asset.type,
      } as unknown as Blob);

      const response = await baseService.post<{ data: { url: string } }>(
        API_ENDPOINTS.PRO.UPLOAD_ID_PROOF,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data.data.url;
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'ID proof uploaded' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Upload failed') });
    },
  });
}
