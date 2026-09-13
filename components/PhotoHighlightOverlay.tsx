import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { colors } from '../constants/theme';
import type { Highlight } from '../types/skin';

interface PhotoHighlightOverlayProps {
  /** Undefined = detector didn't run (no data yet) — renders nothing.
   * Empty array = it ran and found zero boxes — also renders nothing, but
   * that's a real "clear" result rather than an absence of data; callers
   * (e.g. report.tsx) should distinguish the two in their own UI, this
   * component just draws whatever it's given. */
  highlights: Highlight[] | undefined;
  width: number;
  height: number;
}

export function PhotoHighlightOverlay({ highlights, width, height }: PhotoHighlightOverlayProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={width} height={height}>
        {highlights.map((box, i) => (
          <Rect
            key={i}
            x={box.x * width}
            y={box.y * height}
            width={box.width * width}
            height={box.height * height}
            stroke={colors.clay}
            strokeWidth={2}
            fill="none"
            rx={4}
          />
        ))}
      </Svg>
    </View>
  );
}
