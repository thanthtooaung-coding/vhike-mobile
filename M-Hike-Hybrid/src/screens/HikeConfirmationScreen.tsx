import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {RootStackParamList, Hike} from '../types';
import {useAppContext} from '../context/AppContext';
import {format} from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'HikeConfirmation'>;

const HikeConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const {hikeId} = route.params;
  const {getHikeById, deleteHike} = useAppContext();
  const [hike, setHike] = useState<Hike | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadHike();
  }, [hikeId]);

  const loadHike = async () => {
    const hikeData = await getHikeById(hikeId);
    setHike(hikeData);
    setLoading(false);
  };

  const handleDiscard = () => {
    if (hike) {
      deleteHike(hike);
      navigation.navigate('HikeList');
    }
  };

  const handleEdit = () => {
    if (hike) {
      navigation.navigate('AddHike', {hikeId: hike.id});
    }
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
        <Text>Hike not found or loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, {paddingTop: insets.top}]}>
        <TouchableOpacity
          onPress={() => setShowCancelDialog(true)}
          style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Hike Confirmation</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('HikeList')}
          style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.mapContainer}>
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
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}>
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
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.locationText}>{hike.location}</Text>
          <Text style={styles.hikeName}>{hike.hikeName}</Text>
          <Text style={styles.dateText}>
            {format(hike.hikeDate, 'MMMM dd, yyyy')}
          </Text>

          <View style={styles.statsRow}>
            <StatCard
              icon="straighten"
              label="Length"
              value={`${hike.hikeLength} km`}
            />
            <StatCard
              icon="timer"
              label="Duration"
              value={hike.duration || 'N/A'}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="landscape"
              label="Difficulty"
              value={hike.difficultyLevel}
            />
            <StatCard
              icon="loop"
              label="Trail Type"
              value={hike.trailType}
            />
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons name="local-parking" size={24} color="#00BFA5" />
            <Text style={styles.infoCardText}>
              Parking {hike.parkingAvailable ? 'Available' : 'Not Available'}
            </Text>
          </View>

          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>
              {hike.description || 'No notes added for this hike.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <MaterialIcons name="edit" size={24} color="#00BFA5" />
          <Text style={styles.editButtonText}>Edit Hike</Text>
        </TouchableOpacity>
      </View>

      {showCancelDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Confirm Cancellation</Text>
            <Text style={styles.dialogText}>
              Are you sure you want to discard this hike? Your details won't be saved.
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.dialogButton}
                onPress={() => setShowCancelDialog(false)}>
                <Text style={styles.dialogButtonText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonDanger]}
                onPress={() => {
                  setShowCancelDialog(false);
                  handleDiscard();
                }}>
                <Text style={[styles.dialogButtonText, styles.dialogButtonTextDanger]}>
                  Discard
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({icon, label, value}) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <MaterialIcons name={icon as any} size={24} color="#00BFA5" />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00BFA5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  mapContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
  detailsContainer: {
    padding: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  hikeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F2F3F7',
    borderRadius: 12,
    padding: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 16,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BFA5',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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

export default HikeConfirmationScreen;
