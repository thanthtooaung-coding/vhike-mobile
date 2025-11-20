import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList} from '../types';
import {useAuth} from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {changePassword} = useAuth();
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await changePassword(
      currentPassword.trim(),
      newPassword.trim(),
      confirmPassword.trim()
    );
    setLoading(false);

    if (result.success) {
      navigation.goBack();
    } else {
      setError(result.error || 'Failed to change password');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <Text style={styles.infoText}>
          Your new password must be different from previous used passwords.
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          passwordVisible={currentPasswordVisible}
          onToggleVisibility={() => setCurrentPasswordVisible(!currentPasswordVisible)}
          placeholder="Enter current password"
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          passwordVisible={newPasswordVisible}
          onToggleVisibility={() => setNewPasswordVisible(!newPasswordVisible)}
          placeholder="Enter new password"
        />
        <Text style={styles.hintText}>Must be at least 6 characters.</Text>

        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          passwordVisible={confirmPasswordVisible}
          onToggleVisibility={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          placeholder="Re-enter new password"
        />
      </ScrollView>

      <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  passwordVisible: boolean;
  onToggleVisibility: () => void;
  placeholder: string;
}> = ({label, value, onChangeText, passwordVisible, onToggleVisibility, placeholder}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeButton}>
          <MaterialIcons
            name={passwordVisible ? 'visibility' : 'visibility-off'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#F2F3F7',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    marginLeft: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#00BFA5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;

