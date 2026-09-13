import React from 'react';
import { Text } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { colors, fonts } from '../constants/theme';
import type { ScanRecord } from '../types/skin';

interface TrendChartProps {
  history: ScanRecord[];
  height?: number;
}

/**
 * Minimal hand-rolled bar chart (react-native-svg, no charting library) of
 * overall score across scan history — one bar per scan, oldest to newest.
 */
export function TrendChart({ history, height = 140 }: TrendChartProps) {
  if (history.length === 0) {
    return (
      <Text style={{ fontFamily: fonts.ui, color: colors.inkSoft, fontSize: 14 }}>
        No scans yet.
      </Text>
    );
  }

  const barWidth = 24;
  const gap = 12;
  const width = history.length * (barWidth + gap);

  return (
    <Svg width={width} height={height}>
      {history.map((record, i) => {
        const clamped = Math.max(0, Math.min(100, record.scores.overall));
        const barHeight = (clamped / 100) * (height - 20);
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <Rect
            key={record.id}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={6}
            fill={colors.accent}
          />
        );
      })}
    </Svg>
  );
}
