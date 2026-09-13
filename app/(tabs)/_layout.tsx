import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors, fonts } from '../../constants/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  // TODO: swap for real icons (react-native-svg) once iconography is designed.
  return (
    <Text style={{ fontSize: 11, fontFamily: fonts.uiMedium, color: focused ? colors.accent : colors.inkSoft }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
        },
        tabBarLabelStyle: { fontFamily: fonts.ui, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="report"
        options={{ title: 'Report', tabBarIcon: ({ focused }) => <TabIcon label="●" focused={focused} /> }}
      />
      <Tabs.Screen
        name="routine"
        options={{ title: 'Routine', tabBarIcon: ({ focused }) => <TabIcon label="◆" focused={focused} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ focused }) => <TabIcon label="▲" focused={focused} /> }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => <TabIcon label="+" focused={focused} />,
        }}
        listeners={({ navigation }) => ({
          // The "Scan" tab is a shortcut into the capture flow (a stack
          // screen outside this tab group), not a real tab screen — so we
          // intercept the press and never actually navigate into scan.tsx.
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate('capture');
          },
        })}
      />
    </Tabs>
  );
}
