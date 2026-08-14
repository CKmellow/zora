import React, { useState } from 'react';
import {
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

import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Role = 'buyer' | 'seller';

export default function SignUpScreen() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    // Replace this simulation with your actual signup/API call.
    setTimeout(() => {
      setLoading(false);
      router.push(role === 'buyer' ? '/(buyer)/home' : '/(seller)/home');
    }, 1500);
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
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ width: 20 }} />
          </View>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Join <Text style={styles.brandName}>Zora</Text> and trade with confidence
          </Text>

          {/* ROLE SELECTOR */}
          <Text style={styles.sectionLabel}>I want to</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleCard, role === 'buyer' && styles.roleCardActive]}
              onPress={() => setRole('buyer')}
              activeOpacity={0.7}
            >
              <View style={styles.roleIcon}>
                <FontAwesome5
                  name="shopping-bag"
                  size={15}
                  color={role === 'buyer' ? '#FF7255' : '#666666'}
                />
              </View>
              <Text style={[styles.roleTitle, role === 'buyer' && styles.roleTitleActive]}>
                Buy
              </Text>
              <Text style={styles.roleSubtext}>Shop with escrow protection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, role === 'seller' && styles.roleCardActive]}
              onPress={() => setRole('seller')}
              activeOpacity={0.7}
            >
              <View style={styles.roleIcon}>
                <FontAwesome5
                  name="store"
                  size={15}
                  color={role === 'seller' ? '#FF7255' : '#666666'}
                />
              </View>
              <Text style={[styles.roleTitle, role === 'seller' && styles.roleTitleActive]}>
                Sell
              </Text>
              <Text style={styles.roleSubtext}>Get paid, dispute-free</Text>
            </TouchableOpacity>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {role === 'buyer' ? 'Full name' : 'Business / shop name'}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name={role === 'buyer' ? 'user' : 'shoppingcart'}
                  size={18}
                  color="#FF6045"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={role === 'buyer' ? 'Jane Wanjiru' : 'Nairobi Thrifts'}
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <AntDesign name="mail" size={18} color="#FF6045" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <AntDesign name="lock" size={18} color="#FF6045" style={styles.inputIcon} />
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor="#666"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.inputContainer}>
                <AntDesign name="lock" size={18} color="#FF6045" style={styles.inputIcon} />
                <TextInput
                  placeholder="Re-enter your password"
                  placeholderTextColor="#666"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating account…' : `Sign up as a ${role}`}
              </Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By signing up, you agree to Zora's Terms of Service and Privacy Policy.
            </Text>

            {/* DIVIDER */}
            <View style={styles.orContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>Or continue with</Text>
              <View style={styles.line} />
            </View>

            {/* SOCIAL BUTTONS */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <AntDesign name="google" size={18} color="#FFFFFF" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <AntDesign name="apple" size={19} color="#FFFFFF" />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}> Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  flex: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 28,
  },
  brandName: {
    color: '#FF7255',
    fontWeight: '700',
  },

  /* ROLE SELECTOR */
  sectionLabel: {
    color: '#888888',
    fontSize: 13,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  roleCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  roleCardActive: {
    borderColor: '#FF7255',
  },
  roleIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(255,114,85,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleTitle: {
    color: '#CCCCCC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  roleTitleActive: {
    color: '#FFFFFF',
  },
  roleSubtext: {
    color: '#666666',
    fontSize: 11,
    lineHeight: 15,
  },

  /* FORM */
  form: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#AAAAAA',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 7,
  },
  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242424',
  },
  inputIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
  },

  errorText: {
    color: '#F87171',
    fontSize: 12.5,
    marginBottom: 14,
  },

  /* SIGN UP BUTTON */
  signUpButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FF3D20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  signUpButtonDisabled: {
    backgroundColor: '#6B2418',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  termsText: {
    color: '#555555',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 24,
  },

  /* DIVIDER */
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E1E1E',
  },
  orText: {
    color: '#666666',
    fontSize: 12,
    paddingHorizontal: 10,
  },

  /* SOCIAL BUTTONS */
  socialContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242424',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },

  /* FOOTER */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#888888',
    fontSize: 13,
  },
  footerLink: {
    color: '#FF7255',
    fontSize: 13,
    fontWeight: '700',
  },
});