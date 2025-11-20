import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialIcons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../types';
import {useAuth} from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {signup} = useAuth();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [policyError, setPolicyError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!isPolicyAccepted) {
      setPolicyError(true);
      setError('Please accept the terms to continue.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setPolicyError(false);

    const result = await signup(fullName.trim(), email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop',
        }}
        style={styles.backgroundImage}
        resizeMode="cover">
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.gradient}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {paddingBottom: Math.max(insets.bottom, 24)},
            ]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <MaterialIcons name="landscape" size={48} color="#00BFA5" />
                </View>
              </View>

              <Text style={styles.appName}>M-Hike</Text>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Create Account</Text>
                <Text style={styles.cardSubtitle}>
                  Join the adventure today
                </Text>

                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="person"
                    size={20}
                    color="#00BFA5"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="email"
                    size={20}
                    color="#00BFA5"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color="#00BFA5"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.eyeButton}>
                    <MaterialIcons
                      name={passwordVisible ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color="#00BFA5"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!confirmPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    style={styles.eyeButton}>
                    <MaterialIcons
                      name={
                        confirmPasswordVisible ? 'visibility' : 'visibility-off'
                      }
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsPolicyAccepted(!isPolicyAccepted);
                      setPolicyError(false);
                    }}
                    style={styles.checkbox}>
                    {isPolicyAccepted ? (
                      <MaterialIcons
                        name="check-box"
                        size={24}
                        color="#00BFA5"
                      />
                    ) : (
                      <MaterialIcons
                        name="check-box-outline-blank"
                        size={24}
                        color={policyError ? '#F44336' : '#666'}
                      />
                    )}
                  </TouchableOpacity>
                  <View style={styles.checkboxTextContainer}>
                    <Text style={styles.checkboxText}>
                      I agree to the{' '}
                      <Text
                        style={styles.policyLinkText}
                        onPress={() => navigation.navigate('PrivacyPolicy')}>
                        Privacy Policy
                      </Text>{' '}
                      and{' '}
                      <Text
                        style={styles.policyLinkText}
                        onPress={() => navigation.navigate('TermsOfService')}>
                        Terms of Use
                      </Text>
                      .
                    </Text>
                  </View>
                </View>

                {policyError && (
                  <Text style={styles.policyErrorText}>
                    Please accept the terms to continue.
                  </Text>
                )}

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSignup}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>SIGN UP</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.linkContainer}>
                <Text style={styles.linkText}>
                  Already have an account?{' '}
                  <Text style={styles.linkBold}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 4,
  },
  checkbox: {
    marginRight: 8,
    marginTop: 2,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  policyLinkText: {
    color: '#00BFA5',
    fontWeight: 'bold',
  },
  policyErrorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 32,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00BFA5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linkContainer: {
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#fff',
  },
  linkBold: {
    color: '#00BFA5',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
