import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { analyzeCapture } from '../lib/analysis';
import { saveScanRecord } from '../lib/storage/scanHistory';
import { colors, fonts, spacing } from '../constants/theme';

const STATUS_MESSAGES = [
  'Reading your scan…',
  'Checking texture & tone…',
  'Looking at hydration…',
  'Putting together your report…',
];

function makeScanId() {
  return `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ProcessingScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const result = await analyzeCapture(photoUri ?? '');
      if (cancelled) return;

      await saveScanRecord({
        id: makeScanId(),
        timestamp: new Date().toISOString(),
        scores: result.scores,
        photoUri,
        highlights: result.highlights,
        source: result.source,
        errors: result.errors,
      });
      if (cancelled) return;

      router.replace('/report');
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [photoUri, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
        {/* TODO: swap for a real loading animation (Lottie / Reanimated) once designs land. */}
        <Text style={{ fontFamily: fonts.headline, fontSize: 24, color: colors.ink, marginBottom: spacing.md }}>
          Analyzing
        </Text>
        <Text style={{ fontFamily: fonts.ui, fontSize: 14, color: colors.inkSoft }}>
          {STATUS_MESSAGES[statusIndex]}
        </Text>
      </View>
    </SafeAreaView>
  );
}
