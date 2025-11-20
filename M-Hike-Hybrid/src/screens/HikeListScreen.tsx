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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList, Hike} from '../types';
import {useAppContext} from '../context/AppContext';
import {useAuth} from '../context/AuthContext';
import {format} from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HikeListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {hikes, loadHikes, deleteHike} = useAppContext();
  const {logout} = useAuth();
  const [loading, setLoading] = useState(true);
  const [hikeToDelete, setHikeToDelete] = useState<Hike | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const insets = useSafeAreaInsets();

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
    <HikeListItem
      hike={item}
      onPress={() => navigation.navigate('HikeDetail', {hikeId: item.id})}
      onEdit={() => navigation.navigate('AddHike', {hikeId: item.id})}
      onDelete={() => handleDelete(item)}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00BFA5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 16)}]}>
        <Text style={styles.headerTitle}>My Hikes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('SearchHikes')}
            style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              style={styles.menuButton}>
              <MaterialIcons name="more-vert" size={24} color="#000" />
            </TouchableOpacity>
            {showMenu && (
              <View style={styles.menu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    navigation.navigate('Settings');
                  }}>
                  <MaterialIcons name="settings" size={20} color="#000" />
                  <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    Alert.alert('Log Out', 'Are you sure you want to log out?', [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Log Out',
                        style: 'destructive',
                        onPress: async () => {
                          await logout();
                        },
                      },
                    ]);
                  }}>
                  <MaterialIcons name="exit-to-app" size={20} color="#000" />
                  <Text style={styles.menuItemText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
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
        style={[styles.fab, {bottom: Math.max(insets.bottom, 16)}]}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
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
    backgroundColor: 'rgba(0, 191, 165, 0.1)',
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
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 8,
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
  menuItemTextDanger: {
    color: '#F44336',
  },
  moreButtonContainer: {
    position: 'relative',
  },
  itemMenu: {
    position: 'absolute',
    top: 32,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
});

const HikeListItem: React.FC<{
  hike: Hike;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({hike, onPress, onEdit, onDelete}) => {
  const [showItemMenu, setShowItemMenu] = useState(false);

  return (
    <TouchableOpacity
      style={styles.hikeCard}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.hikeContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="landscape" size={32} color="#00BFA5" />
        </View>
        <View style={styles.hikeInfo}>
          <Text style={styles.hikeName}>{hike.hikeName}</Text>
          <Text style={styles.hikeLocation}>{hike.location}</Text>
          <Text style={styles.hikeMeta}>
            {format(hike.hikeDate, 'MMM dd, yyyy')} • {hike.hikeLength} km
          </Text>
        </View>
        <View style={styles.moreButtonContainer}>
          <TouchableOpacity
            onPress={() => setShowItemMenu(!showItemMenu)}
            style={styles.moreButton}>
            <MaterialIcons name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
          {showItemMenu && (
            <View style={styles.itemMenu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowItemMenu(false);
                  onEdit();
                }}>
                <MaterialIcons name="edit" size={20} color="#000" />
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowItemMenu(false);
                  onDelete();
                }}>
                <MaterialIcons name="delete" size={20} color="#F44336" />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HikeListScreen;

