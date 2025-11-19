import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList, Observation} from '../types';
import {useAppContext} from '../context/AppContext';
import {format} from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'ObservationDetail'>;

const ObservationDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const {observationId} = route.params;
  const {getObservationById, deleteObservation} = useAppContext();
  const [observation, setObservation] = useState<Observation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadObservation();
  }, [observationId]);

  const loadObservation = async () => {
    const observationData = await getObservationById(observationId);
    setObservation(observationData);
    setLoading(false);
  };

  const handleDelete = () => {
    if (!observation) return;
    Alert.alert(
      'Delete Observation',
      'Are you sure you want to delete this observation?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteObservation(observation);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  if (!observation) {
    return (
      <View style={styles.centerContainer}>
        <Text>Observation not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.time}>
            {format(observation.observationTime, 'MMM dd, yyyy HH:mm')}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AddObservation', {
                  hikeId: observation.hikeId,
                  observationId: observation.id,
                })
              }
              style={styles.actionButton}>
              <MaterialIcons name="edit" size={24} color="#00897B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}>
              <MaterialIcons name="delete" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.observationText}>{observation.observationText}</Text>
        </View>

        {observation.additionalComments && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Comments</Text>
            <Text style={styles.comments}>{observation.additionalComments}</Text>
          </View>
        )}

        {observation.photoUrl && (
          <View style={styles.section}>
            <Image
              source={{uri: observation.photoUrl}}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        )}

        {(observation.latitude || observation.longitude) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.location}>
              {observation.latitude?.toFixed(6)}, {observation.longitude?.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  observationText: {
    fontSize: 18,
    color: '#000',
    lineHeight: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  comments: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default ObservationDetailScreen;

