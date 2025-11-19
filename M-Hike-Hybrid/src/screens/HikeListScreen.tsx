import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList, Hike} from '../types';
import {useAppContext} from '../context/AppContext';
import {format} from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HikeListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {hikes, loadHikes, deleteHike} = useAppContext();
  const [loading, setLoading] = useState(true);
  const [hikeToDelete, setHikeToDelete] = useState<Hike | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await loadHikes();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDelete = (hike: Hike) => {
    Alert.alert(
      'Delete Hike',
      `Are you sure you want to delete '${hike.hikeName}'? This will also delete all its observations.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHike(hike);
            setHikeToDelete(null);
          },
        },
      ]
    );
  };

  const renderHikeItem = ({item}: {item: Hike}) => (
    <TouchableOpacity
      style={styles.hikeCard}
      onPress={() => navigation.navigate('HikeDetail', {hikeId: item.id})}
      activeOpacity={0.7}>
      <View style={styles.hikeContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="landscape" size={32} color="#00897B" />
        </View>
        <View style={styles.hikeInfo}>
          <Text style={styles.hikeName}>{item.hikeName}</Text>
          <Text style={styles.hikeLocation}>{item.location}</Text>
          <Text style={styles.hikeMeta}>
            {format(item.hikeDate, 'MMM dd, yyyy')} • {item.hikeLength} km
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('SearchHikes')}
          style={styles.searchButton}>
                    <MaterialIcons name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {hikes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hikes yet. Tap the '+' button to add one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={hikes}
          renderItem={renderHikeItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHike')}
        activeOpacity={0.8}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  hikeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  hikeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 137, 123, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hikeInfo: {
    flex: 1,
  },
  hikeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  hikeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  hikeMeta: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00897B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HikeListScreen;

