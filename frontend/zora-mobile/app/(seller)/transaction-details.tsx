import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import {
  getTransaction,
  updateTransaction,
} from '../../lib/transactions';
import { Transaction } from '../../types/transaction';

export default function TransactionDetailsScreen() {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams<{
    transactionId: string;
  }>();

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadTransaction = async () => {
    if (!transactionId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getTransaction(transactionId);
      setTransaction(data);
    } catch (error) {
      console.error(
        'Failed to load transaction:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransaction();
    }, [transactionId])
  );

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString('en-KE')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-KE', {
      hour: 'numeric',
      minute: '2-digit',
    });
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

  const getStatusStyles = (
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

  const handleMarkInTransit = async () => {
    if (!transaction) return;

    Alert.alert(
      'Mark as in transit?',
      'Only do this once you have handed the item over for delivery.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setUpdating(true);

              const updated =
                await updateTransaction(
                  transaction.id,
                  {
                    status: 'in_transit',
                  }
                );

              if (updated) {
                setTransaction(updated);
              }
            } catch (error) {
              console.error(
                'Failed to update transaction:',
                error
              );

              Alert.alert(
                'Update failed',
                'We could not update this transaction.'
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!transaction) return;

    Alert.alert(
      'Cancel transaction?',
      'This will mark the transaction as cancelled.',
      [
        {
          text: 'Keep transaction',
          style: 'cancel',
        },
        {
          text: 'Cancel transaction',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);

              const updated =
                await updateTransaction(
                  transaction.id,
                  {
                    status: 'cancelled',
                  }
                );

              if (updated) {
                setTransaction(updated);
              }
            } catch (error) {
              console.error(
                'Failed to cancel transaction:',
                error
              );

              Alert.alert(
                'Update failed',
                'We could not cancel this transaction.'
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator
            size="small"
            color="#FF3B30"
          />

          <Text style={styles.loadingText}>
            Loading transaction...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            Transaction not found
          </Text>

          <Text style={styles.errorText}>
            This transaction may have been removed or the link
            may be invalid.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyles = getStatusStyles(
    transaction.status
  );

  const canMarkInTransit =
    transaction.status === 'funded';

  const canCancel =
    transaction.status === 'pending' ||
    transaction.status === 'funded';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Transaction
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Product */}
        <View style={styles.productCard}>
          <View style={styles.productIcon}>
            <Text style={styles.productEmoji}>📦</Text>
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {transaction.product}
            </Text>

            <Text style={styles.transactionId}>
              {transaction.id}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              statusStyles.background,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                statusStyles.text,
              ]}
            >
              {formatStatus(transaction.status)}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>
            Transaction amount
          </Text>

          <Text style={styles.amount}>
            {formatPrice(transaction.price)}
          </Text>

          <Text style={styles.amountHint}>
            Funds remain protected while the transaction is
            active.
          </Text>
        </View>

        {/* Buyer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Buyer
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.buyerAvatar}>
              <Text style={styles.buyerAvatarText}>
                {transaction.buyerName
                  ? transaction.buyerName
                      .charAt(0)
                      .toUpperCase()
                  : '?'}
              </Text>
            </View>

            <View>
              <Text style={styles.buyerName}>
                {transaction.buyerName ||
                  'Buyer not specified'}
              </Text>

              <Text style={styles.buyerHint}>
                Buyer
              </Text>
            </View>
          </View>
        </View>

        {/* Product details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Product details
          </Text>

          <View style={styles.detailsCard}>
            <Text style={styles.description}>
              {transaction.description ||
                'No description provided.'}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Transaction timeline
          </Text>

          <View style={styles.timelineCard}>
            <View style={styles.timelineRow}>
              <View style={styles.timelineDotActive} />

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Transaction created
                </Text>

                <Text style={styles.timelineDate}>
                  {formatDate(transaction.createdAt)} ·{' '}
                  {formatTime(transaction.createdAt)}
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineRow}>
              <View
                style={
                  transaction.status !== 'pending'
                    ? styles.timelineDotActive
                    : styles.timelineDot
                }
              />

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Buyer funds transaction
                </Text>

                <Text style={styles.timelineDate}>
                  {transaction.status === 'pending'
                    ? 'Waiting for buyer'
                    : 'Funds received'}
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineRow}>
              <View
                style={
                  transaction.status === 'in_transit' ||
                  transaction.status === 'completed'
                    ? styles.timelineDotActive
                    : styles.timelineDot
                }
              />

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Item delivered
                </Text>

                <Text style={styles.timelineDate}>
                  {transaction.status === 'completed'
                    ? 'Completed'
                    : 'Waiting for delivery'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        {canMarkInTransit && (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              updating && styles.disabledButton,
            ]}
            onPress={handleMarkInTransit}
            disabled={updating}
            activeOpacity={0.85}
          >
            {updating ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.primaryButtonText}>
                Mark as in transit
              </Text>
            )}
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={updating}
          >
            <Text style={styles.cancelButtonText}>
              Cancel transaction
            </Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#737373',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },

  errorText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: '#737373',
    marginBottom: 20,
  },

  backButton: {
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  back: {
    width: 42,
    height: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 38,
    lineHeight: 38,
    color: '#111111',
    fontWeight: '300',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },

  headerSpacer: {
    width: 42,
  },

  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  productIcon: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  productEmoji: {
    fontSize: 22,
  },

  productInfo: {
    flex: 1,
    marginRight: 8,
  },

  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },

  transactionId: {
    fontSize: 10,
    color: '#999999',
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

  amountCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },

  amountLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    marginBottom: 7,
  },

  amount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },

  amountHint: {
    color: '#A3A3A3',
    fontSize: 11,
    lineHeight: 17,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  buyerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  buyerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  buyerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 3,
  },

  buyerHint: {
    fontSize: 11,
    color: '#888888',
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#555555',
  },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 17,
  },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D4D4D4',
    marginTop: 3,
    marginRight: 13,
  },

  timelineDotActive: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginTop: 3,
    marginRight: 13,
  },

  timelineContent: {
    flex: 1,
  },

  timelineTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 4,
  },

  timelineDate: {
    fontSize: 11,
    color: '#888888',
  },

  timelineLine: {
    height: 24,
    width: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: 5,
    marginVertical: 3,
  },

  primaryButton: {
    height: 54,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  disabledButton: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  cancelButton: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  cancelButtonText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
});
