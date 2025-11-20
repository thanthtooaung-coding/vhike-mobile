export interface User {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
}

export interface Hike {
  id: number;
  userId: number;
  hikeName: string;
  location: string;
  hikeDate: Date;
  parkingAvailable: boolean;
  hikeLength: number;
  difficultyLevel: string;
  trailType: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  duration: string;
  elevation?: number;
}

export interface Observation {
  id: number;
  hikeId: number;
  observationText: string;
  observationTime: Date;
  additionalComments?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddHikeFormState {
  hikeId?: number;
  hikeName: string;
  location: string;
  description: string;
  hikeDate?: Date;
  hikeLength?: number;
  lengthUnit: string;
  duration: string;
  elevation: string;
  difficultyLevel: string;
  parkingAvailable: boolean;
  trailType: string;
  latitude?: number;
  longitude?: number;
  errorMessage?: string;
}

export interface SearchFilters {
  name?: string;
  location?: string;
  selectedDate?: Date;
  lengthMin?: number;
  lengthMax?: number;
}

export interface AddObservationFormState {
  observationId?: number;
  hikeId?: number;
  observationText: string;
  observationTime?: Date;
  additionalComments: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  errorMessage?: string;
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  HikeList: undefined;
  AddHike: { hikeId?: number; pickedLocation?: { latitude: number; longitude: number; location: string } } | undefined;
  SearchHikes: undefined;
  HikeDetail: { hikeId: number };
  MapPicker: undefined;
  HikeConfirmation: { hikeId: number };
  AddObservation: { hikeId: number; observationId?: number };
  ObservationDetail: { observationId: number };
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

