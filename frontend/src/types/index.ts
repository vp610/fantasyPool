export interface Sport {
    id: string;
    name: string;
    createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  sportId: string;
  startDate: string;
  endDate: string;
  status: boolean;
  createdAt: string;
}

export interface User {
    id: string;
    authId: string;
    username: string;
    email: string;
    createdAt: string;
  }
  
  export interface Pool {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    participants: number;
    tournamentId: string;
    winner: string | null;
    status: boolean;
    createdAt: string;
  }
  
  export interface Team {
    id: string;
    name: string;
    sportId: string
    teamId: number;
    createdAt: string;
  }

  export interface Player {
    id: string;
    teamId: string;
    playerId: number;
    sportId: string;
    name: string;
    role: string;
    createdAt: string;
  }

  export interface User {
    id: string;
    authId: string;
    username: string;
    email: string;
    createdAt: string;
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

  /* Pool Page Interfaces */

  export interface PlayerStats {
    createdAt: string;
    fifties?: number;
    hundreds?: number;
    threeWickets?: number;
    fiveWickets?: number;
    id: string;
    playerStatsId: string;
  }

  export interface TeamStats {
    createdAt: string;
    id: string;
    teamId: string;
    tournamentId: string;
    totalGames: number;
    totalDraws: number;
    totalWins: number;
    totalLosses: number;
  }
  
  export interface StandingTeam {
    team: Team;
    teamStats: TeamStats;
    score: number;
  }

  export interface StandingPlayer {
    player: Player;
    playerStats: PlayerStats;
    score: number;
  }