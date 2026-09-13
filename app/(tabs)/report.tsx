import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetricBar } from '../../components/MetricBar';
import { ScoreRing } from '../../components/ScoreRing';
import { getScanHistory } from '../../lib/storage/scanHistory';
import { colors, fonts, spacing } from '../../constants/theme';
import { CONDITION_KEYS } from '../../types/skin';
import type { ScanRecord } from '../../types/skin';

export default function ReportScreen() {
  const [latest, setLatest] = useState<ScanRecord | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getScanHistory().then((history) => {
        if (!cancelled) setLatest(history[history.length - 1] ?? null);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={{ fontFamily: fonts.headline, fontSize: 28, color: colors.ink, marginBottom: spacing.lg }}>
          Your report
        </Text>

        {!latest ? (
          <View style={{ alignItems: 'center', marginTop: spacing.xxl }}>
            <Text style={{ fontFamily: fonts.ui, color: colors.inkSoft, fontSize: 14 }}>
              No scans yet. Head to the Scan tab to run your first analysis.
            </Text>
          </View>
        ) : (
          <>
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <ScoreRing score={latest.scores.overall} />
            </View>
            <View>
              {CONDITION_KEYS.map((key) => (
                <MetricBar key={key} condition={key} score={latest.scores[key]} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
