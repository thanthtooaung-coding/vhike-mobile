import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {database} from '../database/database';
import {User} from '../types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  signup: (fullName: string, email: string, password: string) => Promise<{success: boolean; error?: string}>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string, email: string) => Promise<{success: boolean; error?: string}>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{success: boolean; error?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const USER_SESSION_KEY = '@vhike:user_id';

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      await database.init();
      const userIdStr = await AsyncStorage.getItem(USER_SESSION_KEY);
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const user = await database.getUserById(userId);
        if (user) {
          setCurrentUser(user);
        } else {
          await AsyncStorage.removeItem(USER_SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{success: boolean; error?: string}> => {
    try {
      const user = await database.getUserByEmail(email);
      if (!user) {
        return {success: false, error: 'Invalid credentials'};
      }

      if (user.passwordHash !== password) {
        return {success: false, error: 'Invalid credentials'};
      }

      await AsyncStorage.setItem(USER_SESSION_KEY, user.id.toString());
      setCurrentUser(user);
      return {success: true};
    } catch (error) {
      console.error('Login error:', error);
      return {success: false, error: 'Login failed. Please try again.'};
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{success: boolean; error?: string}> => {
    try {
      const existing = await database.getUserByEmail(email);
      if (existing) {
        return {success: false, error: 'Email already exists'};
      }

      const newUser = await database.insertUser({
        fullName,
        email,
        passwordHash: password,
      });

      const user = await database.getUserById(newUser);
      if (user) {
        await AsyncStorage.setItem(USER_SESSION_KEY, user.id.toString());
        setCurrentUser(user);
        return {success: true};
      }

      return {success: false, error: 'Failed to create account'};
    } catch (error) {
      console.error('Signup error:', error);
      return {success: false, error: 'Signup failed. Please try again.'};
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (
    fullName: string,
    email: string
  ): Promise<{success: boolean; error?: string}> => {
    try {
      if (!currentUser) {
        return {success: false, error: 'No user logged in'};
      }

      const existing = await database.getUserByEmail(email);
      if (existing && existing.id !== currentUser.id) {
        return {success: false, error: 'Email already exists'};
      }

      const updatedUser: User = {
        ...currentUser,
        fullName,
        email,
      };

      await database.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      return {success: true};
    } catch (error) {
      console.error('Update profile error:', error);
      return {success: false, error: 'Failed to update profile'};
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{success: boolean; error?: string}> => {
    try {
      if (!currentUser) {
        return {success: false, error: 'No user logged in'};
      }

      if (currentUser.passwordHash !== currentPassword) {
        return {success: false, error: 'Current password is incorrect'};
      }

      if (newPassword.length < 6) {
        return {success: false, error: 'Password must be at least 6 characters'};
      }

      if (newPassword !== confirmPassword) {
        return {success: false, error: 'Passwords do not match'};
      }

      if (newPassword === currentPassword) {
        return {success: false, error: 'New password must be different from current password'};
      }

      await database.updateUserPassword(currentUser.id, newPassword);
      
      const updatedUser: User = {
        ...currentUser,
        passwordHash: newPassword,
      };
      setCurrentUser(updatedUser);

      return {success: true};
    } catch (error) {
      console.error('Change password error:', error);
      return {success: false, error: 'Failed to change password'};
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

