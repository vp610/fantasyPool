import { Player } from '../types';

export const dummyPlayers: Player[] = [
  // India
  { id: 1, teamId: 1, playerId: 1, name: 'Virat Kohli', role: 'Batsman', numFifties: 50, numHundreds: 25, threeWickets: 0, fiveWickets: 0 },
  { id: 2, teamId: 1, playerId: 2, name: 'Rohit Sharma', role: 'Batsman', numFifties: 45, numHundreds: 20, threeWickets: 0, fiveWickets: 0 },
  { id: 3, teamId: 1, playerId: 3, name: 'Jasprit Bumrah', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 15, fiveWickets: 5 },
  { id: 4, teamId: 1, playerId: 4, name: 'Ravindra Jadeja', role: 'All Rounder', numFifties: 10, numHundreds: 5, threeWickets: 10, fiveWickets: 2 },
  { id: 5, teamId: 1, playerId: 5, name: 'MS Dhoni', role: 'Wicket Keeper', numFifties: 30, numHundreds: 10, threeWickets: 0, fiveWickets: 0 },
  // Australia
  { id: 6, teamId: 2, playerId: 6, name: 'David Warner', role: 'Batsman', numFifties: 40, numHundreds: 18, threeWickets: 0, fiveWickets: 0 },
  { id: 7, teamId: 2, playerId: 7, name: 'Steve Smith', role: 'Batsman', numFifties: 38, numHundreds: 15, threeWickets: 0, fiveWickets: 0 },
  { id: 8, teamId: 2, playerId: 8, name: 'Mitchell Starc', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 20, fiveWickets: 7 },
  { id: 9, teamId: 2, playerId: 9, name: 'Glenn Maxwell', role: 'All Rounder', numFifties: 12, numHundreds: 5, threeWickets: 8, fiveWickets: 3 },
  { id: 10, teamId: 2, playerId: 10, name: 'Alex Carey', role: 'Wicket Keeper', numFifties: 25, numHundreds: 8, threeWickets: 0, fiveWickets: 0 },
  // England
  { id: 11, teamId: 3, playerId: 11, name: 'Joe Root', role: 'Batsman', numFifties: 42, numHundreds: 17, threeWickets: 0, fiveWickets: 0 },
  { id: 12, teamId: 3, playerId: 12, name: 'Jason Roy', role: 'Batsman', numFifties: 30, numHundreds: 10, threeWickets: 0, fiveWickets: 0 },
  { id: 13, teamId: 3, playerId: 13, name: 'Jofra Archer', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 18, fiveWickets: 6 },
  { id: 14, teamId: 3, playerId: 14, name: 'Ben Stokes', role: 'All Rounder', numFifties: 15, numHundreds: 7, threeWickets: 12, fiveWickets: 4 },
  { id: 15, teamId: 3, playerId: 15, name: 'Jos Buttler', role: 'Wicket Keeper', numFifties: 28, numHundreds: 9, threeWickets: 0, fiveWickets: 0 },
  // South Africa
  { id: 16, teamId: 4, playerId: 16, name: 'Quinton de Kock', role: 'Batsman', numFifties: 35, numHundreds: 12, threeWickets: 0, fiveWickets: 0 },
  { id: 17, teamId: 4, playerId: 17, name: 'Faf du Plessis', role: 'Batsman', numFifties: 32, numHundreds: 11, threeWickets: 0, fiveWickets: 0 },
  { id: 18, teamId: 4, playerId: 18, name: 'Kagiso Rabada', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 22, fiveWickets: 8 },
  { id: 19, teamId: 4, playerId: 19, name: 'Chris Morris', role: 'All Rounder', numFifties: 10, numHundreds: 4, threeWickets: 10, fiveWickets: 3 },
  { id: 20, teamId: 4, playerId: 20, name: 'AB de Villiers', role: 'Wicket Keeper', numFifties: 40, numHundreds: 20, threeWickets: 0, fiveWickets: 0 },
  // New Zealand
  { id: 21, teamId: 5, playerId: 21, name: 'Kane Williamson', role: 'Batsman', numFifties: 38, numHundreds: 16, threeWickets: 0, fiveWickets: 0 },
  { id: 22, teamId: 5, playerId: 22, name: 'Martin Guptill', role: 'Batsman', numFifties: 34, numHundreds: 14, threeWickets: 0, fiveWickets: 0 },
  { id: 23, teamId: 5, playerId: 23, name: 'Trent Boult', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 20, fiveWickets: 7 },
  { id: 24, teamId: 5, playerId: 24, name: 'Jimmy Neesham', role: 'All Rounder', numFifties: 12, numHundreds: 5, threeWickets: 8, fiveWickets: 3 },
  { id: 25, teamId: 5, playerId: 25, name: 'Tom Latham', role: 'Wicket Keeper', numFifties: 25, numHundreds: 8, threeWickets: 0, fiveWickets: 0 },
  // Pakistan
  { id: 26, teamId: 6, playerId: 26, name: 'Babar Azam', role: 'Batsman', numFifties: 40, numHundreds: 18, threeWickets: 0, fiveWickets: 0 },
  { id: 27, teamId: 6, playerId: 27, name: 'Fakhar Zaman', role: 'Batsman', numFifties: 30, numHundreds: 10, threeWickets: 0, fiveWickets: 0 },
  { id: 28, teamId: 6, playerId: 28, name: 'Shaheen Afridi', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 18, fiveWickets: 6 },
  { id: 29, teamId: 6, playerId: 29, name: 'Shadab Khan', role: 'All Rounder', numFifties: 15, numHundreds: 7, threeWickets: 12, fiveWickets: 4 },
  { id: 30, teamId: 6, playerId: 30, name: 'Sarfaraz Ahmed', role: 'Wicket Keeper', numFifties: 28, numHundreds: 9, threeWickets: 0, fiveWickets: 0 },
  // Sri Lanka
  { id: 31, teamId: 7, playerId: 31, name: 'Kusal Perera', role: 'Batsman', numFifties: 35, numHundreds: 12, threeWickets: 0, fiveWickets: 0 },
  { id: 32, teamId: 7, playerId: 32, name: 'Dimuth Karunaratne', role: 'Batsman', numFifties: 32, numHundreds: 11, threeWickets: 0, fiveWickets: 0 },
  { id: 33, teamId: 7, playerId: 33, name: 'Lasith Malinga', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 22, fiveWickets: 8 },
  { id: 34, teamId: 7, playerId: 34, name: 'Thisara Perera', role: 'All Rounder', numFifties: 10, numHundreds: 4, threeWickets: 10, fiveWickets: 3 },
  { id: 35, teamId: 7, playerId: 35, name: 'Niroshan Dickwella', role: 'Wicket Keeper', numFifties: 40, numHundreds: 20, threeWickets: 0, fiveWickets: 0 },
  // West Indies
  { id: 36, teamId: 8, playerId: 36, name: 'Chris Gayle', role: 'Batsman', numFifties: 38, numHundreds: 16, threeWickets: 0, fiveWickets: 0 },
  { id: 37, teamId: 8, playerId: 37, name: 'Shai Hope', role: 'Batsman', numFifties: 34, numHundreds: 14, threeWickets: 0, fiveWickets: 0 },
  { id: 38, teamId: 8, playerId: 38, name: 'Kemar Roach', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 20, fiveWickets: 7 },
  { id: 39, teamId: 8, playerId: 39, name: 'Andre Russell', role: 'All Rounder', numFifties: 12, numHundreds: 5, threeWickets: 8, fiveWickets: 3 },
  { id: 40, teamId: 8, playerId: 40, name: 'Nicholas Pooran', role: 'Wicket Keeper', numFifties: 25, numHundreds: 8, threeWickets: 0, fiveWickets: 0 },
  // Bangladesh
  { id: 41, teamId: 9, playerId: 41, name: 'Tamim Iqbal', role: 'Batsman', numFifties: 35, numHundreds: 12, threeWickets: 0, fiveWickets: 0 },
  { id: 42, teamId: 9, playerId: 42, name: 'Mushfiqur Rahim', role: 'Batsman', numFifties: 32, numHundreds: 11, threeWickets: 0, fiveWickets: 0 },
  { id: 43, teamId: 9, playerId: 43, name: 'Mustafizur Rahman', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 22, fiveWickets: 8 },
  { id: 44, teamId: 9, playerId: 44, name: 'Shakib Al Hasan', role: 'All Rounder', numFifties: 10, numHundreds: 4, threeWickets: 10, fiveWickets: 3 },
  { id: 45, teamId: 9, playerId: 45, name: 'Liton Das', role: 'Wicket Keeper', numFifties: 40, numHundreds: 20, threeWickets: 0, fiveWickets: 0 },
  // Afghanistan
  { id: 46, teamId: 10, playerId: 46, name: 'Rahmat Shah', role: 'Batsman', numFifties: 35, numHundreds: 12, threeWickets: 0, fiveWickets: 0 },
  { id: 47, teamId: 10, playerId: 47, name: 'Hazratullah Zazai', role: 'Batsman', numFifties: 32, numHundreds: 11, threeWickets: 0, fiveWickets: 0 },
  { id: 48, teamId: 10, playerId: 48, name: 'Rashid Khan', role: 'Bowler', numFifties: 0, numHundreds: 0, threeWickets: 22, fiveWickets: 8 },
  { id: 49, teamId: 10, playerId: 49, name: 'Mohammad Nabi', role: 'All Rounder', numFifties: 10, numHundreds: 4, threeWickets: 10, fiveWickets: 3 },
  { id: 50, teamId: 10, playerId: 50, name: 'Mohammad Shahzad', role: 'Wicket Keeper', numFifties: 40, numHundreds: 20, threeWickets: 0, fiveWickets: 0 }  
];