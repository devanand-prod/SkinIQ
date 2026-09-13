import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '../constants/theme';
import type { ConsentItem } from '../constants/copy';

interface ConsentChecklistProps {
  items: ConsentItem[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function ConsentChecklist({ items, checked, onToggle }: ConsentChecklistProps) {
  return (
    <View>
      {items.map((item) => {
        const isChecked = !!checked[item.id];
        return (
          <Pressable
            key={item.id}
            onPress={() => onToggle(item.id)}
            style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: isChecked ? colors.accent : colors.line,
                backgroundColor: isChecked ? colors.accent : 'transparent',
                marginRight: 12,
                marginTop: 2,
              }}
            />
            <Text
              style={{
                fontFamily: fonts.ui,
                color: colors.ink,
                fontSize: 14,
                flex: 1,
                lineHeight: 20,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
