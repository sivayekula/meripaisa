import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api, errMsg, Summary, Tx } from '../api';
import { useAuth } from '../auth';
import { rangeFor, money } from '../dates';
import { Card } from '../components/ui';
import FilterBar, { FilterState } from '../components/FilterBar';
import TxRow from '../components/TxRow';
import { colors } from '../theme';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [f, setF] = useState<FilterState>({ filter: 'today', from: new Date(), to: new Date() });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<Tx[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const cur = user?.currency;

  const load = useCallback(async () => {
    const { from, to } = rangeFor(f.filter, { from: f.from, to: f.to });
    try {
      const [s, t] = await Promise.all([
        api.get('/transactions/summary', { params: { from, to } }),
        api.get('/transactions', { params: { from, to } }),
      ]);
      setSummary(s.data); setRecent(t.data.slice(0, 8));
      setLoadError(null);
    } catch (e) { setLoadError(errMsg(e)); }
  }, [f]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const topExpense = summary?.byCategory.filter((c) => c.type === 'expense').slice(0, 4) ?? [];
  const max = Math.max(1, ...topExpense.map((c) => c.total));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        <Text style={{ color: colors.muted }}>Hello,</Text>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 14 }}>{user?.name} 👋</Text>
        <FilterBar value={f} onChange={setF} />

        <View style={{ backgroundColor: colors.primary, borderRadius: 22, padding: 20, marginTop: 14 }}>
          <Text style={{ color: '#B7E4DE' }}>Balance</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 4 }}>{money(summary?.balance ?? 0, cur)}</Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            {[['Income', summary?.income, 'arrow-down-circle'], ['Expense', summary?.expense, 'arrow-up-circle']].map(([l, v, i]: any) => (
              <View key={l} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={i} size={28} color="#fff" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ color: '#B7E4DE', fontSize: 12 }}>{l}</Text>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{money(v ?? 0, cur)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {topExpense.length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 10 }}>Top spending</Text>
            {topExpense.map((c) => (
              <View key={c.category} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text }}>{c.category}</Text>
                  <Text style={{ color: colors.muted }}>{money(c.total, cur)}</Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.expenseBg, borderRadius: 3, marginTop: 5 }}>
                  <View style={{ height: 6, width: `${(c.total / max) * 100}%`, backgroundColor: colors.expense, borderRadius: 3 }} />
                </View>
              </View>
            ))}
          </Card>
        )}

        <Card style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: '800', color: colors.text }}>Recent entries</Text>
          {loadError && <Text style={{ color: colors.expense, marginVertical: 18, textAlign: 'center' }}>{loadError}</Text>}
          {!loadError && recent.length === 0 && <Text style={{ color: colors.muted, marginVertical: 18, textAlign: 'center' }}>No entries for this period</Text>}
          {recent.map((t) => (
            <TxRow key={t.id} tx={t} currency={cur}
              onPress={() => t.editable ? navigation.navigate('TransactionForm', { type: t.type, item: t }) : undefined} />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
