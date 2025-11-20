import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {database} from '../database/database';
import {Hike, Observation, AddHikeFormState, AddObservationFormState, SearchFilters} from '../types';
import {GitHubService} from '../services/GitHubService';
import {useAuth} from './AuthContext';

interface AppContextType {
  hikes: Hike[];
  loadHikes: () => Promise<void>;
  addHike: (hike: Omit<Hike, 'id' | 'userId'>) => Promise<number>;
  updateHike: (hike: Hike) => Promise<void>;
  deleteHike: (hike: Hike) => Promise<void>;
  getHikeById: (id: number) => Promise<Hike | null>;
  searchHikes: (filters: SearchFilters) => Promise<Hike[]>;
  getObservationsForHike: (hikeId: number) => Promise<Observation[]>;
  getObservationById: (id: number) => Promise<Observation | null>;
  addObservation: (observation: Omit<Observation, 'id'>) => Promise<number>;
  updateObservation: (observation: Observation) => Promise<void>;
  deleteObservation: (observation: Observation) => Promise<void>;
  uploadPhoto: (uri: string, fileName: string) => Promise<string | null>;
  deleteAllHikes: () => Promise<void>;
  addHikeFormState: AddHikeFormState;
  setAddHikeFormState: (state: AddHikeFormState) => void;
  addObservationFormState: AddObservationFormState;
  setAddObservationFormState: (state: AddObservationFormState) => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
  const {currentUser} = useAuth();
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [addHikeFormState, setAddHikeFormState] = useState<AddHikeFormState>({
    hikeName: '',
    location: '',
    description: '',
    lengthUnit: 'km',
    duration: '',
    elevation: '',
    difficultyLevel: 'Easy',
    parkingAvailable: false,
    trailType: 'Loop',
  });
  const [addObservationFormState, setAddObservationFormState] = useState<AddObservationFormState>({
    observationText: '',
    observationTime: new Date(),
    additionalComments: '',
  });
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [gitHubService, setGitHubService] = useState<GitHubService | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      await database.init();
      
      const {seedDatabase} = await import('../database/seedData');
      await seedDatabase();
      
      const token = '';
      const owner = '';
      const repo = '';
      const folder = '';
      
      if (token && owner && repo && folder) {
        setGitHubService(new GitHubService(token, owner, repo, folder));
      }
    };
    initDatabase();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadHikes();
    } else {
      setHikes([]);
    }
  }, [currentUser]);

  const loadHikes = async () => {
    if (!currentUser) return;
    const allHikes = await database.getAllHikes(currentUser.id);
    setHikes(allHikes);
  };

  const addHike = async (hike: Omit<Hike, 'id' | 'userId'>): Promise<number> => {
    if (!currentUser) throw new Error('User not logged in');
    const id = await database.insertHike({...hike, userId: currentUser.id});
    await loadHikes();
    return id;
  };

  const updateHike = async (hike: Hike): Promise<void> => {
    await database.updateHike(hike);
    await loadHikes();
  };

  const deleteHike = async (hike: Hike): Promise<void> => {
    await database.deleteHike(hike);
    await loadHikes();
  };

  const getHikeById = async (id: number): Promise<Hike | null> => {
    return await database.getHikeById(id);
  };

  const searchHikes = async (filters: SearchFilters): Promise<Hike[]> => {
    if (!currentUser) return [];
    return await database.searchHikes(
      currentUser.id,
      filters.name,
      filters.location,
      filters.selectedDate,
      filters.lengthMin,
      filters.lengthMax
    );
  };

  const deleteAllHikes = async (): Promise<void> => {
    if (!currentUser) return;
    await database.deleteAllHikesForUser(currentUser.id);
    await loadHikes();
  };

  const getObservationsForHike = async (hikeId: number): Promise<Observation[]> => {
    return await database.getObservationsForHike(hikeId);
  };

  const getObservationById = async (id: number): Promise<Observation | null> => {
    return await database.getObservationById(id);
  };

  const addObservation = async (observation: Omit<Observation, 'id'>): Promise<number> => {
    const id = await database.insertObservation(observation);
    return id;
  };

  const updateObservation = async (observation: Observation): Promise<void> => {
    await database.updateObservation(observation);
  };

  const deleteObservation = async (observation: Observation): Promise<void> => {
    await database.deleteObservation(observation);
  };

  const uploadPhoto = async (uri: string, fileName: string): Promise<string | null> => {
    if (!gitHubService) {
      console.warn('GitHub service not initialized');
      return null;
    }

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const commitMessage = `:sparkles: feat: Add observation photo ${fileName}`;
      return await gitHubService.uploadFile(uint8Array, fileName, commitMessage);
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        hikes,
        loadHikes,
        addHike,
        updateHike,
        deleteHike,
        getHikeById,
        searchHikes,
        getObservationsForHike,
        getObservationById,
        addObservation,
        updateObservation,
        deleteObservation,
        uploadPhoto,
        addHikeFormState,
        setAddHikeFormState,
        addObservationFormState,
        setAddObservationFormState,
        searchFilters,
        setSearchFilters,
      }}>
      {children}
    </AppContext.Provider>
  );
};

