import React, { useMemo, useState } from 'react';
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

type TxStatus = 'in_escrow' | 'completed' | 'refunded' | 'disputed';

type Transaction = {
  id: string;
  orderId: string;
  item: string;
  vendor: string;
  amount: number;
  status: TxStatus;
  date: string;
};

const TRANSACTIONS: Transaction[] = [
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
  {
    id: '4',
    orderId: '1027',
    item: 'Nike Air Force 1',
    vendor: '@sneakerplug_ke',
    amount: 8500,
    status: 'completed',
    date: 'Aug 3, 2026',
  },
  {
    id: '5',
    orderId: '1019',
    item: 'Samsung Galaxy Buds',
    vendor: '@gadgethub_ke',
    amount: 6500,
    status: 'disputed',
    date: 'Jul 29, 2026',
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
  disputed: {
    label: 'Disputed',
    color: '#F87171',
  },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'in_escrow', label: 'Protected' },
  { key: 'completed', label: 'Completed' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'disputed', label: 'Disputed' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function BuyerTransactionsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] =
    useState<FilterKey>('all');

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') {
      return TRANSACTIONS;
    }

    return TRANSACTIONS.filter(
      (transaction) => transaction.status === activeFilter
    );
  }, [activeFilter]);

  const protectedAmount = TRANSACTIONS.filter(
    (transaction) => transaction.status === 'in_escrow'
  ).reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Your activity</Text>
            <Text style={styles.title}>Transactions</Text>
          </View>

          <View style={styles.headerIcon}>
            <FontAwesome5
              name="receipt"
              size={14}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* PROTECTED SUMMARY */}
        {protectedAmount > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <FontAwesome5
                name="shield-alt"
                size={13}
                color="#FF7255"
              />
            </View>

            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>
                Currently protected
              </Text>

              <Text style={styles.summaryAmount}>
                KES {protectedAmount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Active</Text>
            </View>
          </View>
        )}

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;

            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  isActive && styles.filterButtonActive,
                ]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TRANSACTION COUNT */}
        <View style={styles.listHeader}>
          <Text style={styles.listLabel}>
            {filteredTransactions.length}{' '}
            transaction
            {filteredTransactions.length === 1 ? '' : 's'}
          </Text>
        </View>

        {/* TRANSACTIONS */}
        <View style={styles.transactionList}>
          {filteredTransactions.map((transaction) => {
            const meta = STATUS_META[transaction.status];

            return (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: '/buyer_transaction',
                    params: {
                      id: transaction.orderId,
                    },
                  })
                }
              >
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIcon}>
                    <FontAwesome5
                      name="shopping-bag"
                      size={12}
                      color="#888888"
                    />
                  </View>

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

                  <View style={styles.amountContainer}>
                    <Text style={styles.amount}>
                      KES {transaction.amount.toLocaleString()}
                    </Text>

                    <Text style={styles.orderId}>
                      #{transaction.orderId}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.transactionFooter}>
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

        {/* EMPTY STATE */}
        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <FontAwesome5
                name="receipt"
                size={18}
                color="#555555"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Nothing here yet
            </Text>

            <Text style={styles.emptyText}>
              Transactions matching this filter will appear here.
            </Text>
          </View>
        )}

        {/* SECURITY MESSAGE */}
        <View style={styles.securityMessage}>
          <FontAwesome5
            name="lock"
            size={10}
            color="#4F4F4F"
          />

          <Text style={styles.securityText}>
            Zora protects your payment until you confirm delivery.
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

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#252525',
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SUMMARY */

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#29201D',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,114,85,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  summaryContent: {
    flex: 1,
  },

  summaryLabel: {
    color: '#666666',
    fontSize: 10,
  },

  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF7255',
    marginRight: 5,
  },

  liveText: {
    color: '#FF7255',
    fontSize: 9.5,
    fontWeight: '600',
  },

  /* FILTERS */

  filterContainer: {
    gap: 8,
    paddingBottom: 20,
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222222',
    backgroundColor: '#101010',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#FF7255',
    borderColor: '#FF7255',
  },

  filterText: {
    color: '#666666',
    fontSize: 10.5,
    fontWeight: '500',
  },

  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* LIST */

  listHeader: {
    marginBottom: 10,
  },

  listLabel: {
    color: '#777777',
    fontSize: 11.5,
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

  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },

  transactionItem: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },

  vendor: {
    color: '#5F5F5F',
    fontSize: 10,
    marginTop: 4,
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },

  orderId: {
    color: '#444444',
    fontSize: 9,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#1C1C1C',
    marginVertical: 12,
  },

  transactionFooter: {
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

  /* EMPTY */

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  emptyText: {
    color: '#555555',
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 5,
  },

  /* SECURITY */

  securityMessage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 25,
    paddingHorizontal: 20,
  },

  securityText: {
    color: '#4F4F4F',
    fontSize: 10,
    textAlign: 'center',
  },
});
