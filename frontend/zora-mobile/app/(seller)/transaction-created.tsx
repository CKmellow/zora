import { useRouter } from 'expo-router';
import {
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TransactionCreatedScreen() {
  const router = useRouter();

  const transaction = {
    product: 'Nike Air Force 1',
    price: 'KSh 10,000',
    buyer: 'John',
    reference: 'ZORA-48291',
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `You've got a Zora transaction.\n\n` +
          `${transaction.product}\n` +
          `${transaction.price}\n\n` +
          `Review and pay securely:\n` +
          `https://zora.app/t/${transaction.reference}`,
      });
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  const handleCopy = () => {
    console.log(
      `https://zora.app/t/${transaction.reference}`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        {/* Success indicator */}
        <View style={styles.successCircle}>
          <Text style={styles.check}>✓</Text>
        </View>

        {/* Heading */}
        <Text style={styles.title}>
          Transaction created
        </Text>

        <Text style={styles.subtitle}>
          Your transaction is ready. Share it with your buyer to continue.
        </Text>

        {/* Transaction */}
        <View style={styles.transaction}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionLabel}>
              TRANSACTION
            </Text>

            <Text style={styles.reference}>
              {transaction.reference}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.product}>
            {transaction.product}
          </Text>

          <Text style={styles.price}>
            {transaction.price}
          </Text>

          {transaction.buyer ? (
            <View style={styles.buyerRow}>
              <Text style={styles.metaLabel}>Buyer</Text>
              <Text style={styles.metaValue}>
                {transaction.buyer}
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

        {/* Share information */}
        <View style={styles.shareInfo}>
          <Text style={styles.shareTitle}>
            Send this to your buyer
          </Text>

          <Text style={styles.shareText}>
            They can open the transaction and pay securely
            without having a Zora account.
          </Text>
        </View>

        {/* Actions */}
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

        {/* Back */}
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
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