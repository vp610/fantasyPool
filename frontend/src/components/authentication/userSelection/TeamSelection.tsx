import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamSelection = () => {
    const [teams, setTeams] = useState<string[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

    useEffect(() => {
        // Fetch available teams from the backend
        const fetchTeams = async () => {
            const response = await axios.get('http://127.0.0.1:5000/teams');
            setTeams(response.data);
        };

        fetchTeams();
    }, []);

    const handleTeamSelect = (team: string) => {
        if (selectedTeams.includes(team)) {
            setSelectedTeams(selectedTeams.filter(t => t !== team));
        } else if (selectedTeams.length < 3) {
            setSelectedTeams([...selectedTeams, team]);
        }
    };

    const handleSubmit = async () => {
        try {
            await axios.post('http://127.0.0.1:5000/select-teams', {
                username: 'user123',  // Replace with actual logged-in username
                teams: selectedTeams
            });
            alert("Teams selected successfully!");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Select 3 Teams</h2>
            <div>
                {teams.map(team => (
                    <button
                        key={team}
                        onClick={() => handleTeamSelect(team)}
                        style={{ background: selectedTeams.includes(team) ? 'green' : 'white' }}
                    >
                        {team}
                    </button>
                ))}
            </div>
            <button onClick={handleSubmit} disabled={selectedTeams.length !== 3}>
                Submit Teams
            </button>
        </div>
    );
};

export default TeamSelection;
