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

export default function TransactionsScreen() {
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

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
  };

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString('en-KE')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'funded':
        return {
          container: styles.fundedBadge,
          text: styles.fundedText,
        };

      case 'in_transit':
        return {
          container: styles.transitBadge,
          text: styles.transitText,
        };

      case 'completed':
        return {
          container: styles.completedBadge,
          text: styles.completedText,
        };

      case 'disputed':
        return {
          container: styles.disputedBadge,
          text: styles.disputedText,
        };

      case 'cancelled':
        return {
          container: styles.cancelledBadge,
          text: styles.cancelledText,
        };

      default:
        return {
          container: styles.pendingBadge,
          text: styles.pendingText,
        };
    }
  };

  const formatStatus = (status: Transaction['status']) => {
    switch (status) {
      case 'in_transit':
        return 'IN TRANSIT';

      case 'funded':
        return 'FUNDED';

      case 'completed':
        return 'COMPLETED';

      case 'disputed':
        return 'DISPUTED';

      case 'cancelled':
        return 'CANCELLED';

      default:
        return 'PENDING';
    }
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
          <Text style={styles.eyebrow}>SELLER</Text>

          <Text style={styles.title}>Transactions</Text>

          <Text style={styles.subtitle}>
            Track and manage the transactions you have created.
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>
              Total transactions
            </Text>

            <Text style={styles.summaryNumber}>
              {transactions.length}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View>
            <Text style={styles.summaryLabel}>
              Total value
            </Text>

            <Text style={styles.summaryValue}>
              {formatPrice(
                transactions.reduce(
                  (total, transaction) =>
                    total + transaction.price,
                  0
                )
              )}
            </Text>
          </View>
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="small"
              color="#FF3B30"
            />

            <Text style={styles.loadingText}>
              Loading transactions...
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>+</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No transactions yet
            </Text>

            <Text style={styles.emptyText}>
              Create your first transaction and it will appear
              here.
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
          /* Transactions */
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                All transactions
              </Text>

              <Text style={styles.count}>
                {transactions.length}
              </Text>
            </View>

            {transactions.map((transaction) => {
              const statusStyle = getStatusStyle(
                transaction.status
              );

              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/(seller)/transaction-details',
                      params: {
                        transactionId: transaction.id,
                      },
                    })
                  }
                >
                  <View style={styles.transactionTop}>
                    <View style={styles.productIcon}>
                      <Text style={styles.productEmoji}>
                        📦
                      </Text>
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text
                        style={styles.productName}
                        numberOfLines={1}
                      >
                        {transaction.product}
                      </Text>

                      <Text
                        style={styles.buyer}
                        numberOfLines={1}
                      >
                        {transaction.buyerName
                          ? transaction.buyerName
                          : 'Buyer not specified'}
                      </Text>
                    </View>

                    <View style={styles.amountContainer}>
                      <Text style={styles.amount}>
                        {formatPrice(transaction.price)}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          statusStyle.container,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            statusStyle.text,
                          ]}
                        >
                          {formatStatus(
                            transaction.status
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.transactionFooter}>
                    <Text style={styles.transactionId}>
                      {transaction.id}
                    </Text>

                    <Text style={styles.date}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FF3B30',
    marginBottom: 8,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#737373',
    maxWidth: 340,
  },

  summaryCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  summaryLabel: {
    fontSize: 11,
    color: '#A3A3A3',
    marginBottom: 6,
  },

  summaryNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#333333',
    marginHorizontal: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  count: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },

  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  transactionTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  productIcon: {
    width: 46,
    height: 46,
    borderRadius: 11,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  productEmoji: {
    fontSize: 20,
  },

  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },

  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },

  buyer: {
    fontSize: 12,
    color: '#737373',
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 6,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 8,
    fontWeight: '700',
  },

  pendingBadge: {
    backgroundColor: '#FFF4D6',
  },

  pendingText: {
    color: '#946200',
  },

  fundedBadge: {
    backgroundColor: '#DCFCE7',
  },

  fundedText: {
    color: '#166534',
  },

  transitBadge: {
    backgroundColor: '#DBEAFE',
  },

  transitText: {
    color: '#1D4ED8',
  },

  completedBadge: {
    backgroundColor: '#E0E7FF',
  },

  completedText: {
    color: '#3730A3',
  },

  disputedBadge: {
    backgroundColor: '#FEE2E2',
  },

  disputedText: {
    color: '#B91C1C',
  },

  cancelledBadge: {
    backgroundColor: '#E5E5E5',
  },

  cancelledText: {
    color: '#525252',
  },

  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 13,
    paddingTop: 10,
  },

  transactionId: {
    fontSize: 10,
    color: '#A3A3A3',
  },

  date: {
    fontSize: 10,
    color: '#A3A3A3',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#737373',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyIconText: {
    fontSize: 30,
    fontWeight: '300',
    color: '#FF3B30',
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: '#737373',
    maxWidth: 290,
    marginBottom: 20,
  },

  createButton: {
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
