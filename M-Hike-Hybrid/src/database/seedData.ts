import {database} from './database';
import {User, Hike, Observation} from '../types';

const SEED_USER_EMAIL = 'thanthtoo128@gmail.com';
const SEED_USER_PASSWORD = 'vinn12';
const SEED_USER_NAME = 'Thanthtoo Aung';

export async function seedDatabase(): Promise<void> {
  try {
    await database.init();
    
    const existingUser = await database.getUserByEmail(SEED_USER_EMAIL);
    if (existingUser) {
      console.log('Seed data already exists, skipping...');
      return;
    }

    console.log('Seeding database with initial data...');

    const userId = await database.insertUser({
      fullName: SEED_USER_NAME,
      email: SEED_USER_EMAIL,
      passwordHash: SEED_USER_PASSWORD,
    });

    console.log(`Created user: ${SEED_USER_EMAIL} (ID: ${userId})`);

    const hikes: Omit<Hike, 'id'>[] = [
      {
        userId,
        hikeName: 'Mount Everest Base Camp Trek',
        location: 'Sagarmatha National Park, Nepal',
        hikeDate: new Date(2025, 0, 15),
        parkingAvailable: false,
        hikeLength: 130,
        difficultyLevel: 'Very Hard',
        trailType: 'Out & Back',
        description: 'An incredible journey to the base of the world\'s highest mountain. This trek offers stunning views of the Himalayas and a chance to experience Sherpa culture.',
        latitude: 27.9881,
        longitude: 86.9250,
        duration: '12-14 days',
        elevation: 5364,
      },
      {
        userId,
        hikeName: 'Grand Canyon Rim to Rim',
        location: 'Grand Canyon National Park, Arizona, USA',
        hikeDate: new Date(2025, 2, 20),
        parkingAvailable: true,
        hikeLength: 24,
        difficultyLevel: 'Hard',
        trailType: 'Point to Point',
        description: 'A challenging hike from the North Rim to the South Rim of the Grand Canyon. Experience dramatic elevation changes and breathtaking canyon views.',
        latitude: 36.1069,
        longitude: -112.1129,
        duration: '2-3 days',
        elevation: 1444,
      },
      {
        userId,
        hikeName: 'Yosemite Valley Loop',
        location: 'Yosemite National Park, California, USA',
        hikeDate: new Date(2025, 4, 10),
        parkingAvailable: true,
        hikeLength: 11.5,
        difficultyLevel: 'Moderate',
        trailType: 'Loop',
        description: 'A beautiful loop trail through Yosemite Valley with views of El Capitan, Half Dome, and Yosemite Falls. Perfect for a day hike.',
        latitude: 37.8651,
        longitude: -119.5383,
        duration: '4-5 hours',
        elevation: 120,
      },
    ];

    const hikeIds: number[] = [];
    for (const hike of hikes) {
      const hikeId = await database.insertHike(hike);
      hikeIds.push(hikeId);
      console.log(`Created hike: ${hike.hikeName} (ID: ${hikeId})`);
    }

    const observations: Omit<Observation, 'id'>[] = [];

    for (let i = 0; i < hikeIds.length; i++) {
      const hikeId = hikeIds[i];
      const hike = hikes[i];
      const baseDate = hike.hikeDate;

      const hikeObservations: Omit<Observation, 'id'>[] = [
        {
          hikeId,
          observationText: 'Started the hike early in the morning. Weather looks perfect!',
          observationTime: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000),
          additionalComments: 'Great visibility, clear skies',
          latitude: hike.latitude,
          longitude: hike.longitude,
        },
        {
          hikeId,
          observationText: 'Reached the first checkpoint. Taking a short break.',
          observationTime: new Date(baseDate.getTime() + 4 * 60 * 60 * 1000),
          additionalComments: 'Feeling good, pace is steady',
          latitude: hike.latitude ? hike.latitude + 0.001 : undefined,
          longitude: hike.longitude ? hike.longitude + 0.001 : undefined,
        },
        {
          hikeId,
          observationText: 'Beautiful scenery along the trail. Stopped for photos.',
          observationTime: new Date(baseDate.getTime() + 6 * 60 * 60 * 1000),
          additionalComments: 'Wildlife spotted: birds and small mammals',
          latitude: hike.latitude ? hike.latitude + 0.002 : undefined,
          longitude: hike.longitude ? hike.longitude + 0.002 : undefined,
        },
        {
          hikeId,
          observationText: 'Halfway point reached. Energy levels still high.',
          observationTime: new Date(baseDate.getTime() + 8 * 60 * 60 * 1000),
          additionalComments: 'Met other hikers on the trail',
          latitude: hike.latitude ? hike.latitude + 0.003 : undefined,
          longitude: hike.longitude ? hike.longitude + 0.003 : undefined,
        },
        {
          hikeId,
          observationText: 'Completed the hike! Amazing experience overall.',
          observationTime: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000),
          additionalComments: 'Would definitely do this again',
          latitude: hike.latitude,
          longitude: hike.longitude,
        },
      ];

      observations.push(...hikeObservations);
    }

    for (const observation of observations) {
      const obsId = await database.insertObservation(observation);
      console.log(`Created observation (ID: ${obsId}) for hike ${observation.hikeId}`);
    }

    console.log('Database seeding completed successfully!');
    console.log(`Created: 1 user, ${hikes.length} hikes, ${observations.length} observations`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

