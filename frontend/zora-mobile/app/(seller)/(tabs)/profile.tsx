import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.headerAction}>Edit</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>Kevin</Text>
            <Text style={styles.email}>
              kevin@example.com
            </Text>
            <Text style={styles.sellerLabel}>
              Seller account
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.menuCard}>
          <MenuItem
            title="Personal information"
            subtitle="Name, email and phone"
          />

          <MenuItem
            title="Payment details"
            subtitle="Manage your payout information"
          />

          <MenuItem
            title="Notifications"
            subtitle="Transaction and account alerts"
          />

          <MenuItem
            title="Security"
            subtitle="Password and account security"
            last
          />
        </View>

        <Text style={styles.sectionTitle}>
          Support
        </Text>

        <View style={styles.menuCard}>
          <MenuItem
            title="Help centre"
            subtitle="Get help with Zora"
          />

          <MenuItem
            title="Terms & privacy"
            subtitle="Review our policies"
            last
          />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            Log out
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          Zora · Seller v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  title,
  subtitle,
  last = false,
}: {
  title: string;
  subtitle: string;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        !last && styles.menuItemBorder,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },

  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
  },

  headerAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 3,
  },

  email: {
    fontSize: 12,
    color: '#737373',
    marginBottom: 6,
  },

  sellerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF3B30',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 25,
    overflow: 'hidden',
  },

  menuItem: {
    minHeight: 67,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  menuText: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 4,
  },

  menuSubtitle: {
    fontSize: 11,
    color: '#888888',
  },

  chevron: {
    fontSize: 25,
    color: '#AAAAAA',
    fontWeight: '300',
    marginLeft: 10,
  },

  logoutButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  logoutText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '700',
  },

  version: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 10,
    marginTop: 18,
  },
});