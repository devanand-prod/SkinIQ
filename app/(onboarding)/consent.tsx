import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConsentChecklist } from '../../components/ConsentChecklist';
import { consentItems, disclaimer } from '../../constants/copy';
import { colors, fonts, radii, spacing } from '../../constants/theme';

export default function ConsentScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const allChecked = useMemo(
    () => consentItems.every((item) => checked[item.id]),
    [checked]
  );

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 28,
              color: colors.ink,
              marginBottom: spacing.sm,
              marginTop: spacing.lg,
            }}
          >
            Before we start
          </Text>
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 14,
              color: colors.inkSoft,
              lineHeight: 20,
              marginBottom: spacing.xl,
            }}
          >
            {disclaimer.long}
          </Text>

          <ConsentChecklist items={consentItems} checked={checked} onToggle={toggle} />
        </View>

        <Pressable
          disabled={!allChecked}
          onPress={() => router.push('/capture')}
          style={{
            backgroundColor: allChecked ? colors.accent : colors.paperDeep,
            borderRadius: radii.pill,
            paddingVertical: spacing.md,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: fonts.uiMedium,
              color: allChecked ? colors.white : colors.inkSoft,
              fontSize: 16,
            }}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
