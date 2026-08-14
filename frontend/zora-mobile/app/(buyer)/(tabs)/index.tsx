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
import { useRouter } from 'expo-router';

type TxStatus = 'in_escrow' | 'completed' | 'refunded';

type Transaction = {
  id: string;
  orderId: string;
  item: string;
  vendor: string;
  amount: number;
  status: TxStatus;
  date: string;
};

const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    orderId: '1042',
    item: 'Social Media Boutique Order',
    vendor: '@nairobi_thrifts',
    amount: 5000,
    status: 'in_escrow',
    date: 'Today, 10:24 AM',
  },
  {
    id: '2',
    orderId: '1038',
    item: 'Wireless Earbuds (Black)',
    vendor: '@techdeals_ke',
    amount: 2800,
    status: 'completed',
    date: 'Aug 11, 2026',
  },
  {
    id: '3',
    orderId: '1031',
    item: 'Handmade Beaded Necklace',
    vendor: '@afriqbeads',
    amount: 1500,
    status: 'refunded',
    date: 'Aug 8, 2026',
  },
];

const STATUS_META: Record<
  TxStatus,
  { label: string; color: string }
> = {
  in_escrow: {
    label: 'Protected',
    color: '#FF7255',
  },
  completed: {
    label: 'Completed',
    color: '#4ADE80',
  },
  refunded: {
    label: 'Refunded',
    color: '#888888',
  },
};

const BUYER_NAME = 'Amina';

export default function BuyerHomeScreen() {
  const router = useRouter();

  const activeEscrow = RECENT_TRANSACTIONS.filter(
    (transaction) => transaction.status === 'in_escrow'
  );

  const totalHeld = activeEscrow.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const nextOrder = activeEscrow[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.name}>{BUYER_NAME}</Text>
          </View>

          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.7}
            onPress={() => router.push('/(buyer)/(tabs)/profile')}
          >
            <FontAwesome5
              name="user"
              size={14}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* PROTECTED BALANCE */}
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>
            Currently protected by Zora
          </Text>

          <Text style={styles.balanceValue}>
            KES {totalHeld.toLocaleString()}
          </Text>
        </View>

        {/* ACTIVE ORDER */}
        {nextOrder && (
          <TouchableOpacity
            style={styles.activeOrderCard}
            activeOpacity={0.75}
            onPress={() =>
              router.push({
                pathname: '/(buyer)/buyer_transaction',
                params: {
                  id: nextOrder.orderId,
                },
              })
            }
          >
            <View style={styles.activeOrderTop}>
              <View style={styles.protectedRow}>
                <View style={styles.protectedDot} />

                <Text style={styles.activeOrderLabel}>
                  {activeEscrow.length} active order
                  {activeEscrow.length === 1 ? '' : 's'}
                </Text>
              </View>

              <FontAwesome5
                name="chevron-right"
                size={10}
                color="#666666"
              />
            </View>

            <Text
              style={styles.activeOrderItem}
              numberOfLines={1}
            >
              {nextOrder.item}
            </Text>

            <View style={styles.activeOrderBottom}>
              <Text style={styles.activeOrderMeta}>
                {nextOrder.vendor} · {nextOrder.date}
              </Text>

              <Text style={styles.activeOrderAmount}>
                KES {nextOrder.amount.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        {/* RECENT TRANSACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>
            Recent activity
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/(buyer)/(tabs)/transactions')
            }
            activeOpacity={0.6}
          >
            <Text style={styles.seeAllText}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionList}>
          {RECENT_TRANSACTIONS.map((transaction) => {
            const meta =
              STATUS_META[transaction.status];

            return (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname:
                      '/(buyer)/buyer_transaction',
                    params: {
                      id: transaction.orderId,
                    },
                  })
                }
              >
                <View style={styles.transactionTop}>
                  <View style={styles.transactionInfo}>
                    <Text
                      style={styles.transactionItem}
                      numberOfLines={1}
                    >
                      {transaction.item}
                    </Text>

                    <Text style={styles.vendor}>
                      {transaction.vendor}
                    </Text>
                  </View>

                  <Text style={styles.amount}>
                    KES{' '}
                    {transaction.amount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.transactionBottom}>
                  <Text style={styles.date}>
                    {transaction.date}
                  </Text>

                  <View style={styles.status}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: meta.color,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: meta.color,
                        },
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TRUST MESSAGE */}
        <View style={styles.trustMessage}>
          <FontAwesome5
            name="shield-alt"
            size={10}
            color="#4F4F4F"
          />

          <Text style={styles.trustText}>
            Your payment stays protected by Zora until
            you confirm that your order has arrived.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  eyebrow: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 3,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#252525',
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },

  balanceBlock: {
    marginBottom: 20,
  },

  balanceLabel: {
    color: '#666666',
    fontSize: 11.5,
    marginBottom: 6,
  },

  balanceValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  activeOrderCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF7255',
    backgroundColor: 'rgba(255,114,85,0.055)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  activeOrderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  protectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  protectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF7255',
    marginRight: 6,
  },

  activeOrderLabel: {
    color: '#FF7255',
    fontSize: 11.5,
    fontWeight: '600',
  },

  activeOrderItem: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },

  activeOrderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activeOrderMeta: {
    color: '#777777',
    fontSize: 9.5,
    flex: 1,
    marginRight: 10,
  },

  activeOrderAmount: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#1E1E1E',
    marginVertical: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionLabel: {
    color: '#888888',
    fontSize: 12,
  },

  seeAllText: {
    color: '#FF7255',
    fontSize: 11,
    fontWeight: '500',
  },

  transactionList: {
    gap: 10,
  },

  transactionCard: {
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 15,
    padding: 14,
  },

  transactionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },

  transactionItem: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },

  vendor: {
    color: '#5F5F5F',
    fontSize: 9.5,
    marginTop: 4,
  },

  amount: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },

  transactionBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  date: {
    color: '#555555',
    fontSize: 9.5,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9.5,
    fontWeight: '600',
  },

  trustMessage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 25,
    gap: 7,
  },

  trustText: {
    color: '#4F4F4F',
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
    flex: 1,
  },
});
