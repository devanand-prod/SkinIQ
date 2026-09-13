import React from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

import { colors } from '../constants/theme';

/**
 * Purely visual positioning guide drawn over the camera preview so the user
 * can line their face up before shooting. No face detection happens here —
 * capture.tsx just overlays this and lets the user tap the shutter whenever
 * they're ready.
 */
export function FaceGuideOverlay() {
  const { width, height } = Dimensions.get('window');
  const ovalWidth = width * 0.7;
  const ovalHeight = ovalWidth * 1.3;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Svg width={width} height={height}>
        <Ellipse
          cx={width / 2}
          cy={height / 2}
          rx={ovalWidth / 2}
          ry={ovalHeight / 2}
          stroke={colors.white}
          strokeWidth={3}
          strokeDasharray="10 8"
          fill="none"
          opacity={0.85}
        />
      </Svg>
    </View>
  );
}
