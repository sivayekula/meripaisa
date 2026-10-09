import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { api, Category, errMsg, Tx, TxType } from '../api';
import { fmtDate } from '../dates';
import { Button, Field } from '../components/ui';
import PickerModal from '../components/PickerModal';
import { colors } from '../theme';

const Select = ({ label, value, placeholder, onPress, disabled }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
    <Pressable onPress={onPress} disabled={disabled} style={{ backgroundColor: disabled ? '#EEF2F1' : '#fff', borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ flex: 1, fontSize: 16, color: value ? colors.text : colors.muted }}>{value || placeholder}</Text>
      <Ionicons name="chevron-down" size={18} color={colors.muted} />
    </Pressable>
  </View>
);

export default function TransactionFormScreen({ navigation, route }: any) {
  const type: TxType = route.params.type;
  const item: Tx | undefined = route.params.item;
  const accent = type === 'expense' ? colors.expense : colors.income;

  const [cats, setCats] = useState<Category[]>([]);
  const [category, setCategory] = useState(item?.category ?? '');
  const [subcategory, setSubcategory] = useState(item?.subcategory ?? '');
  const [amount, setAmount] = useState(item ? String(item.amount) : '');
  const [date, setDate] = useState(item ? new Date(item.date) : new Date());
  const [description, setDescription] = useState(item?.description ?? '');
  const [picker, setPicker] = useState<'cat' | 'sub' | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadCats = async () => setCats((await api.get('/categories', { params: { type } })).data);
  useEffect(() => { loadCats().catch(() => {}); }, []);
  const current = cats.find((c) => c.name === category);

  const addCategory = async (name: string) => {
    try { await api.post('/categories', { type, name }); await loadCats(); setCategory(name); setSubcategory(''); setPicker(null); }
    catch (e) { Alert.alert('Could not add', errMsg(e)); }
  };
  const addSub = async (name: string) => {
    if (!current) return;
    try { await api.post(`/categories/${current._id}/subcategories`, { name }); await loadCats(); setSubcategory(name); setPicker(null); }
    catch (e) { Alert.alert('Could not add', errMsg(e)); }
  };

  const save = async () => {
    const amt = parseFloat(amount);
    if (!category) return Alert.alert('Select a category');
    if (!amt || amt <= 0) return Alert.alert('Enter a valid amount');
    setBusy(true);
    const body = { category, subcategory: subcategory || undefined, amount: amt, date: date.toISOString(), description: description.trim() };
    try {
      if (item) await api.patch(`/transactions/${item.id}`, body);
      else await api.post('/transactions', { ...body, type });
      navigation.goBack();
    } catch (e) { Alert.alert('Could not save', errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Ionicons name="close" size={26} color={colors.text} /></Pressable>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.text, marginRight: 26 }}>
            {item ? 'Edit' : 'Add'} {type}
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00"
            style={{ fontSize: 28, fontWeight: '800', color: accent }} />
          <Select label="Category" value={category} placeholder="Select category" onPress={() => setPicker('cat')} />
          <Select label="Subcategory" value={subcategory} placeholder={category ? 'Select subcategory' : 'Pick a category first'}
            disabled={!category} onPress={() => setPicker('sub')} />
          <Select label="Date" value={fmtDate(date)} onPress={() => setShowDate(true)} />
          {showDate && <DateTimePicker value={date} mode="date" maximumDate={new Date()}
            onChange={(_, d) => { if (Platform.OS === 'android') setShowDate(false); if (d) setDate(d); }} />}
          <Field label="Description" value={description} onChangeText={setDescription} placeholder="Optional note" multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
          <Button title={item ? 'Update' : 'Save'} onPress={save} loading={busy} style={{ backgroundColor: accent, marginTop: 6 }} />
          {item && <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 12, fontSize: 12 }}>
            Editable until {fmtDate(item.editableUntil)}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal visible={picker === 'cat'} title="Category" options={cats.map((c) => c.name)} onClose={() => setPicker(null)}
        onSelect={(v) => { if (v !== category) setSubcategory(''); setCategory(v); setPicker(null); }} onAdd={addCategory} />
      <PickerModal visible={picker === 'sub'} title={`${category} › Subcategory`} options={current?.subcategories ?? []} onClose={() => setPicker(null)}
        onSelect={(v) => { setSubcategory(v); setPicker(null); }} onAdd={addSub} />
    </SafeAreaView>
  );
}
