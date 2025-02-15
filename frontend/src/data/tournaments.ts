import { Tournament } from '../types';

export const dummyTournaments: Tournament[] = [
    { id: '1', name: 'IPL 2024', sportId: '1', startDate: '2024-03-01', endDate: '2024-05-31', status: true, createdAt: '2023-10-01' },
    { id: '2', name: 'World Cup 2024', sportId: '2', startDate: '2024-06-01', endDate: '2024-07-31', status: true, createdAt: '2023-10-01' },
    { id: '3', name: 'NBA Finals 2024', sportId: '3', startDate: '2024-06-10', endDate: '2024-06-25', status: false, createdAt: '2023-10-01' },
];