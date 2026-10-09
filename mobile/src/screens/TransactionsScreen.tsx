import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api, errMsg, Tx, TxType } from '../api';
import { useAuth } from '../auth';
import { money, rangeFor } from '../dates';
import FilterBar, { FilterState } from '../components/FilterBar';
import TxRow from '../components/TxRow';
import { Card } from '../components/ui';
import { colors, shadow } from '../theme';

export default function TransactionsScreen({ navigation, type }: any & { type: TxType }) {
  const { user } = useAuth();
  const isExp = type === 'expense';
  const accent = isExp ? colors.expense : colors.income;
  const [f, setF] = useState<FilterState>({ filter: 'month', from: new Date(), to: new Date() });
  const [items, setItems] = useState<Tx[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { from, to } = rangeFor(f.filter, { from: f.from, to: f.to });
    try {
      setItems((await api.get('/transactions', { params: { type, from, to } })).data);
      setLoadError(null);
    } catch (e) { setLoadError(errMsg(e)); }
  }, [f, type]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const total = items.reduce((a, b) => a + b.amount, 0);

  const remove = (t: Tx) => Alert.alert('Delete entry?', `${t.category} • ${money(t.amount, user?.currency)}`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await api.delete(`/transactions/${t.id}`); load(); } catch (e) { Alert.alert('Cannot delete', errMsg(e)); } } },
  ]);

  const open = (t?: Tx) => {
    if (t && !t.editable) return Alert.alert('Locked', 'Entries can only be edited or deleted within 5 days of creation.');
    navigation.navigate('TransactionForm', { type, item: t });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <FlatList
        data={items} keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12 }}>{isExp ? 'Expenses' : 'Income'}</Text>
            <FilterBar value={f} onChange={setF} />
            <Card style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.muted }}>Total ({items.length})</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: accent }}>{money(total, user?.currency)}</Text>
            </Card>
          </View>
        }
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: loadError ? colors.expense : colors.muted, marginTop: 40 }}>
          {loadError ?? 'Nothing here yet. Tap + to add.'}
        </Text>}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10, paddingVertical: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}><TxRow tx={item} currency={user?.currency} onPress={() => open(item)} /></View>
              {item.editable && (
                <Pressable onPress={() => remove(item)} hitSlop={10} style={{ paddingLeft: 10 }}>
                  <Ionicons name="trash-outline" size={20} color={colors.muted} />
                </Pressable>
              )}
            </View>
          </Card>
        )}
      />
      <Pressable onPress={() => open()} style={{ position: 'absolute', right: 22, bottom: 24, width: 58, height: 58, borderRadius: 29,
        backgroundColor: accent, alignItems: 'center', justifyContent: 'center', ...shadow }}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
