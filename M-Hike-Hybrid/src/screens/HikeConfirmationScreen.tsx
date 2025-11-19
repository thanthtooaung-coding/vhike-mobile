import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList, Hike} from '../types';
import {useAppContext} from '../context/AppContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'HikeConfirmation'>;

const HikeConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const {hikeId} = route.params;
  const {getHikeById} = useAppContext();
  const [hike, setHike] = useState<Hike | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHike();
  }, [hikeId]);

  const loadHike = async () => {
    const hikeData = await getHikeById(hikeId);
    setHike(hikeData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.title}>Hike Saved!</Text>
        {hike && (
          <>
            <Text style={styles.hikeName}>{hike.hikeName}</Text>
            <Text style={styles.location}>{hike.location}</Text>
          </>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('HikeList')}>
            <Text style={styles.buttonText}>Back to Hikes</Text>
          </TouchableOpacity>
          {hike && (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() =>
                navigation.navigate('AddHike', {hikeId: hike.id})
              }>
              <MaterialIcons name="edit" size={20} color="#00897B" />
              <Text style={styles.editButtonText}>Edit Hike</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  hikeName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#00897B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00897B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#00897B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HikeConfirmationScreen;

