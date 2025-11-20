import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
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
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Observations, 1 = Map
  const insets = useSafeAreaInsets();

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
        <ActivityIndicator size="large" color="#00BFA5" />
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
      {item.photoUrl && (
        <Image
          source={{uri: item.photoUrl}}
          style={styles.observationImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.observationContent}>
      <Text style={styles.observationText} numberOfLines={2}>
        {item.observationText}
      </Text>
      <Text style={styles.observationTime}>
          Time: {format(item.observationTime, 'h:mm a')}
      </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerMap}>
        {hike.latitude && hike.longitude ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: hike.latitude,
              longitude: hike.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            scrollEnabled={selectedTab === 1}
            zoomEnabled={selectedTab === 1}
            rotateEnabled={selectedTab === 1}
            pitchEnabled={selectedTab === 1}>
            <Marker
              coordinate={{
                latitude: hike.latitude,
                longitude: hike.longitude,
              }}
              title={hike.hikeName}
            />
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>No map data available</Text>
          </View>
        )}
        <View style={styles.mapOverlay}>
          <Text style={styles.overlayHikeName}>{hike.hikeName}</Text>
          <Text style={styles.overlayLocation}>{hike.location}</Text>
          </View>
        </View>

      <View style={styles.statsRow}>
        <StatItem value={`${hike.hikeLength} km`} label="DISTANCE" />
        <StatItem value={hike.duration || 'N/A'} label="DURATION" />
        <StatItem
          value={hike.elevation ? `${hike.elevation} ft` : 'N/A'}
          label="ELEVATION"
        />
          </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 0 && styles.tabActive]}
          onPress={() => setSelectedTab(0)}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 0 && styles.tabTextActive,
            ]}>
            Observations
          </Text>
        </TouchableOpacity>
            <TouchableOpacity
          style={[styles.tab, selectedTab === 1 && styles.tabActive]}
          onPress={() => setSelectedTab(1)}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 1 && styles.tabTextActive,
            ]}>
            Map
          </Text>
            </TouchableOpacity>
          </View>

      {selectedTab === 0 ? (
        <ScrollView style={styles.content}>
          {observations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No observations yet. Tap the '+' button to add one!
              </Text>
            </View>
          ) : (
            <View style={styles.observationsContainer}>
              {observations.map(obs => (
                <TouchableOpacity
                  key={obs.id}
                  style={styles.observationCard}
                  onPress={() =>
                    navigation.navigate('ObservationDetail', {
                      observationId: obs.id,
                    })
                  }>
                  {obs.photoUrl && (
                    <Image
                      source={{uri: obs.photoUrl}}
                      style={styles.observationImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.observationContent}>
                    <Text style={styles.observationText} numberOfLines={2}>
                      {obs.observationText}
                    </Text>
                    <Text style={styles.observationTime}>
                      Time: {format(obs.observationTime, 'h:mm a')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.mapTabContent}>
        </View>
      )}

      {selectedTab === 0 && (
        <TouchableOpacity
          style={[styles.fab, {bottom: Math.max(insets.bottom, 16)}]}
          onPress={() => navigation.navigate('AddObservation', {hikeId: hike.id})}
          activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const StatItem: React.FC<{value: string; label: string}> = ({value, label}) => {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  headerMap: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F2F3F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: '#666',
    fontSize: 16,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 16,
  },
  overlayHikeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  overlayLocation: {
    fontSize: 16,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00BFA5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#00BFA5',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  tabTextActive: {
    color: '#00BFA5',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mapTabContent: {
    flex: 1,
  },
  observationsContainer: {
    padding: 16,
    gap: 12,
  },
  observationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  observationImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  },
  observationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  observationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  observationTime: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00BFA5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HikeDetailScreen;
