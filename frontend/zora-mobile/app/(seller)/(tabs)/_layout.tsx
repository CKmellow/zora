import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: '#8A8A8A',

        tabBarButton: HapticTab,

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8E8E8',

          // Extra space at the bottom so labels/icons
          // don't sit against the edge.
          height: 88,
          paddingTop: 8,
          paddingBottom: 14,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 1,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={23}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={23}
              name="list.bullet"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="plus.circle.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={23}
              name="clock.arrow.circlepath"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={23}
              name="person.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}