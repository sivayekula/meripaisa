import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Chip } from './ui';
import { Filter, fmtDate } from '../dates';
import { colors } from '../theme';

export interface FilterState { filter: Filter; from: Date; to: Date; }
const LABELS: [Filter, string][] = [['today', 'Today'], ['month', 'This Month'], ['year', 'This Year'], ['custom', 'Custom']];

export default function FilterBar({ value, onChange }: { value: FilterState; onChange: (v: FilterState) => void }) {
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
        {LABELS.map(([k, l]) => <Chip key={k} label={l} active={value.filter === k} onPress={() => onChange({ ...value, filter: k })} />)}
      </ScrollView>
      {value.filter === 'custom' && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {(['from', 'to'] as const).map((k) => (
            <Pressable key={k} onPress={() => setPicking(k)} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase' }}>{k}</Text>
              <Text style={{ fontWeight: '600', color: colors.text }}>{fmtDate(value[k])}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {picking && (
        <DateTimePicker value={value[picking]} mode="date" maximumDate={picking === 'from' ? value.to : undefined}
          minimumDate={picking === 'to' ? value.from : undefined}
          onChange={(_, d) => { const k = picking; if (Platform.OS === 'android') setPicking(null); if (d) onChange({ ...value, [k]: d }); }} />
      )}
    </View>
  );
}
