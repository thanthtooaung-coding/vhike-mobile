import * as SQLite from 'expo-sqlite';
import {Hike, Observation, User} from '../types';

const database_name = 'm_hike_database.db';

export class Database {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(database_name);
      await this.createTables();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists')) {
        console.log('Tables already exist, skipping creation');
        this.initPromise = null;
        return;
      }
      console.error('Database initialization error:', error);
      this.initPromise = null;
      throw error;
    }
    this.initPromise = null;
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const createUserTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL
      );
    `;

    const createHikeTable = `
      CREATE TABLE IF NOT EXISTS hike_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        hikeName TEXT NOT NULL,
        location TEXT NOT NULL,
        hikeDate INTEGER NOT NULL,
        parkingAvailable INTEGER NOT NULL,
        hikeLength REAL NOT NULL,
        difficultyLevel TEXT NOT NULL,
        trailType TEXT NOT NULL,
        description TEXT,
        latitude REAL,
        longitude REAL,
        duration TEXT NOT NULL,
        elevation REAL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    const createUserIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    const createHikeUserIndex = `
      CREATE INDEX IF NOT EXISTS idx_hike_userId ON hike_registry(userId);
    `;

    const createObservationTable = `
      CREATE TABLE IF NOT EXISTS observation_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hikeId INTEGER NOT NULL,
        observationText TEXT NOT NULL,
        observationTime INTEGER NOT NULL,
        additionalComments TEXT,
        photoUrl TEXT,
        latitude REAL,
        longitude REAL,
        FOREIGN KEY (hikeId) REFERENCES hike_registry(id) ON DELETE CASCADE
      );
    `;

    const createIndex = `
      CREATE INDEX IF NOT EXISTS idx_observation_hikeId ON observation_log(hikeId);
    `;

    try {
      await this.db.execAsync(createUserTable);
      await this.db.execAsync(createHikeTable);
      await this.db.execAsync(createObservationTable);
      await this.db.execAsync(createUserIndex);
      await this.db.execAsync(createHikeUserIndex);
      await this.db.execAsync(createIndex);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists')) {
        console.log('Tables already exist, skipping creation');
        return;
      }
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) return null;
    const results = await this.db.getAllAsync<User>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return results.length > 0 ? results[0] : null;
  }

  async getUserById(userId: number): Promise<User | null> {
    if (!this.db) return null;
    const results = await this.db.getAllAsync<User>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return results.length > 0 ? results[0] : null;
  }

  async insertUser(user: Omit<User, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.runAsync(
      'INSERT INTO users (fullName, email, passwordHash) VALUES (?, ?, ?)',
      [user.fullName, user.email, user.passwordHash]
    );
    return result.lastInsertRowId;
  }

  async updateUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
      'UPDATE users SET fullName = ?, email = ? WHERE id = ?',
      [user.fullName, user.email, user.id]
    );
  }

  async updateUserPassword(userId: number, passwordHash: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
      'UPDATE users SET passwordHash = ? WHERE id = ?',
      [passwordHash, userId]
    );
  }

  async deleteAllHikesForUser(userId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM hike_registry WHERE userId = ?', [userId]);
  }

  async deleteAllHikes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM hike_registry');
  }

  async getAllHikes(userId: number): Promise<Hike[]> {
    if (!this.db) return [];
    const results = await this.db.getAllAsync<Hike>(
      'SELECT * FROM hike_registry WHERE userId = ? ORDER BY hikeDate DESC',
      [userId]
    );
    return this.mapHikes(results);
  }

  async getHikeById(hikeId: number): Promise<Hike | null> {
    if (!this.db) return null;
    const results = await this.db.getAllAsync<Hike>(
      'SELECT * FROM hike_registry WHERE id = ?',
      [hikeId]
    );
    const hikes = this.mapHikes(results);
    return hikes.length > 0 ? hikes[0] : null;
  }

  async insertHike(hike: Omit<Hike, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    if (!hike.userId || hike.userId <= 0) {
      throw new Error('User ID is required');
    }
    if (!hike.duration || !hike.duration.trim()) {
      throw new Error('Duration is required');
    }
    if (!hike.hikeName || !hike.hikeName.trim()) {
      throw new Error('Hike name is required');
    }
    if (!hike.location || !hike.location.trim()) {
      throw new Error('Location is required');
    }
    if (!hike.hikeDate || !(hike.hikeDate instanceof Date) || isNaN(hike.hikeDate.getTime())) {
      throw new Error('Hike date is required and must be a valid date');
    }
    if (!hike.hikeLength || hike.hikeLength <= 0) {
      throw new Error('Hike length is required and must be greater than 0');
    }
    if (!hike.difficultyLevel || !hike.difficultyLevel.trim()) {
      throw new Error('Difficulty level is required');
    }
    if (!hike.trailType || !hike.trailType.trim()) {
      throw new Error('Trail type is required');
    }
    
    try {
      const result = await this.db.runAsync(
        `INSERT INTO hike_registry 
         (userId, hikeName, location, hikeDate, parkingAvailable, hikeLength, difficultyLevel, trailType, description, latitude, longitude, duration, elevation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hike.userId,
          hike.hikeName.trim(),
          hike.location.trim(),
          hike.hikeDate.getTime(),
          hike.parkingAvailable ? 1 : 0,
          hike.hikeLength,
          hike.difficultyLevel.trim(),
          hike.trailType.trim(),
          hike.description?.trim() || null,
          hike.latitude != null ? hike.latitude : null,
          hike.longitude != null ? hike.longitude : null,
          hike.duration.trim(),
          hike.elevation != null ? hike.elevation : null,
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Database insert error:', error);
      console.error('Hike data:', {
        userId: hike.userId,
        hikeName: hike.hikeName,
        location: hike.location,
        hikeDate: hike.hikeDate,
        duration: hike.duration,
        difficultyLevel: hike.difficultyLevel,
        trailType: hike.trailType,
      });
      throw error;
    }
  }

  async updateHike(hike: Hike): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    if (!hike.duration || !hike.duration.trim()) {
      throw new Error('Duration is required');
    }
    await this.db.runAsync(
      `UPDATE hike_registry 
       SET userId = ?, hikeName = ?, location = ?, hikeDate = ?, parkingAvailable = ?, hikeLength = ?, 
           difficultyLevel = ?, trailType = ?, description = ?, latitude = ?, longitude = ?, 
           duration = ?, elevation = ?
       WHERE id = ?`,
      [
        hike.userId,
        hike.hikeName,
        hike.location,
        hike.hikeDate.getTime(),
        hike.parkingAvailable ? 1 : 0,
        hike.hikeLength,
        hike.difficultyLevel,
        hike.trailType,
        hike.description || null,
        hike.latitude || null,
        hike.longitude || null,
        hike.duration.trim(),
        hike.elevation || null,
        hike.id,
      ]
    );
  }

  async deleteHike(hike: Hike): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM hike_registry WHERE id = ?', [hike.id]);
  }

  async searchHikes(
    userId: number,
    name?: string,
    location?: string,
    date?: Date,
    lengthMin?: number,
    lengthMax?: number
  ): Promise<Hike[]> {
    if (!this.db) return [];
    let query = 'SELECT * FROM hike_registry WHERE userId = ?';
    const params: any[] = [userId];

    if (name) {
      query += ' AND hikeName LIKE ?';
      params.push(`%${name}%`);
    }
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    if (date) {
      query += ' AND hikeDate = ?';
      params.push(date.getTime());
    }
    if (lengthMin !== undefined) {
      query += ' AND hikeLength >= ?';
      params.push(lengthMin);
    }
    if (lengthMax !== undefined) {
      query += ' AND hikeLength <= ?';
      params.push(lengthMax);
    }

    query += ' ORDER BY hikeDate DESC';

    const results = await this.db.getAllAsync<Hike>(query, params);
    return this.mapHikes(results);
  }

  async getObservationsForHike(hikeId: number): Promise<Observation[]> {
    if (!this.db) return [];
    const results = await this.db.getAllAsync<Observation>(
      'SELECT * FROM observation_log WHERE hikeId = ? ORDER BY observationTime DESC',
      [hikeId]
    );
    return this.mapObservations(results);
  }

  async getObservationById(observationId: number): Promise<Observation | null> {
    if (!this.db) return null;
    const results = await this.db.getAllAsync<Observation>(
      'SELECT * FROM observation_log WHERE id = ?',
      [observationId]
    );
    const observations = this.mapObservations(results);
    return observations.length > 0 ? observations[0] : null;
  }

  async insertObservation(
    observation: Omit<Observation, 'id'>
  ): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.runAsync(
      `INSERT INTO observation_log 
       (hikeId, observationText, observationTime, additionalComments, photoUrl, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        observation.hikeId,
        observation.observationText,
        observation.observationTime.getTime(),
        observation.additionalComments || null,
        observation.photoUrl || null,
        observation.latitude || null,
        observation.longitude || null,
      ]
    );
    return result.lastInsertRowId;
  }

  async updateObservation(observation: Observation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
      `UPDATE observation_log 
       SET hikeId = ?, observationText = ?, observationTime = ?, additionalComments = ?, 
           photoUrl = ?, latitude = ?, longitude = ?
       WHERE id = ?`,
      [
        observation.hikeId,
        observation.observationText,
        observation.observationTime.getTime(),
        observation.additionalComments || null,
        observation.photoUrl || null,
        observation.latitude || null,
        observation.longitude || null,
        observation.id,
      ]
    );
  }

  async deleteObservation(observation: Observation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM observation_log WHERE id = ?', [
      observation.id,
    ]);
  }

  private mapHikes(results: any[]): Hike[] {
    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      hikeName: row.hikeName,
      location: row.location,
      hikeDate: new Date(row.hikeDate),
      parkingAvailable: row.parkingAvailable === 1,
      hikeLength: row.hikeLength,
      difficultyLevel: row.difficultyLevel,
      trailType: row.trailType,
      description: row.description,
      latitude: row.latitude,
      longitude: row.longitude,
      duration: row.duration,
      elevation: row.elevation,
    }));
  }

  private mapObservations(results: any[]): Observation[] {
    return results.map(row => ({
      id: row.id,
      hikeId: row.hikeId,
      observationText: row.observationText,
      observationTime: new Date(row.observationTime),
      additionalComments: row.additionalComments,
      photoUrl: row.photoUrl,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
  }
}

export const database = new Database();
