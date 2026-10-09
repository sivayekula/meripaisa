import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, errMsg } from '../api';
import { useAuth } from '../auth';
import { Button, Card, Chip, Field } from '../components/ui';
import { colors } from '../theme';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'INR');
  const [pw, setPw] = useState({ current: '', next: '' });
  const [busy, setBusy] = useState<'p' | 'w' | null>(null);

  const saveProfile = async () => {
    setBusy('p');
    try { setUser((await api.patch('/users/me', { name, currency })).data); Alert.alert('Saved'); }
    catch (e) { Alert.alert('Error', errMsg(e)); } finally { setBusy(null); }
  };
  const changePw = async () => {
    if (pw.next.length < 6) return Alert.alert('New password must be at least 6 characters');
    setBusy('w');
    try { await api.patch('/users/me/password', pw); setPw({ current: '', next: '' }); Alert.alert('Password changed'); }
    catch (e) { Alert.alert('Error', errMsg(e)); } finally { setBusy(null); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 10 }}>{user?.name}</Text>
          <Text style={{ color: colors.muted }}>{user?.email || user?.phone}</Text>
        </View>

        <Card>
          <Field label="Name" value={name} onChangeText={setName} />
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>Currency</Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {['INR', 'USD', 'EUR'].map((c) => <Chip key={c} label={c} active={currency === c} onPress={() => setCurrency(c)} />)}
          </View>
          <Button title="Save profile" onPress={saveProfile} loading={busy === 'p'} />
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 12 }}>Change password</Text>
          <Field label="Current password" value={pw.current} onChangeText={(v) => setPw({ ...pw, current: v })} secureTextEntry />
          <Field label="New password" value={pw.next} onChangeText={(v) => setPw({ ...pw, next: v })} secureTextEntry />
          <Button title="Update password" variant="ghost" onPress={changePw} loading={busy === 'w'} />
        </Card>

        <Button title="Log out" variant="danger" onPress={logout} style={{ marginTop: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
