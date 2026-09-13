import React from 'react';
import { Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '../constants/theme';

interface RoutineCardProps {
  title: string;
  steps: string[];
}

export function RoutineCard({ title, steps }: RoutineCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.line,
        marginBottom: spacing.md,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.headline,
          fontSize: 20,
          color: colors.ink,
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {steps.map((step, i) => (
        <View key={step} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Text style={{ fontFamily: fonts.uiMedium, color: colors.accent, fontSize: 12 }}>
              {i + 1}
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.ui, color: colors.inkSoft, fontSize: 14, flex: 1 }}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
}
