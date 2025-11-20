import * as SQLite from 'expo-sqlite';
import {Hike, Observation, User} from '../types';

const database_name = 'm_hike_database.db';

export class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) {
      return;
    }
    try {
      this.db = await SQLite.openDatabaseAsync(database_name);
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const dropTables = `
      DROP TABLE IF EXISTS observation_log;
      DROP TABLE IF EXISTS hike_registry;
      DROP TABLE IF EXISTS users;
    `;

    const createUserTable = `
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL
      );
    `;

    const createHikeTable = `
      CREATE TABLE hike_registry (
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
      CREATE INDEX idx_users_email ON users(email);
    `;

    const createHikeUserIndex = `
      CREATE INDEX idx_hike_userId ON hike_registry(userId);
    `;

    const createObservationTable = `
      CREATE TABLE observation_log (
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
      CREATE INDEX idx_observation_hikeId ON observation_log(hikeId);
    `;

    await this.db.execAsync(dropTables);
    await this.db.execAsync(createUserTable);
    await this.db.execAsync(createHikeTable);
    await this.db.execAsync(createObservationTable);
    await this.db.execAsync(createUserIndex);
    await this.db.execAsync(createHikeUserIndex);
    await this.db.execAsync(createIndex);
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
    const result = await this.db.runAsync(
      `INSERT INTO hike_registry 
       (userId, hikeName, location, hikeDate, parkingAvailable, hikeLength, difficultyLevel, trailType, description, latitude, longitude, duration, elevation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        hike.duration,
        hike.elevation || null,
      ]
    );
    return result.lastInsertRowId;
  }

  async updateHike(hike: Hike): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
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
        hike.duration,
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
