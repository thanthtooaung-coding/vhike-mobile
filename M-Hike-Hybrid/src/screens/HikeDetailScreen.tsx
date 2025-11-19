import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList, Hike, Observation} from '../types';
import {useAppContext} from '../context/AppContext';
import {format} from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'HikeDetail'>;

const HikeDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const {hikeId} = route.params;
  const {getHikeById, getObservationsForHike} = useAppContext();
  const [hike, setHike] = useState<Hike | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [hikeId]);

  const loadData = async () => {
    setLoading(true);
    const hikeData = await getHikeById(hikeId);
    const observationsData = await getObservationsForHike(hikeId);
    setHike(hikeData);
    setObservations(observationsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  if (!hike) {
    return (
      <View style={styles.centerContainer}>
        <Text>Hike not found</Text>
      </View>
    );
  }

  const renderObservation = ({item}: {item: Observation}) => (
    <TouchableOpacity
      style={styles.observationCard}
      onPress={() =>
        navigation.navigate('ObservationDetail', {observationId: item.id})
      }>
      <Text style={styles.observationText} numberOfLines={2}>
        {item.observationText}
      </Text>
      <Text style={styles.observationTime}>
        {format(item.observationTime, 'MMM dd, yyyy HH:mm')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.hikeName}>{hike.hikeName}</Text>
          <Text style={styles.location}>{hike.location}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color="#00897B" />
            <Text style={styles.infoText}>
              {format(hike.hikeDate, 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="straighten" size={20} color="#00897B" />
            <Text style={styles.infoText}>{hike.hikeLength} km</Text>
          </View>
          {hike.duration && (
            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={20} color="#00897B" />
              <Text style={styles.infoText}>{hike.duration}</Text>
            </View>
          )}
          {hike.elevation && (
            <View style={styles.infoRow}>
              <MaterialIcons name="terrain" size={20} color="#00897B" />
              <Text style={styles.infoText}>{hike.elevation} m</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <MaterialIcons name="signal-cellular-alt" size={20} color="#00897B" />
            <Text style={styles.infoText}>{hike.difficultyLevel}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="directions-walk" size={20} color="#00897B" />
            <Text style={styles.infoText}>{hike.trailType}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons
              name={hike.parkingAvailable ? 'check-circle' : 'cancel'}
              size={20}
              color={hike.parkingAvailable ? '#4CAF50' : '#F44336'}
            />
            <Text style={styles.infoText}>
              Parking: {hike.parkingAvailable ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>

        {hike.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{hike.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Observations</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AddObservation', {hikeId: hike.id})
              }
              style={styles.addButton}>
              <MaterialIcons name="add" size={20} color="#00897B" />
            </TouchableOpacity>
          </View>
          {observations.length === 0 ? (
            <Text style={styles.emptyText}>No observations yet</Text>
          ) : (
            <FlatList
              data={observations}
              renderItem={renderObservation}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
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
  section: {
    marginBottom: 24,
  },
  hikeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    padding: 8,
  },
  observationCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  observationText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  observationTime: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default HikeDetailScreen;

