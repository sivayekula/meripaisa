import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000', timeout: 15000 });
const KEY = 'meripaisa_token';
let token: string | null = null;

api.interceptors.request.use((c) => { if (token) c.headers.Authorization = `Bearer ${token}`; return c; });

export const tokenStore = {
  async load() { token = await SecureStore.getItemAsync(KEY); return token; },
  async set(t: string) { token = t; await SecureStore.setItemAsync(KEY, t); },
  async clear() { token = null; await SecureStore.deleteItemAsync(KEY); },
};

export const errMsg = (e: any) => {
  const m = e?.response?.data?.message;
  return Array.isArray(m) ? m.join('\n') : m || (e?.message === 'Network Error' ? 'Cannot reach server' : 'Something went wrong');
};

export type TxType = 'expense' | 'income';
export interface Tx { id: string; type: TxType; category: string; subcategory?: string; amount: number; date: string;
  description: string; editable: boolean; editableUntil: string; }
export interface Category { _id: string; type: TxType; name: string; subcategories: string[]; }
export interface Summary { expense: number; income: number; balance: number;
  byCategory: { type: TxType; category: string; total: number }[]; }
