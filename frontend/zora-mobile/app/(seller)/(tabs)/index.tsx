import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { getTransactions } from '../../../lib/transactions';
import { Transaction } from '../../../types/transaction';

export default function HomeScreen() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload whenever the seller comes back to this screen.
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const totalValue = transactions.reduce(
    (total, transaction) => total + transaction.price,
    0
  );

  const pendingCount = transactions.filter(
    (transaction) => transaction.status === 'pending'
  ).length;

  const inTransitCount = transactions.filter(
    (transaction) => transaction.status === 'in_transit'
  ).length;

  const completedCount = transactions.filter(
    (transaction) => transaction.status === 'completed'
  ).length;

  const activeCount = transactions.filter(
    (transaction) =>
      transaction.status !== 'completed' &&
      transaction.status !== 'cancelled'
  ).length;

  const recentTransactions = transactions.slice(0, 5);

  const formatPrice = (price: number) =>
    `KSh ${price.toLocaleString('en-KE')}`;

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return 'PENDING';

      case 'funded':
        return 'FUNDED';

      case 'in_transit':
        return 'IN TRANSIT';

      case 'completed':
        return 'COMPLETED';

      case 'cancelled':
        return 'CANCELLED';

      default:
        return status.toUpperCase();
    }
  };

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'funded':
        return {
          badge: styles.fundedBadge,
          text: styles.fundedText,
        };

      case 'in_transit':
        return {
          badge: styles.transitBadge,
          text: styles.transitText,
        };

      case 'completed':
        return {
          badge: styles.completedBadge,
          text: styles.completedText,
        };

      case 'cancelled':
        return {
          badge: styles.cancelledBadge,
          text: styles.cancelledText,
        };

      case 'pending':
      default:
        return {
          badge: styles.pendingBadge,
          text: styles.pendingText,
        };
    }
  };

  const openTransaction = (transaction: Transaction) => {
    router.push({
      pathname: '/transaction-details',
      params: {
        transactionId: transaction.id,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>

            <Text style={styles.name}>
              Kevin 👋
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
        </View>

        {/* Balance / Overview */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            Total transaction value
          </Text>

          <Text style={styles.balance}>
            {formatPrice(totalValue)}
          </Text>

          <View style={styles.balanceFooter}>
            <Text style={styles.balanceFooterText}>
              {activeCount}{' '}
              {activeCount === 1 ? 'active transaction' : 'active transactions'}
            </Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {pendingCount}
            </Text>

            <Text style={styles.statLabel}>
              To fulfill
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {inTransitCount}
            </Text>

            <Text style={styles.statLabel}>
              In transit
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {completedCount}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent transactions
          </Text>

          {transactions.length > 0 && (
            <Text style={styles.seeAll}>
              {transactions.length} total
            </Text>
          )}
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color="#FF3B30" />

            <Text style={styles.emptyTitle}>
              Loading transactions...
            </Text>
          </View>
        ) : recentTransactions.length === 0 ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>+</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No transactions yet
            </Text>

            <Text style={styles.emptyText}>
              Create your first transaction and it will
              appear here.
            </Text>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() =>
                router.push('/(seller)/(tabs)/create')
              }
              activeOpacity={0.85}
            >
              <Text style={styles.createButtonText}>
                Create transaction
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Actual stored transactions */
          recentTransactions.map((transaction) => {
            const statusStyle = getStatusStyle(
              transaction.status
            );

            return (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                onPress={() =>
                  openTransaction(transaction)
                }
                activeOpacity={0.8}
              >
                <View style={styles.transactionTop}>
                  {/* Product image / icon */}
                  <View style={styles.productIcon}>
                    <Text style={styles.productEmoji}>
                      👟
                    </Text>
                  </View>

                  {/* Transaction information */}
                  <View style={styles.transactionInfo}>
                    <Text
                      style={styles.productName}
                      numberOfLines={1}
                    >
                      {transaction.product}
                    </Text>

                    <Text style={styles.buyer}>
                      {transaction.buyerName
                        ? transaction.buyerName
                        : 'Buyer not specified'}
                    </Text>
                  </View>

                  {/* Amount / status */}
                  <View style={styles.amountContainer}>
                    <Text style={styles.amount}>
                      {formatPrice(transaction.price)}
                    </Text>

                    <View style={statusStyle.badge}>
                      <Text style={statusStyle.text}>
                        {getStatusLabel(
                          transaction.status
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
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

  productEmoji: {
    fontSize: 20,
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
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
    marginLeft: 8,
  },

  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  pendingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
  },

  fundedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  fundedText: {
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

  completedBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  completedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
  },

  cancelledBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  cancelledText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#991B1B',
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyIconText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FF3B30',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
  },

  createButton: {
    marginTop: 18,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});