import * as SQLite from 'expo-sqlite';
import {Hike, Observation} from '../types';

const database_name = 'm_hike_database.db';

export class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
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

    const createHikeTable = `
      CREATE TABLE IF NOT EXISTS hike_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        elevation REAL
      );
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

    await this.db.execAsync(createHikeTable);
    await this.db.execAsync(createObservationTable);
    await this.db.execAsync(createIndex);
  }

  // Hike operations
  async getAllHikes(): Promise<Hike[]> {
    if (!this.db) return [];
    const results = await this.db.getAllAsync<Hike>(
      'SELECT * FROM hike_registry ORDER BY hikeDate DESC'
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
       (hikeName, location, hikeDate, parkingAvailable, hikeLength, difficultyLevel, trailType, description, latitude, longitude, duration, elevation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
       SET hikeName = ?, location = ?, hikeDate = ?, parkingAvailable = ?, hikeLength = ?, 
           difficultyLevel = ?, trailType = ?, description = ?, latitude = ?, longitude = ?, 
           duration = ?, elevation = ?
       WHERE id = ?`,
      [
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
    name?: string,
    location?: string,
    date?: Date,
    lengthMin?: number,
    lengthMax?: number
  ): Promise<Hike[]> {
    if (!this.db) return [];
    let query = 'SELECT * FROM hike_registry WHERE 1=1';
    const params: any[] = [];

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

  // Observation operations
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
