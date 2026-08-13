import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>Kevin 👋</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
        </View>

        {/* Balance / Overview */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total transaction value</Text>
          <Text style={styles.balance}>KSh 42,500</Text>

          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>4 active transactions</Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>To fulfill</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>In transit</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {/* Transaction 1 */}
        <View style={styles.transactionCard}>
          <View style={styles.transactionTop}>
            <View style={styles.productIcon}>
              <Text>👟</Text>
            </View>

            <View style={styles.transactionInfo}>
              <Text style={styles.productName}>Nike Air Force 1</Text>
              <Text style={styles.buyer}>John Kamau</Text>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amount}>KSh 10,000</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>FUNDED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction 2 */}
        <View style={styles.transactionCard}>
          <View style={styles.transactionTop}>
            <View style={styles.productIcon}>
              <Text>👟</Text>
            </View>

            <View style={styles.transactionInfo}>
              <Text style={styles.productName}>Adidas Campus</Text>
              <Text style={styles.buyer}>Brian Mwangi</Text>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amount}>KSh 8,500</Text>
              <View style={styles.transitBadge}>
                <Text style={styles.transitText}>IN TRANSIT</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },

  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },

  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },

  balance: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },

  balanceFooter: {
    marginTop: 20,
  },

  balanceFooterText: {
    color: '#D1D5DB',
    fontSize: 13,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },

  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  transactionTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  productIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  transactionInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },

  buyer: {
    fontSize: 12,
    color: '#6B7280',
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },

  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#166534',
  },

  transitBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  transitText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D4ED8',
  },
});