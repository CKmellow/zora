import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';

import { getTransaction } from '../../lib/transactions';
import { Transaction } from '../../types/transaction';

export default function TransactionCreatedScreen() {
  const router = useRouter();

  const { transactionId } = useLocalSearchParams<{
    transactionId?: string;
  }>();

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransaction = async () => {
      if (!transactionId) {
        setIsLoading(false);
        return;
      }

      try {
        const storedTransaction =
          await getTransaction(transactionId);

        setTransaction(storedTransaction);
      } catch (error) {
        console.error(
          'Failed to load transaction:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadTransaction();
  }, [transactionId]);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#FF3B30"
        />

        <Text style={styles.loadingText}>
          Loading transaction...
        </Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorTitle}>
          Transaction not found
        </Text>

        <Text style={styles.errorText}>
          We couldn't find this transaction on this device.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.replace('/(seller)/(tabs)')
          }
        >
          <Text style={styles.primaryButtonText}>
            Back to home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const reference = transaction.id;

  const formattedPrice =
    `KSh ${transaction.price.toLocaleString('en-KE')}`;

  const transactionLink =
    `https://zora.app/t/${reference}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `You've got a Zora transaction.\n\n` +
          `${transaction.product}\n` +
          `${formattedPrice}\n\n` +
          `Review and pay securely:\n` +
          `${transactionLink}`,
      });
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(transactionLink);

      Alert.alert(
        'Link copied',
        'The transaction link has been copied to your clipboard.'
      );
    } catch (error) {
      console.log('Copy failed:', error);

      Alert.alert(
        'Unable to copy',
        'We could not copy the transaction link. Please try sharing it instead.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <View style={styles.successCircle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text style={styles.title}>
          Transaction created
        </Text>

        <Text style={styles.subtitle}>
          Your transaction is ready. Share it with your buyer to continue.
        </Text>

        <View style={styles.transaction}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionLabel}>
              TRANSACTION
            </Text>

            <Text style={styles.reference}>
              {reference}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.product}>
            {transaction.product}
          </Text>

          <Text style={styles.price}>
            {formattedPrice}
          </Text>

          {transaction.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.metaLabel}>
                Description
              </Text>

              <Text style={styles.description}>
                {transaction.description}
              </Text>
            </View>
          ) : null}

          {transaction.buyerName ? (
            <View style={styles.buyerRow}>
              <Text style={styles.metaLabel}>
                Buyer
              </Text>

              <Text style={styles.metaValue}>
                {transaction.buyerName}
              </Text>
            </View>
          ) : null}

          <View style={styles.statusRow}>
            <View style={styles.statusDot} />

            <Text style={styles.status}>
              Awaiting buyer payment
            </Text>
          </View>
        </View>

        <View style={styles.shareInfo}>
          <Text style={styles.shareTitle}>
            Send this to your buyer
          </Text>

          <Text style={styles.shareText}>
            They can open the transaction and pay securely
            without having a Zora account.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              Share transaction
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCopy}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>
              Copy transaction link
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.replace('/(seller)/(tabs)')
          }
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            Back to home
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#737373',
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    marginBottom: 24,
  },

  successCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  check: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '500',
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

  transaction: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 18,
    marginTop: 32,
  },

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  transactionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#999999',
  },

  reference: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
    maxWidth: 150,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },

  product: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },

  price: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111111',
    marginTop: 5,
    marginBottom: 20,
  },

  descriptionContainer: {
    marginBottom: 15,
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
    marginTop: 5,
  },

  buyerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  metaLabel: {
    fontSize: 12,
    color: '#999999',
  },

  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 7,
  },

  status: {
    fontSize: 12,
    color: '#737373',
  },

  shareInfo: {
    marginTop: 25,
  },

  shareTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 5,
  },

  shareText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#737373',
  },

  actions: {
    marginTop: 24,
  },

  primaryButton: {
    height: 54,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    height: 54,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '600',
  },

  backButton: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },

  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#737373',
  },
});