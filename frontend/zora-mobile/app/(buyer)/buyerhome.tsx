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

type TxStatus = 'in_escrow' | 'completed' |  'refunded';

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

const STATUS_META: Record<TxStatus, { label: string; color: string }> = {
  in_escrow: { label: 'In Escrow', color: '#FF7255' },
  completed: { label: 'Completed', color: '#4ADE80' },
  disputed: { label: 'Disputed', color: '#F87171' },
  refunded: { label: 'Refunded', color: '#888888' },
};

const BUYER_NAME = 'Amina';

export default function BuyerHomeScreen() {
  const router = useRouter();

  const activeEscrow = RECENT_TRANSACTIONS.filter((t) => t.status === 'in_escrow');
  const totalHeld = activeEscrow.reduce((sum, t) => sum + t.amount, 0);
  const nextOrder = activeEscrow[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.name}>{BUYER_NAME}</Text>
          </View>

          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.7}>
            <FontAwesome5 name="user" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ESCROW BALANCE */}
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>Currently held in Zora</Text>
          <Text style={styles.balanceValue}>KES {totalHeld.toLocaleString()}</Text>
        </View>

        {/* ACTIVE ORDER HIGHLIGHT */}
        {nextOrder && (
          <TouchableOpacity
            style={styles.activeOrderCard}
            activeOpacity={0.7}
            onPress={() =>
              router.push({ pathname: '/order/[id]', params: { id: nextOrder.orderId } })
            }
          >
            <View style={styles.activeOrderTop}>
              <Text style={styles.activeOrderLabel}>
                {activeEscrow.length} active order{activeEscrow.length === 1 ? '' : 's'} awaiting delivery
              </Text>
              <FontAwesome5 name="chevron-right" size={10} color="#666666" />
            </View>

            <Text style={styles.activeOrderItem} numberOfLines={1}>
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

        {/* RECENT ACTIVITY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Recent activity</Text>
          <TouchableOpacity onPress={() => router.push('/transactions')} activeOpacity={0.6}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 12 }}>
          {RECENT_TRANSACTIONS.map((item) => {
            const meta = STATUS_META[item.status];
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={styles.txCard}
                onPress={() =>
                  router.push({ pathname: '/order/[id]', params: { id: item.orderId } })
                }
              >
                <View style={styles.txTop}>
                  <Text style={styles.txItem} numberOfLines={1}>
                    {item.item}
                  </Text>
                  <Text style={styles.txAmount}>KES {item.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.txBottom}>
                  <Text style={styles.txMeta}>
                    {item.vendor} · {item.date}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SECURITY NOTE */}
        <Text style={styles.securityNotice}>
          Every payment you make is held in Zora and only released to the
          seller once you confirm delivery.
        </Text>
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

  /* HEADER */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    color: '#888888',
    fontSize: 13,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#242424',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* BALANCE */
  balanceBlock: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#888888',
    fontSize: 13,
    marginBottom: 6,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* ACTIVE ORDER HIGHLIGHT */
  activeOrderCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF7255',
    backgroundColor: 'rgba(255,114,85,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  activeOrderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeOrderLabel: {
    color: '#FF7255',
    fontSize: 12.5,
    fontWeight: '600',
  },
  activeOrderItem: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  activeOrderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeOrderMeta: {
    color: '#999999',
    fontSize: 10,
  },
  activeOrderAmount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#1E1E1E',
    marginVertical: 24,
  },

  /* SECTION HEADER */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLabel: {
    color: '#888888',
    fontSize: 13,
  },
  seeAllText: {
    color: '#FF7255',
    fontSize: 12.5,
    fontWeight: '500',
  },

  /* TRANSACTION CARD */
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

  /* SECURITY NOTE */
  securityNotice: {
    color: '#555555',
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 28,
  },
});