import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../theme';

export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) =>
  <View style={[s.card, style]}>{children}</View>;

export const Button = ({ title, onPress, loading, variant = 'primary', style }:
  { title: string; onPress: () => void; loading?: boolean; variant?: 'primary' | 'ghost' | 'danger'; style?: ViewStyle }) => (
  <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [s.btn,
    variant === 'ghost' && s.btnGhost, variant === 'danger' && { backgroundColor: colors.expense }, pressed && { opacity: 0.85 }, style]}>
    {loading ? <ActivityIndicator color={variant === 'ghost' ? colors.primary : '#fff'} /> :
      <Text style={[s.btnText, variant === 'ghost' && { color: colors.primary }]}>{title}</Text>}
  </Pressable>
);

export const Field = ({ label, ...p }: TextInputProps & { label: string }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput placeholderTextColor={colors.muted} {...p} style={[s.input, p.style]} />
  </View>
);

export const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
    <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
  </Pressable>
);

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius, padding: 16, ...shadow },
  btn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: colors.text },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', marginRight: 8 },
});
