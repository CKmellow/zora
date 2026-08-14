import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function BuyerCheckoutScreen() {
  const router = useRouter();
  const { orderId, amount, item } = useLocalSearchParams();

  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'pesalink'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (paymentMethod === 'mpesa') {
      if (!phoneNumber || phoneNumber.length < 9) {
        Alert.alert('Invalid Number', 'Please enter a valid M-Pesa phone number.');
        return;
      }
    } else {
      if (!accountNumber) {
        Alert.alert('Missing Details', 'Please enter your bank account or phone number linked to PesaLink.');
        return;
      }
    }

    setLoading(true);

    // Replace this simulation with your actual backend integration.
    setTimeout(() => {
      setLoading(false);

      if (paymentMethod === 'mpesa') {
        Alert.alert('STK Push Sent', `Check phone ${phoneNumber}. Enter your M-Pesa PIN for Order #${orderId || '1042'}.`);
      } else {
        Alert.alert('PesaLink Request Initiated', `Bank transfer request sent for Order #${orderId || '1042'}. Approve the prompt on your banking app.`);
      }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
              <FontAwesome5 name="arrow-left" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Checkout</Text>
            <View style={{ width: 16 }} />
          </View>

          {/* ORDER */}
          <View style={styles.orderRow}>
            <Text style={styles.orderId}>Order #{orderId || '1042'}</Text>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
          <Text style={styles.itemName}>{item || 'Social Media Boutique Order'}</Text>

          {/* AMOUNT */}
          <View style={styles.amountBlock}>
            <Text style={styles.priceLabel}>Amount to pay</Text>
            <Text style={styles.priceValue}>KES {amount || '5,000'}</Text>
            <Text style={styles.escrowText}>Held securely in Zora</Text>
          </View>

          <View style={styles.divider} />

          {/* PAYMENT METHOD */}
          <Text style={styles.sectionLabel}>Payment method</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, paymentMethod === 'mpesa' && styles.activeTab]}
              onPress={() => setPaymentMethod('mpesa')}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="mobile-alt"
                size={14}
                color={paymentMethod === 'mpesa' ? '#FF7255' : '#666666'}
              />
              <Text style={[styles.tabText, paymentMethod === 'mpesa' && styles.activeTabText]}>
                M-Pesa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, paymentMethod === 'pesalink' && styles.activeTab]}
              onPress={() => setPaymentMethod('pesalink')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="bank-transfer"
                size={16}
                color={paymentMethod === 'pesalink' ? '#FF7255' : '#666666'}
              />
              <Text style={[styles.tabText, paymentMethod === 'pesalink' && styles.activeTabText]}>
                PesaLink
              </Text>
            </TouchableOpacity>
          </View>

          {/* INPUT */}
          {paymentMethod === 'mpesa' ? (
            <View style={styles.inputGroup}>
              <View style={styles.phoneInputRow}>
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>+254</Text>
                </View>
                <TextInput
                  placeholder="712 345 678"
                  placeholderTextColor="#555555"
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={9}
                />
              </View>
              <Text style={styles.hintText}>An instant STK push will appear on your phone.</Text>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Bank account or PesaLink ID"
                placeholderTextColor="#555555"
                style={styles.fullInput}
                value={accountNumber}
                onChangeText={setAccountNumber}
                autoCapitalize="none"
              />
              <Text style={styles.hintText}>Secure bank-to-bank transfer via PesaLink.</Text>
            </View>
          )}

          {/* PAY BUTTON */}
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading}
            activeOpacity={0.85}
            style={[styles.payButton, loading && styles.payButtonDisabled]}
          >
            <Text style={styles.payButtonText}>
              {loading ? 'Processing…' : paymentMethod === 'mpesa' ? 'Pay via M-Pesa' : 'Pay via PesaLink'}
            </Text>
          </TouchableOpacity>

          {/* SECURITY NOTICE */}
          <Text style={styles.securityNotice}>
            Funds are protected by Zora and only released to the vendor after
            delivery is confirmed.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  headerTitle: {
    color: '#020202',
    fontSize: 17,
    fontWeight: '600',
  },

  /* ORDER */
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    color: '#888888',
    fontSize: 13,
  },
  pendingText: {
    color: '#FF7255',
    fontSize: 12,
    fontWeight: '600',
  },
  itemName: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 32,
  },

  /* AMOUNT */
  amountBlock: {
    marginBottom: 28,
  },
  priceLabel: {
    color: '#888888',
    fontSize: 13,
    marginBottom: 6,
  },
  priceValue: {
    color: '#060606',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  escrowText: {
    color: '#666666',
    fontSize: 12,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: '#1E1E1E',
    marginBottom: 28,
  },

  /* PAYMENT METHOD */
  sectionLabel: {
    color: '#888888',
    fontSize: 13,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242424',
  },
  activeTab: {
    borderColor: '#FF7255',
  },
  tabText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0b0b0b',
  },

  /* INPUTS */
  inputGroup: {
    marginBottom: 28,
  },
  phoneInputRow: {
    flexDirection: 'row',
    width: '100%',
  },
  prefixBox: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderColor: '#242424',
    borderRightWidth: 0,
  },
  prefixText: {
    color: '#070707',
    fontSize: 15,
  },
  input: {
    flex: 1,
    height: 52,
    color: '#020202',
    paddingHorizontal: 14,
    fontSize: 15,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: '#242424',
  },
  fullInput: {
    height: 52,
    width: '100%',
    color: '#000000',
    paddingHorizontal: 14,
    fontSize: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242424',
  },
  hintText: {
    color: '#666666',
    fontSize: 11.5,
    marginTop: 8,
  },

  /* PAY BUTTON */
  payButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FF3D20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonDisabled: {
    backgroundColor: '#6B2418',
  },
  payButtonText: {
    color: '#050404',
    fontSize: 15,
    fontWeight: '600',
  },

  /* SECURITY */
  securityNotice: {
    color: '#666666',
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
  },
});