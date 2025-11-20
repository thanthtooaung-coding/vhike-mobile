import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'PrivacyPolicy' | 'TermsOfService'>;

const PRIVACY_POLICY_TEXT = `Privacy Policy

Last updated: November 2025

1. Introduction
Welcome to M-Hike. We respect your privacy and are committed to protecting your personal data.

2. Information We Collect
- Personal information (name, email address)
- Hiking data (hikes, observations, photos)
- Location data (when you use map features)

3. How We Use Your Information
- To provide and improve our services
- To personalize your experience
- To communicate with you

4. Data Storage
Your data is stored locally on your device. We do not transmit your personal information to external servers without your consent.

5. Your Rights
You have the right to:
- Access your personal data
- Delete your account and data
- Request data export

6. Contact Us
If you have questions about this Privacy Policy, please contact us.`;

const TERMS_OF_SERVICE_TEXT = `Terms of Service

Last updated: November 2025

1. Acceptance of Terms
By using M-Hike, you agree to be bound by these Terms of Service.

2. Use of Service
- You must be at least 13 years old to use this service
- You are responsible for maintaining the security of your account
- You agree not to misuse the service

3. User Content
- You retain ownership of content you create
- You grant us a license to use your content to provide the service
- You are responsible for the content you create

4. Prohibited Activities
- Violating any laws
- Infringing on intellectual property rights
- Harassing or harming others

5. Disclaimer
The service is provided "as is" without warranties of any kind.

6. Limitation of Liability
We are not liable for any indirect, incidental, or consequential damages.

7. Changes to Terms
We reserve the right to modify these terms at any time.

8. Contact
For questions about these Terms, please contact us.`;

const TextContentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const insets = useSafeAreaInsets();
  const isPrivacyPolicy = route.name === 'PrivacyPolicy';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        <Text style={styles.text}>
          {isPrivacyPolicy ? PRIVACY_POLICY_TEXT : TERMS_OF_SERVICE_TEXT}
        </Text>
      </ScrollView>
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
  text: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
});

export default TextContentScreen;

