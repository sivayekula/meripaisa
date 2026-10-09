import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { errMsg } from '../api';
import { Button, Field } from '../components/ui';
import { colors } from '../theme';

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (v: string) => setF({ ...f, [k]: v });

  const submit = async () => {
    if (!f.name.trim()) return Alert.alert('Enter your name');
    if (!f.email.trim() && !f.phone.trim()) return Alert.alert('Enter an email or a phone number');
    if (f.password.length < 6) return Alert.alert('Password must be at least 6 characters');
    if (f.password !== f.confirm) return Alert.alert('Passwords do not match');
    setBusy(true);
    try {
      await signup({ name: f.name.trim(), email: f.email.trim() || undefined, phone: f.phone.trim() || undefined, password: f.password });
    } catch (e) { Alert.alert('Signup failed', errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4 }}>Create account</Text>
          <Text style={{ color: colors.muted, marginBottom: 24 }}>Use an email, a phone number, or both</Text>
          <Field label="Full name" value={f.name} onChangeText={set('name')} />
          <Field label="Email (optional)" value={f.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
          <Field label="Phone (optional)" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
          <Field label="Password" value={f.password} onChangeText={set('password')} secureTextEntry />
          <Field label="Confirm password" value={f.confirm} onChangeText={set('confirm')} secureTextEntry />
          <Button title="Sign up" onPress={submit} loading={busy} />
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>Have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Log in</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
