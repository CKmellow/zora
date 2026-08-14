import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function BuyerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF7255',
        tabBarInactiveTintColor: '#555555',
        tabBarStyle: {
          backgroundColor: '#0B0B0B',
          borderTopColor: '#1E1E1E',
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5
              name="home"
              size={size - 2}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5
              name="receipt"
              size={size - 2}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5
              name="user"
              size={size - 2}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
