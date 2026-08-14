import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isSmallScreen = height < 700;
  const horizontalPadding = Math.max(20, width * 0.055);

  const handleLogin = () => {
    // Temporary navigation.
    // We will connect this to the backend later.
    router.replace('/(seller)/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#111111"
      />

      <LinearGradient
        colors={['#FF3B30', '#D71920', '#111111']}
        locations={[0, 0.42, 0.9]}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: horizontalPadding,
                paddingTop: isSmallScreen ? 22 : 42,
                paddingBottom: isSmallScreen ? 24 : 36,
              },
            ]}
          >
            {/* HEADER */}
            <View
              style={[
                styles.header,
                {
                  marginBottom: isSmallScreen ? 24 : 34,
                },
              ]}
            >
              <View
                style={[
                  styles.logoContainer,
                  {
                    width: isSmallScreen ? 58 : 66,
                    height: isSmallScreen ? 58 : 66,
                    borderRadius: isSmallScreen ? 29 : 33,
                  },
                ]}
              >
                <FontAwesome
                  name="handshake-o"
                  size={isSmallScreen ? 28 : 32}
                  color="#FFFFFF"
                />
              </View>

              <Text
                style={[
                  styles.logoText,
                  {
                    fontSize: isSmallScreen ? 30 : 34,
                  },
                ]}
              >
                zora
              </Text>

              <Text style={styles.subtitle}>
                Transactions you can trust.
              </Text>
            </View>

            {/* LOGIN CARD */}
            <View style={styles.card}>
              <Text style={styles.title}>
                Welcome back
              </Text>

              <Text style={styles.cardSubtitle}>
                Sign in to continue to your Zora account.
              </Text>

              {/* EMAIL */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>

                <View style={styles.inputContainer}>
                  <AntDesign
                    name="mail"
                    size={18}
                    color="#FF3B30"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#8A8A8A"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>

                <View style={styles.inputContainer}>
                  <AntDesign
                    name="lock"
                    size={18}
                    color="#FF3B30"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#8A8A8A"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-outline'
                          : 'eye-off-outline'
                      }
                      size={21}
                      color="#999999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* FORGOT */}
              <TouchableOpacity
                style={styles.forgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {/* LOGIN */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
              >
                <LinearGradient
                  colors={['#FF5548', '#FF3B30', '#E51B23']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>
                    Log in
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* DIVIDER */}
              <View style={styles.orContainer}>
                <View style={styles.line} />

                <Text style={styles.orText}>
                  Or continue with
                </Text>

                <View style={styles.line} />
              </View>

              {/* SOCIAL */}
              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                >
                  <AntDesign
                    name="google"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text style={styles.socialButtonText}>
                    Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.8}
                >
                  <AntDesign
                    name="apple"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text style={styles.socialButtonText}>
                    Apple
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SIGN UP */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push('/(auth)/signup')
                }
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>
                  {' '}Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },

  background: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  /* HEADER */

  header: {
    alignItems: 'center',
  },

  logoContainer: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },

  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -1.5,
    marginBottom: 4,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },

  /* CARD */

  card: {
    backgroundColor: '#111111',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 16,

    elevation: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },

  cardSubtitle: {
    color: '#8F8F8F',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    color: '#D0D0D0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },

  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191919',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#303030',
  },

  inputIcon: {
    marginLeft: 15,
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },

  eyeButton: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
  },

  /* FORGOT */

  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -2,
    marginBottom: 18,
  },

  forgotPasswordText: {
    color: '#FF7255',
    fontSize: 12,
    fontWeight: '600',
  },

  /* LOGIN */

  loginButton: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* DIVIDER */

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#303030',
  },

  orText: {
    color: '#777777',
    fontSize: 11,
    paddingHorizontal: 10,
  },

  /* SOCIAL */

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
    backgroundColor: '#1A1A1A',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#303030',
  },

  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* FOOTER */

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  footerText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
  },

  footerLink: {
    color: '#FF8A76',
    fontSize: 13,
    fontWeight: '700',
  },
});