import { User } from '../types';

export const dummyUsers: User[] = [
  {
    id: '1',
    auth_id: 'auth0|123456',
    username: 'john_doe',
    email: 'john.doe@example.com',
    points: 1500,
    image: 'https://randomuser.me/api/port',
  },
  {
    id: '2',
    auth_id: 'auth0|654321',
    username: 'jane_smith',
    email: 'jane.smith@example.com',
    points: 1200,
    image: 'https://randomuser.me/api/port',
  },
  {
    id: '3',
    auth_id: 'auth0|789012',
    username: 'alice_jones',
    email: 'alice.jones@example.com',
    points: 1800,
    image: 'https://randomuser.me/api/port',
  },
  {
    id: '4',
    auth_id: 'auth0|210987',
    username: 'bob_brown',
    email: 'bob.brown@example.com',
    points: 1600,
    image: 'https://randomuser.me/api/port',
  },
  {
    id: '5',
    auth_id: 'auth0|345678',
    username: 'charlie_black',
    email: 'charlie.black@example.com',
    points: 1400,
    image: 'https://randomuser.me/api/port',
  },
];