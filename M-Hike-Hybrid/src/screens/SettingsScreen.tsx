import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MaterialIcons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../types';
import {useAuth} from '../context/AuthContext';
import {useAppContext} from '../context/AppContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {currentUser, logout} = useAuth();
  const {deleteAllHikes} = useAppContext();
  const insets = useSafeAreaInsets();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
  };

  const handleResetDatabase = async () => {
    setShowResetDialog(false);
    try {
      await deleteAllHikes();
      Alert.alert('Success', 'All hikes have been deleted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset database.');
    }
  };

  const getInitials = (name: string): string => {
    const words = name.split(' ').slice(0, 2);
    const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
    return initials || 'U';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.settingsGroup}>
          {currentUser && (
            <>
              <View style={styles.userProfileItem}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {getInitials(currentUser.fullName)}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{currentUser.fullName}</Text>
                  <Text style={styles.userEmail}>{currentUser.email}</Text>
                </View>
              </View>
              <View style={styles.divider} />
            </>
          )}

          <SettingsItem
            icon="person"
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="lock"
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="exit-to-app"
            title="Log Out"
            iconColor="#666"
            textColor="#F44336"
            showChevron={false}
            onPress={() => setShowLogoutDialog(true)}
          />
        </View>

        <View style={styles.spacer} />

        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.settingsGroup}>
          <SettingsItem
            icon="security"
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="description"
            title="Terms of Service"
            onPress={() => navigation.navigate('TermsOfService')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="info"
            title="App Version"
            value="1.0.0"
            showChevron={false}
            onPress={() => {}}
          />
        </View>

        <View style={styles.spacer} />

        <Text style={[styles.sectionHeader, styles.dangerText]}>DANGER ZONE</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={() => setShowResetDialog(true)}>
            <View style={styles.dangerIconContainer}>
              <MaterialIcons name="delete" size={24} color="#F44336" />
            </View>
            <View style={styles.dangerTextContainer}>
              <Text style={styles.dangerTitle}>Reset Database</Text>
              <Text style={styles.dangerSubtitle}>
                Permanently delete all hikes.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showLogoutDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Log Out</Text>
            <Text style={styles.dialogText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.dialogButton}
                onPress={() => setShowLogoutDialog(false)}>
                <Text style={styles.dialogButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonDanger]}
                onPress={handleLogout}>
                <Text
                  style={[
                    styles.dialogButtonText,
                    styles.dialogButtonTextDanger,
                  ]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showResetDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Reset Database</Text>
            <Text style={styles.dialogText}>
              Are you sure you want to permanently delete all hikes? This action
              cannot be undone.
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.dialogButton}
                onPress={() => setShowResetDialog(false)}>
                <Text style={styles.dialogButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonDanger]}
                onPress={handleResetDatabase}>
                <Text
                  style={[
                    styles.dialogButtonText,
                    styles.dialogButtonTextDanger,
                  ]}>
                  Delete All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const SettingsItem: React.FC<{
  icon: string;
  title: string;
  value?: string;
  iconColor?: string;
  textColor?: string;
  showChevron?: boolean;
  onPress: () => void;
}> = ({
  icon,
  title,
  value,
  iconColor = '#00BFA5',
  textColor = '#000',
  showChevron = true,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={[styles.iconContainer, {backgroundColor: `${iconColor}1A`}]}>
        <MaterialIcons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={[styles.settingsItemText, {color: textColor}]}>{title}</Text>
      {value && <Text style={styles.settingsItemValue}>{value}</Text>}
      {showChevron && (
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 24,
  },
  dangerText: {
    color: '#F44336',
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  userProfileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00BFA5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F3F7',
    marginLeft: 72,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  settingsItemValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  spacer: {
    height: 24,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerTextContainer: {
    flex: 1,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F44336',
    marginBottom: 4,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  dialogText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dialogButtonDanger: {},
  dialogButtonText: {
    fontSize: 16,
    color: '#000',
  },
  dialogButtonTextDanger: {
    color: '#F44336',
  },
});

export default SettingsScreen;

