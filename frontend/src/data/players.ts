import { Player } from '../types';

export const dummyPlayers: Player[] = [
  // India
  { id: '1', teamId: '1', playerId: 1, sportId: 'cricket', name: 'Virat Kohli', role: 'Batsman', createdAt: new Date().toISOString() },
  { id: '2', teamId: '1', playerId: 2, sportId: 'cricket', name: 'Rohit Sharma', role: 'Batsman', createdAt: new Date().toISOString() },
  { id: '3', teamId: '1', playerId: 3, sportId: 'cricket', name: 'Jasprit Bumrah', role: 'Bowler', createdAt: new Date().toISOString() },
  { id: '4', teamId: '1', playerId: 4, sportId: 'cricket', name: 'Ravindra Jadeja', role: 'All Rounder', createdAt: new Date().toISOString() },
  { id: '5', teamId: '1', playerId: 5, sportId: 'cricket', name: 'MS Dhoni', role: 'Wicket Keeper', createdAt: new Date().toISOString() },
  ];