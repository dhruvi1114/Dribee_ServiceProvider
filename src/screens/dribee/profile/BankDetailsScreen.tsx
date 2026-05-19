import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Header, InfoCard, PrimaryButton, TextField } from '@/components/dribee';
import { ScreenContainer } from '@/components/dribee/ScreenContainer';
import { useDribeeTheme } from '@/hooks/useDribeeTheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateBankDetails } from '@/store/slices/proSlice';
import { useProMe, useUpdateOwnBankAccount } from '@/services/pro/pro.query';

import type { ProfileStackScreenProps } from '@/navigation/types';

export function BankDetailsScreen({ navigation }: ProfileStackScreenProps<'BankDetails'>) {
  const { colors } = useDribeeTheme();
  const dispatch = useAppDispatch();
  const { data: pro } = useProMe();
  const updateBankMutation = useUpdateOwnBankAccount();
  const reduxBank = useAppSelector((s) => s.pro.pro.bankDetails);
  const bank = pro?.bank_account
    ? {
        accountHolder:
          pro.bank_account.accountHolder ??
          pro.bank_account.holderName ??
          pro.name ??
          reduxBank.accountHolder,
        accountNumber: pro.bank_account.accountNumber ?? reduxBank.accountNumber,
        ifsc: pro.bank_account.ifsc ?? reduxBank.ifsc,
        bankName: pro.bank_account.bankName ?? reduxBank.bankName,
      }
    : reduxBank;
  const [editing, setEditing] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [holder, setHolder] = useState(bank.accountHolder);
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState(bank.ifsc);
  const [bankName, setBankName] = useState(bank.bankName);

  useEffect(() => {
    setHolder(bank.accountHolder);
    setIfsc(bank.ifsc);
    setBankName(bank.bankName);
  }, [bank.accountHolder, bank.ifsc, bank.bankName]);

  const fullAccount = bank.accountNumber ?? '';
  const last4 = fullAccount.replace(/\D/g, '').slice(-4);
  const masked = last4 ? `••••••••${last4}` : fullAccount;

  const onSave = () => {
    if (!account) return;
    updateBankMutation.mutate(
      {
        accountHolder: holder,
        accountNumber: account,
        ifsc: ifsc.toUpperCase(),
        bankName,
      },
      {
        onSuccess: () => {
          dispatch(
            updateBankDetails({
              accountHolder: holder,
              accountNumber: `••••••••${account.slice(-4)}`,
              ifsc: ifsc.toUpperCase(),
              bankName,
            }),
          );
          setEditing(false);
          navigation.goBack();
        },
      },
    );
  };

  const rows = [
    { label: 'Account Holder Name', value: bank.accountHolder },
    {
      label: 'Account Number',
      value: showFull ? fullAccount : masked,
      toggle: () => setShowFull((v) => !v),
      toggleLabel: showFull ? 'Hide' : 'Show',
    },
    { label: 'IFSC Code', value: bank.ifsc },
    { label: 'Bank Name', value: bank.bankName },
  ];

  return (
    <ScreenContainer>
      <Header
        title="Bank Details"
        rightElement={
          <Pressable onPress={() => setEditing((e) => !e)} style={{ padding: 8 }}>
            <Text style={{ color: colors.brandBlue, fontSize: 14, fontWeight: '600' }}>
              {editing ? 'Cancel' : 'Edit'}
            </Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <InfoCard tone="amber">
          Your bank details are used for payout transfers. Keep them accurate to avoid payout
          failures.
        </InfoCard>

        {!editing ? (
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
            {rows.map((row, idx) => (
              <View
                key={row.label}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: idx === rows.length - 1 ? 0 : 1,
                  borderBottomColor: colors.borderDivider,
                  gap: 4,
                }}
              >
                <Text
                  style={{ color: colors.textTertiary, fontSize: 11, textTransform: 'uppercase' }}
                >
                  {row.label}
                </Text>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
                    {row.value}
                  </Text>
                  {row.toggle ? (
                    <Pressable onPress={row.toggle}>
                      <Text style={{ color: colors.brandBlue, fontSize: 12 }}>
                        {row.toggleLabel}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <TextField label="Account Holder Name" value={holder} onChangeText={setHolder} />
            <TextField
              label="Account Number"
              value={account}
              onChangeText={(t) => setAccount(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Enter new account number"
            />
            <TextField
              label="IFSC Code"
              value={ifsc}
              onChangeText={(t) => setIfsc(t.toUpperCase().slice(0, 11))}
              autoCapitalize="characters"
            />
            <TextField label="Bank Name" value={bankName} onChangeText={setBankName} />
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Changes to bank details will be reviewed before next payout.
            </Text>
            <PrimaryButton
              label="Save Bank Details"
              onPress={onSave}
              disabled={!account || updateBankMutation.isPending}
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
