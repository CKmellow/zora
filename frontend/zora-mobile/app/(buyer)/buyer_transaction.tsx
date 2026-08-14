import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type TxStatus = 'in_Zora' | 'completed' | 'refunded';

type Transaction = {
  id: string;
  orderId: string;
  item: string;
  vendor: string;
  amount: number;
  status: TxStatus;
  date: string;
};

const MOCK_TRANSACTIONS: Transaction[] = [
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
    status: 'completed',
    date: 'Aug 8, 2026',
  },
  {
    id: '4',
    orderId: '1022',
    item: 'Sneakers - Size 42',
    vendor: '@soleuptown',
    amount: 6200,
    status: 'refunded',
    date: 'Aug 2, 2026',
  },
  {
    id: '5',
    orderId: '1015',
    item: 'Skincare Bundle',
    vendor: '@glowhouse.ke',
    amount: 3400,
    status: 'completed',
    date: 'Jul 29, 2026',
  },
];

const STATUS_META: Record<TxStatus, { label: string; color: string }> = {
  in_escrow: { label: 'In Escrow', color: '#FF7255' },
  completed: { label: 'Completed', color: '#4ADE80' },
  refunded: { label: 'Refunded', color: '#888888' },
};

type FilterKey = 'all' | TxStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in_escrow', label: 'In Escrow' },
  { key: 'completed', label: 'Completed' },
  { key: 'refunded', label: 'Refunded' },
];

export default function BuyerTransactionHistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('all');

  const transactions = MOCK_TRANSACTIONS;

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.status === filter);
  }, [transactions, filter]);

  const totals = useMemo(() => {
    const inEscrow = transactions.filter((t) => t.status === 'in_escrow');
    const totalHeld = inEscrow.reduce((sum, t) => sum + t.amount, 0);
    return {
      count: transactions.length,
      activeCount: inEscrow.length,
      totalHeld,
    };
  }, [transactions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
            <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transactions</Text>
          <View style={{ width: 16 }} />
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Held in escrow</Text>
            <Text style={styles.summaryValue}>
              KES {totals.totalHeld.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Active orders</Text>
            <Text style={styles.summaryValue}>{totals.activeCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Total orders</Text>
            <Text style={styles.summaryValue}>{totals.count}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LIST */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="receipt" size={22} color="#333333" />
            <Text style={styles.emptyText}>No transactions here yet.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => {
              const meta = STATUS_META[item.status];
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.txCard}
                  onPress={() =>
                    router.push({
                      pathname: '/order/[id]',
                      params: { id: item.orderId },
                    })
                  }
                >
                  <View style={styles.txTop}>
                    <Text style={styles.txItem} numberOfLines={1}>
                      {item.item}
                    </Text>
                    <Text style={styles.txAmount}>
                      KES {item.amount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.txBottom}>
                    <Text style={styles.txMeta}>
                      {item.vendor} · #{item.orderId} · {item.date}
                    </Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                      <Text style={[styles.statusText, { color: meta.color }]}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryBlock: {
    flex: 1,
  },
  summaryLabel: {
    color: '#888888',
    fontSize: 11.5,
    marginBottom: 6,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#1E1E1E',
    marginHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E1E1E',
    marginBottom: 20,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 22,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242424',
  },
  filterChipActive: {
    borderColor: '#FF7255',
    backgroundColor: 'rgba(255,114,85,0.08)',
  },
  filterChipText: {
    color: '#888888',
    fontSize: 12.5,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FF7255',
  },
  txCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  txItem: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  txAmount: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '600',
  },
  txBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txMeta: {
    color: '#666666',
    fontSize: 11.5,
    flex: 1,
    marginRight: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    color: '#555555',
    fontSize: 13,
  },
});