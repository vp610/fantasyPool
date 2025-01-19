import { Pool } from '../types';

export const dummyPools: Pool[] = [
  {
    id: '1',
    name: 'World Cup 2023',
    status: 'active',
    startDate: '2023-10-01',
    endDate: '2023-11-15',
    participants: 150,
    winner: '',
  },
  {
    id: '2',
    name: 'IPL 2023',
    status: 'upcoming',
    startDate: '2023-04-01',
    endDate: '2023-05-30',
    participants: 200,
    winner: '',
  },
  {
    id: '3',
    name: 'Big Bash League 2023',
    status: 'completed',
    startDate: '2023-01-01',
    endDate: '2023-02-15',
    participants: 100,
    winner: 'Veer bhai',
  },
  {
    id: '4',
    name: 'T20 Blast 2023',
    status: 'active',
    startDate: '2023-06-01',
    endDate: '2023-07-15',
    participants: 120,
    winner: 'Jatin',
  },
  {
    id: '5',
    name: 'CPL 2023',
    status: 'upcoming',
    startDate: '2023-08-01',
    endDate: '2023-09-15',
    participants: 80,
    winner: 'Nirav bhai',
  },
];