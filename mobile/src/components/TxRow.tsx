import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tx } from '../api';
import { fmtDate, money } from '../dates';
import { colors } from '../theme';

export default function TxRow({ tx, onPress, currency }: { tx: Tx; onPress?: () => void; currency?: string }) {
  const exp = tx.type === 'expense';
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: exp ? colors.expenseBg : colors.incomeBg }}>
        <Ionicons name={exp ? 'arrow-up' : 'arrow-down'} size={20} color={exp ? colors.expense : colors.income} />
      </View>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={{ fontWeight: '700', color: colors.text }} numberOfLines={1}>
          {tx.category}{tx.subcategory ? ` · ${tx.subcategory}` : ''}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          {fmtDate(tx.date)}{tx.description ? ` • ${tx.description}` : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontWeight: '800', color: exp ? colors.expense : colors.income }}>
          {exp ? '-' : '+'}{money(tx.amount, currency)}
        </Text>
        {!tx.editable && <Ionicons name="lock-closed" size={12} color={colors.muted} style={{ marginTop: 3 }} />}
      </View>
    </Pressable>
  );
}
