import React, { useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface Props { visible: boolean; title: string; options: string[]; onSelect(v: string): void; onClose(): void;
  onAdd?(name: string): Promise<void> | void; }

export default function PickerModal({ visible, title, options, onSelect, onClose, onAdd }: Props) {
  const [q, setQ] = useState('');
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  const canAdd = !!onAdd && q.trim().length >= 2 && !options.some((o) => o.toLowerCase() === q.trim().toLowerCase());
  const close = () => { setQ(''); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <Text style={{ flex: 1, fontSize: 20, fontWeight: '800', color: colors.text }}>{title}</Text>
          <Pressable onPress={close} hitSlop={10}><Ionicons name="close" size={26} color={colors.text} /></Pressable>
        </View>
        <TextInput value={q} onChangeText={setQ} placeholder="Search or type a new name" placeholderTextColor={colors.muted}
          style={{ marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 13, fontSize: 16, borderWidth: 1, borderColor: colors.border }} />
        {canAdd && (
          <Pressable onPress={async () => { await onAdd!(q.trim()); setQ(''); }}
            style={{ margin: 16, marginBottom: 0, padding: 14, borderRadius: 12, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>Add "{q.trim()}"</Text>
          </Pressable>
        )}
        <FlatList data={filtered} keyExtractor={(i) => i} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={{ color: colors.muted, textAlign: 'center', marginTop: 30 }}>No matches</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => { setQ(''); onSelect(item); }}
              style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 16, color: colors.text }}>{item}</Text>
            </Pressable>
          )} />
      </SafeAreaView>
    </Modal>
  );
}
