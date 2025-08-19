import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { PunchlistItem } from '../entities/PunchlistItem';
import { Photo } from '../entities/Photo';
import { Note } from '../entities/Note';
import path from 'path';

// SQLite database path
const dbPath = path.join(__dirname, '../../database.sqlite');

export const ormConfig = new DataSource({
  type: 'sqlite',
  database: dbPath,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Project, PunchlistItem, Photo, Note],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

export const createTestConnection = () => {
  const testDbPath = path.join(__dirname, '../../test_database.sqlite');
  
  return new DataSource({
    type: 'sqlite',
    database: testDbPath,
    synchronize: true,
    dropSchema: true,
    entities: [User, Project, PunchlistItem, Photo, Note],
    logging: false,
  });
};

