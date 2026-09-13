import React from 'react';
import { Text, View } from 'react-native';

import { conditionLabels } from '../constants/copy';
import { colors, fonts, tierColors } from '../constants/theme';
import type { ConditionKey } from '../types/skin';
import { tierForScore } from '../types/skin';

interface MetricBarProps {
  condition: ConditionKey;
  score: number;
}

export function MetricBar({ condition, score }: MetricBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const tier = tierForScore(clamped);
  const tierColor = tierColors[tier];

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontFamily: fonts.uiMedium, color: colors.ink, fontSize: 14 }}>
          {conditionLabels[condition]}
        </Text>
        <View
          style={{
            backgroundColor: tierColor.bg,
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontFamily: fonts.ui, color: tierColor.fg, fontSize: 11 }}>
            {Math.round(clamped)}
          </Text>
        </View>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: colors.paperDeep,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: colors.accent,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}
