import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function CreateScreen() {
  const router = useRouter();

  const [product, setProduct] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const pickProductImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          'Zora needs access to your photos so you can attach a product image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setProductImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);

      Alert.alert(
        'Unable to select photo',
        'Something went wrong while selecting the image. Please try again.'
      );
    }
  };

  const validateForm = () => {
    if (!product.trim()) {
      Alert.alert(
        'Missing product',
        'Please enter what you are selling.'
      );
      return false;
    }

    if (product.trim().length < 2) {
      Alert.alert(
        'Invalid product',
        'Please enter a valid product name.'
      );
      return false;
    }

    if (!price.trim()) {
      Alert.alert(
        'Missing price',
        'Please enter the transaction amount.'
      );
      return false;
    }

    const numericPrice = Number(price.replace(/,/g, ''));

    if (isNaN(numericPrice)) {
      Alert.alert(
        'Invalid price',
        'Please enter a valid transaction amount.'
      );
      return false;
    }

    if (numericPrice <= 0) {
      Alert.alert(
        'Invalid price',
        'The transaction amount must be greater than KSh 0.'
      );
      return false;
    }

    if (buyerName.trim().length === 1) {
      Alert.alert(
        'Invalid buyer name',
        'Please enter a valid buyer name or leave it empty.'
      );
      return false;
    }

    return true;
  };

  const handleCreateTransaction = async () => {
    if (isCreating) return;

    const isValid = validateForm();

    if (!isValid) return;

    try {
      setIsCreating(true);

      const numericPrice = Number(price.replace(/,/g, ''));

      /*
       * For now, create a local transaction object.
       *
       * When your backend is ready, this is where you will
       * send this object to your API/database.
       */
      const transaction = {
        id: `ZR-${Date.now()}`,
        product: product.trim(),
        description: description.trim(),
        price: numericPrice,
        buyerName: buyerName.trim(),
        productImage,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      console.log('Transaction created:', transaction);

      router.push({
        pathname: '/transaction-created',
        params: {
          transactionId: transaction.id,
          product: transaction.product,
          description: transaction.description,
          price: String(transaction.price),
          buyerName: transaction.buyerName,
          productImage: transaction.productImage ?? '',
        },
      });
    } catch (error) {
      console.error('Transaction creation error:', error);

      Alert.alert(
        'Something went wrong',
        'We could not create the transaction. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SELLER</Text>

          <Text style={styles.title}>Create transaction</Text>

          <Text style={styles.subtitle}>
            Create a secure transaction and send it to your buyer.
          </Text>
        </View>

        {/* Product name */}
        <View style={styles.section}>
          <Text style={styles.label}>Product name</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Nike Air Force 1"
            placeholderTextColor="#A3A3A3"
            value={product}
            onChangeText={setProduct}
            maxLength={100}
            editable={!isCreating}
          />
        </View>

        {/* Product image */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Product photo</Text>
            <Text style={styles.optional}>Optional</Text>
          </View>

          {productImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
              />

              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickProductImage}
                disabled={isCreating}
              >
                <Text style={styles.changeImageText}>
                  Change photo
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickProductImage}
              activeOpacity={0.8}
              disabled={isCreating}
            >
              <View style={styles.imagePickerIcon}>
                <Text style={styles.plus}>+</Text>
              </View>

              <View>
                <Text style={styles.imagePickerTitle}>
                  Add product photo
                </Text>

                <Text style={styles.imagePickerSubtitle}>
                  Help your buyer identify the item
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.optional}>Optional</Text>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add details the buyer should know"
            placeholderTextColor="#A3A3A3"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={500}
            editable={!isCreating}
          />

          <Text style={styles.characterCount}>
            {description.length}/500
          </Text>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.currency}>KSh</Text>

            <TextInput
              style={styles.priceInput}
              placeholder="0"
              placeholderTextColor="#A3A3A3"
              value={price}
              onChangeText={(text) => {
                // Allow only numbers and decimal point
                const cleaned = text.replace(/[^0-9.]/g, '');

                // Prevent multiple decimal points
                const parts = cleaned.split('.');

                if (parts.length > 2) {
                  return;
                }

                setPrice(cleaned);
              }}
              keyboardType="decimal-pad"
              maxLength={12}
              editable={!isCreating}
            />
          </View>
        </View>

        {/* Buyer */}
        <View style={styles.buyerSection}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle}>Buyer</Text>
            <Text style={styles.optional}>Optional</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="e.g. John"
            placeholderTextColor="#A3A3A3"
            value={buyerName}
            onChangeText={setBuyerName}
            maxLength={100}
            editable={!isCreating}
          />
        </View>

        {/* Information */}
        <View style={styles.info}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>i</Text>
          </View>

          <Text style={styles.infoText}>
            The buyer will receive a secure transaction link. They
            don't need to already have a Zora account.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.button,
            isCreating && styles.buttonDisabled,
          ]}
          onPress={handleCreateTransaction}
          activeOpacity={0.85}
          disabled={isCreating}
        >
          {isCreating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.buttonText}>
                Creating...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              Create transaction
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 32,
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
    maxWidth: 330,
  },

  section: {
    marginBottom: 20,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },

  optional: {
    fontSize: 11,
    color: '#999999',
  },

  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#111111',
  },

  textArea: {
    height: 90,
    paddingTop: 14,
    paddingRight: 15,
  },

  characterCount: {
    textAlign: 'right',
    marginTop: 5,
    fontSize: 10,
    color: '#999999',
  },

  imagePicker: {
    height: 82,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  imagePickerIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  plus: {
    fontSize: 25,
    fontWeight: '300',
    color: '#FF3B30',
  },

  imagePickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 3,
  },

  imagePickerSubtitle: {
    fontSize: 11,
    color: '#888888',
  },

  imageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  productImage: {
    width: '100%',
    height: 190,
  },

  changeImageButton: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeImageText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },

  priceContainer: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },

  currency: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginRight: 10,
  },

  priceInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    color: '#111111',
  },

  buyerSection: {
    marginTop: 8,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    paddingVertical: 16,
    marginBottom: 24,
  },

  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },

  infoIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#737373',
  },

  button: {
    height: 54,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});