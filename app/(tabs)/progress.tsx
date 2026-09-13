import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrendChart } from '../../components/TrendChart';
import { conditionLabels } from '../../constants/copy';
import { colors, fonts, radii, spacing } from '../../constants/theme';
import { getScanHistory } from '../../lib/storage/scanHistory';
import { CONDITION_KEYS } from '../../types/skin';
import type { ScanRecord } from '../../types/skin';

export default function ProgressScreen() {
  const [history, setHistory] = useState<ScanRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getScanHistory().then((h) => {
        if (!cancelled) setHistory(h);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const first = history[0];
  const latest = history[history.length - 1];
  const hasEnoughForTrend = history.length > 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={{ fontFamily: fonts.headline, fontSize: 28, color: colors.ink, marginBottom: spacing.lg }}>
          Your progress
        </Text>

        {history.length === 0 && (
          <Text style={{ fontFamily: fonts.ui, color: colors.inkSoft, fontSize: 14 }}>
            No scans yet. Progress tracking kicks in after your first scan.
          </Text>
        )}

        {history.length === 1 && (
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: radii.lg,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Text style={{ fontFamily: fonts.uiMedium, color: colors.ink, fontSize: 14, marginBottom: spacing.xs }}>
              One scan so far
            </Text>
            <Text style={{ fontFamily: fonts.ui, color: colors.inkSoft, fontSize: 13, lineHeight: 18 }}>
              Come back after your next scan to see trends and per-condition changes over time.
            </Text>
          </View>
        )}

        {hasEnoughForTrend && first && latest && (
          <>
            <Text style={{ fontFamily: fonts.uiMedium, color: colors.ink, fontSize: 14, marginBottom: spacing.sm }}>
              Overall score over time
            </Text>
            <View style={{ marginBottom: spacing.xl }}>
              <TrendChart history={history} />
            </View>

            <Text style={{ fontFamily: fonts.uiMedium, color: colors.ink, fontSize: 14, marginBottom: spacing.sm }}>
              Change since your first scan
            </Text>
            {CONDITION_KEYS.map((key) => {
              const delta = latest.scores[key] - first.scores[key];
              const sign = delta > 0 ? '+' : '';
              const deltaColor = delta > 0 ? colors.accent : delta < 0 ? colors.clay : colors.inkSoft;
              return (
                <View
                  key={key}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: spacing.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.line,
                  }}
                >
                  <Text style={{ fontFamily: fonts.ui, color: colors.ink, fontSize: 14 }}>
                    {conditionLabels[key]}
                  </Text>
                  <Text style={{ fontFamily: fonts.uiMedium, color: deltaColor, fontSize: 14 }}>
                    {sign}
                    {delta}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
