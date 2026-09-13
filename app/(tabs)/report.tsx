import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetricBar } from '../../components/MetricBar';
import { PhotoHighlightOverlay } from '../../components/PhotoHighlightOverlay';
import { ScoreRing } from '../../components/ScoreRing';
import { analysisSourceCopy } from '../../constants/copy';
import { colors, fonts, radii, spacing } from '../../constants/theme';
import { getScanHistory } from '../../lib/storage/scanHistory';
import { CONDITION_KEYS } from '../../types/skin';
import type { ScanRecord } from '../../types/skin';

export default function ReportScreen() {
  const [latest, setLatest] = useState<ScanRecord | null>(null);
  const { width: screenWidth } = useWindowDimensions();

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

  const photoWidth = screenWidth - spacing.lg * 2;
  const photoHeight = photoWidth * (4 / 3);
  const bannerText = latest?.source ? analysisSourceCopy[latest.source] : null;

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
            {bannerText && (
              <View
                style={{
                  backgroundColor: colors.claySoft,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                }}
              >
                <Text style={{ fontFamily: fonts.uiMedium, color: colors.clay, fontSize: 13, lineHeight: 18 }}>
                  {bannerText}
                </Text>
                {/* TODO: temporary diagnostic while wiring up the model pipeline —
                    remove once on-device inference is confirmed reliable. */}
                {latest.errors?.photoDecode && (
                  <Text style={{ fontFamily: fonts.ui, color: colors.clay, fontSize: 11, marginTop: 8 }}>
                    photo decode: {latest.errors.photoDecode}
                  </Text>
                )}
                {latest.errors?.acne && (
                  <Text style={{ fontFamily: fonts.ui, color: colors.clay, fontSize: 11, marginTop: 4 }}>
                    acne detector: {latest.errors.acne}
                  </Text>
                )}
              </View>
            )}

            {latest.photoUri && (
              <View
                style={{
                  width: photoWidth,
                  height: photoHeight,
                  borderRadius: radii.lg,
                  overflow: 'hidden',
                  marginBottom: spacing.xl,
                  backgroundColor: colors.paperDeep,
                }}
              >
                <Image
                  source={{ uri: latest.photoUri }}
                  style={{ width: photoWidth, height: photoHeight }}
                  resizeMode="cover"
                />
                <PhotoHighlightOverlay highlights={latest.highlights} width={photoWidth} height={photoHeight} />
              </View>
            )}

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
