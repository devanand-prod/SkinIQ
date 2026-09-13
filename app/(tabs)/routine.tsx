import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoutineCard } from '../../components/RoutineCard';
import { conditionLabels } from '../../constants/copy';
import { colors, fonts, radii, spacing } from '../../constants/theme';
import { generateRoutine } from '../../lib/routine/generateRoutine';
import type { RoutinePlan } from '../../lib/routine/generateRoutine';
import { getScanHistory } from '../../lib/storage/scanHistory';

export default function RoutineScreen() {
  const [plan, setPlan] = useState<RoutinePlan | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getScanHistory().then((history) => {
        const latest = history[history.length - 1];
        if (!cancelled) setPlan(latest ? generateRoutine(latest.scores) : null);
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
          Your routine
        </Text>

        {!plan ? (
          <Text style={{ fontFamily: fonts.ui, color: colors.inkSoft, fontSize: 14 }}>
            Run a scan first to get a routine tailored to your results.
          </Text>
        ) : (
          <>
            <Text style={{ fontFamily: fonts.uiMedium, color: colors.ink, fontSize: 14, marginBottom: spacing.sm }}>
              Focus areas
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
              {plan.focusAreas.map((key) => (
                <View
                  key={key}
                  style={{
                    backgroundColor: colors.claySoft,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    marginRight: spacing.sm,
                  }}
                >
                  <Text style={{ fontFamily: fonts.uiMedium, color: colors.clay, fontSize: 12 }}>
                    {conditionLabels[key]}
                  </Text>
                </View>
              ))}
            </View>

            <RoutineCard title="Morning" steps={plan.am} />
            <RoutineCard title="Evening" steps={plan.pm} />

            <View
              style={{
                backgroundColor: colors.accentSoft,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginTop: spacing.sm,
              }}
            >
              <Text style={{ fontFamily: fonts.uiMedium, color: colors.accent, fontSize: 12, marginBottom: spacing.xs }}>
                ONE SMALL HABIT
              </Text>
              <Text style={{ fontFamily: fonts.ui, color: colors.ink, fontSize: 14, lineHeight: 20 }}>
                {plan.tip}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
