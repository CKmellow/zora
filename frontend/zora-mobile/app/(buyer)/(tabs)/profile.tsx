import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const BUYER = {
  name: 'Amina',
  email: 'amina@example.com',
  phone: '+254 712 345 678',
};

export default function BuyerProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Account</Text>
            <Text style={styles.title}>Profile</Text>
          </View>

          <View style={styles.avatar}>
            <FontAwesome5 name="user" size={18} color="#FFFFFF" />
          </View>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.largeAvatar}>
            <FontAwesome5 name="user" size={24} color="#FFFFFF" />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{BUYER.name}</Text>
            <Text style={styles.email}>{BUYER.email}</Text>
            <Text style={styles.phone}>{BUYER.phone}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="pen" size={10} color="#AAAAAA" />
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>

          <View style={styles.menuCard}>
            <ProfileRow
              icon="user"
              title="Personal information"
              subtitle="Name, email and phone"
            />

            <View style={styles.rowDivider} />

            <ProfileRow
              icon="shield-alt"
              title="Security"
              subtitle="Password and account security"
            />
          </View>
        </View>

        {/* PAYMENTS */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payments</Text>

          <View style={styles.menuCard}>
            <ProfileRow
              icon="credit-card"
              title="Payment methods"
              subtitle="Manage your payment options"
            />

            <View style={styles.rowDivider} />

            <ProfileRow
              icon="receipt"
              title="Transaction history"
              subtitle="View all your Zora transactions"
            />
          </View>
        </View>

        {/* HELP */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>

          <View style={styles.menuCard}>
            <ProfileRow
              icon="question-circle"
              title="Help & support"
              subtitle="Get help with a transaction"
            />

            <View style={styles.rowDivider} />

            <ProfileRow
              icon="file-alt"
              title="Terms & privacy"
              subtitle="Zora policies and agreements"
            />
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <FontAwesome5
            name="sign-out-alt"
            size={13}
            color="#F87171"
          />

          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Zora · Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity
      style={styles.profileRow}
      activeOpacity={0.7}
    >
      <View style={styles.rowIcon}>
        <FontAwesome5
          name={icon}
          size={12}
          color="#888888"
        />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <FontAwesome5
        name="chevron-right"
        size={9}
        color="#444444"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 110,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  eyebrow: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 3,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#252525',
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* PROFILE */

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#202020',
    borderRadius: 18,
    padding: 16,
    marginBottom: 28,
  },

  largeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF7255',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  email: {
    color: '#777777',
    fontSize: 10.5,
    marginTop: 4,
  },

  phone: {
    color: '#555555',
    fontSize: 10,
    marginTop: 2,
  },

  editButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SECTIONS */

  section: {
    marginBottom: 23,
  },

  sectionLabel: {
    color: '#888888',
    fontSize: 12.5,
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 15,
    overflow: 'hidden',
  },

  /* ROW */

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  rowContent: {
    flex: 1,
  },

  rowTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },

  rowSubtitle: {
    color: '#5F5F5F',
    fontSize: 10,
    marginTop: 3,
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#1C1C1C',
    marginLeft: 59,
  },

  /* LOGOUT */

  logoutButton: {
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#2A1A1A',
    backgroundColor: '#130F0F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },

  logoutText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },

  version: {
    color: '#3F3F3F',
    fontSize: 9.5,
    textAlign: 'center',
    marginTop: 20,
  },
});

