import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth';
import { errMsg } from '../api';
import { Button, Field } from '../components/ui';
import { colors } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!identifier || !password) return Alert.alert('Enter email/phone and password');
    setBusy(true);
    try { await login(identifier, password); } catch (e) { Alert.alert('Login failed', errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="wallet" size={36} color="#fff" />
            </View>
            <Text style={{ fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 14 }}>Meripaisa</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>Track every rupee, every day</Text>
          </View>
          <Field label="Email or phone" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com or 9876543210" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••" />
          <Button title="Log in" onPress={submit} loading={busy} style={{ marginTop: 6 }} />
          <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>New here? <Text style={{ color: colors.primary, fontWeight: '700' }}>Create account</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
