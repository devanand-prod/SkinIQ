import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ScanRecord } from '../../types/skin';

const STORAGE_KEY = '@skiniq/scan_history';

export async function getScanHistory(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScanRecord[]) : [];
  } catch (err) {
    console.warn('[scanHistory] failed to read scan history', err);
    return [];
  }
}

export async function saveScanRecord(record: ScanRecord): Promise<ScanRecord[]> {
  const history = await getScanHistory();
  const next = [...history, record];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function clearScanHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
