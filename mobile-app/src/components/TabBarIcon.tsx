import React from 'react';
import { Text } from 'react-native';

interface TabBarIconProps {
  route: any;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ route, focused, color, size }) => {
  let iconName = '📋';

  if (route.name === 'Projects') {
    iconName = '🏗️';
  } else if (route.name === 'Punchlist') {
    iconName = '📋';
  } else if (route.name === 'Reports') {
    iconName = '📊';
  }

  return (
    <Text style={{ fontSize: size, opacity: focused ? 1 : 0.6 }}>
      {iconName}
    </Text>
  );
};

export default TabBarIcon;