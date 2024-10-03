import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlayerSelection = () => {
    const [players, setPlayers] = useState<string[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

    useEffect(() => {
        // Fetch available players from the backend
        const fetchPlayers = async () => {
            const response = await axios.get('http://127.0.0.1:5000/players');
            setPlayers(response.data);
        };

        fetchPlayers();
    }, []);

    const handlePlayerSelect = (player: string) => {
        if (selectedPlayers.includes(player)) {
            setSelectedPlayers(selectedPlayers.filter(p => p !== player));
        } else if (selectedPlayers.length < 4) {
            setSelectedPlayers([...selectedPlayers, player]);
        }
    };

    const handleSubmit = async () => {
        try {
            await axios.post('http://127.0.0.1:5000/select-players', {
                username: 'user123',  // Replace with actual logged-in username
                players: selectedPlayers
            });
            alert("Players selected successfully!");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Select 4 Players</h2>
            <div>
                {players.map(player => (
                    <button
                        key={player}
                        onClick={() => handlePlayerSelect(player)}
                        style={{ background: selectedPlayers.includes(player) ? 'green' : 'white' }}
                    >
                        {player}
                    </button>
                ))}
            </div>
            <button onClick={handleSubmit} disabled={selectedPlayers.length !== 4}>
                Submit Players
            </button>
        </div>
    );
};

export default PlayerSelection;
