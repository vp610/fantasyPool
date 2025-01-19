export interface User {
    id: string;
    auth_id: string;
    username: string;
    email: string;
    points: number;
    image: string;
  }
  
  export interface Pool {
    id: string;
    name: string;
    status: 'upcoming' | 'active' | 'completed';
    startDate: string;
    endDate: string;
    participants: number;
    winner: string | null;
  }
  
  export interface Team {
    id: number;
    name: string;
    teamId: number;
    totalGames: number;
    totalWins: number;
  }

  export interface Player {
    id: number;
    teamId: number;
    playerId: number;
    name: string;
    role: string;
    numFifties: number;
    numHundreds: number;
    threeWickets: number;
    fiveWickets: number;
  }

  export interface User {
    id: string;
    auth_id: string;
    username: string;
    email: string;
    image: string;
  }

  export interface UserSelection {
    userId: string;
    teams: number[]; // teamIds
    players: number[]; // playerIds
  }

  export interface Points {
    userId: string;
    poolId: string;
    points: number; 
  }