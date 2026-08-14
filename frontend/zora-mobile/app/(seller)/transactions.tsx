import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { getTransactions } from '../../lib/transactions';
import { Transaction } from '../../types/transaction';

export default function TransactionsScreen() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      setLoading(true);

      const data = await getTransactions();

      setTransactions(data);
    } catch (error) {
      console.error(
        'Failed to load transactions:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString('en-KE')}`;
  };

  const formatStatus = (
    status: Transaction['status']
  ) => {
    switch (status) {
      case 'funded':
        return 'FUNDED';

      case 'in_transit':
        return 'IN TRANSIT';

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

  const getStatusStyle = (
    status: Transaction['status']
  ) => {
    switch (status) {
      case 'funded':
        return {
          background: styles.fundedBadge,
          text: styles.fundedText,
        };

      case 'in_transit':
        return {
          background: styles.transitBadge,
          text: styles.transitText,
        };

      case 'completed':
        return {
          background: styles.completedBadge,
          text: styles.completedText,
        };

      case 'disputed':
        return {
          background: styles.disputedBadge,
          text: styles.disputedText,
        };

      case 'cancelled':
        return {
          background: styles.cancelledBadge,
          text: styles.cancelledText,
        };

      default:
        return {
          background: styles.pendingBadge,
          text: styles.pendingText,
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SELLER</Text>

            <Text style={styles.title}>
              Transactions
            </Text>

            <Text style={styles.subtitle}>
              Track all your Zora transactions in one place.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() =>
              router.push('/(seller)/(tabs)/create')
            }
          >
            <Text style={styles.createButtonText}>
              +
            </Text>
          </TouchableOpacity>
        </View>

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
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                +
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No transactions yet
            </Text>

            <Text style={styles.emptyText}>
              Create your first transaction and send the
              secure link to your buyer.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push('/(seller)/(tabs)/create')
              }
            >
              <Text style={styles.emptyButtonText}>
                Create transaction
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.count}>
              {transactions.length}{' '}
              {transactions.length === 1
                ? 'transaction'
                : 'transactions'}
            </Text>

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
                  <View style={styles.cardTop}>
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

                      <Text style={styles.buyer}>
                        {transaction.buyerName ||
                          'Buyer not specified'}
                      </Text>
                    </View>

                    <Text style={styles.amount}>
                      {formatPrice(transaction.price)}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.transactionId}>
                      {transaction.id}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        statusStyle.background,
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
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FF3B30',
    marginBottom: 7,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 7,
    maxWidth: 300,
    fontSize: 13,
    lineHeight: 19,
    color: '#737373',
  },

  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '300',
    marginTop: -2,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#737373',
  },

  count: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 10,
  },

  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 11,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  productEmoji: {
    fontSize: 21,
  },

  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },

  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },

  buyer: {
    fontSize: 11,
    color: '#888888',
  },

  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  transactionId: {
    fontSize: 10,
    color: '#A3A3A3',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
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

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyIconText: {
    color: '#FF3B30',
    fontSize: 30,
    fontWeight: '300',
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 7,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: '#777777',
    marginBottom: 20,
  },

  emptyButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
