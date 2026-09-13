import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_NAME, disclaimer } from '../../constants/copy';
import { colors, fonts, radii, spacing } from '../../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'space-between' }}>
        <View style={{ marginTop: spacing.xxl }}>
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 40,
              color: colors.ink,
              marginBottom: spacing.sm,
            }}
          >
            {APP_NAME}
          </Text>
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 16,
              color: colors.inkSoft,
              lineHeight: 24,
            }}
          >
            Take a selfie, get a read on five key skin conditions, and a routine built around
            what you see today.
          </Text>
        </View>

        {/* TODO: hero illustration / face-map graphic goes here. */}
        <View
          style={{
            flex: 1,
            marginVertical: spacing.xl,
            borderRadius: radii.lg,
            backgroundColor: colors.paperDeep,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.ui, color: colors.inkSoft }}>
            [ hero illustration placeholder ]
          </Text>
        </View>

        <View>
          <Pressable
            onPress={() => router.push('/consent')}
            style={{
              backgroundColor: colors.accent,
              borderRadius: radii.pill,
              paddingVertical: spacing.md,
              alignItems: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ fontFamily: fonts.uiMedium, color: colors.white, fontSize: 16 }}>
              Start your scan
            </Text>
          </Pressable>
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 12,
              color: colors.inkSoft,
              textAlign: 'center',
            }}
          >
            {disclaimer.short}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
