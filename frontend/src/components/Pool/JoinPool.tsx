import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { Player, Team } from '../../types';
import { dummyTeams } from '../../data/teams';
import { dummyPlayers } from '../../data/players';
import { FaRunning } from 'react-icons/fa'; 
import { GiGloves, GiCricketBat } from 'react-icons/gi';   
import { BiCricketBall} from 'react-icons/bi';
import { RootState } from '../../store/store';
import { gradientClasses } from '../../constants/constants';

const teamFlags: { [key: number]: string } = {
  1: '🇮🇳',
  2: '🇦🇺',
  3: '🏴',
  4: '🇿🇦',
  5: '🇳🇿',
  6: '🇵🇰',
  7: '🇱🇰',
  8: '🇮🇳',
  9: '🇧🇩',
  10: '🇦🇫',
};

const JoinPool: React.FC = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const navigate = useNavigate();
  const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);
  const [teams, setTeams] = useState<Team[]>(dummyTeams);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [players, setPlayers] = useState<Player[]>(dummyPlayers);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownTeam, setDropdownTeam] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState<boolean>(false);

  useEffect(() => {
    if (dropdownTeam !== null) {
      // Filter players based on the selected team from the dropdown
      const filteredPlayers = dummyPlayers.filter(player => player.teamId === dropdownTeam);
      setPlayers(filteredPlayers);
    } else {
      // Show all players if no team is selected
      setPlayers(dummyPlayers);
    }
  }, [dropdownTeam]);

  const handleTeamSelect = (teamId: number) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((t) => t !== teamId)
        : prev.length < 3
        ? [...prev, teamId]
        : prev
    );
  };

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.length < 3) {
      setSelectedPlayers((prev) =>
        prev.includes(player)
          ? prev.filter((p) => p.id !== player.id)
          : [...prev, player]
      );
      setLimitReached(false);
    } else {
      setLimitReached(true);
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setLimitReached(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/save-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pool_id: poolId,
          teams: selectedTeams,
          players: selectedPlayers.map((player) => player.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save selection');
      }

      navigate(`/pool/view/${poolId}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Pool</h2>
      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Select Top 3 Teams</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedTeams.includes(team.id)
                  ? `${gradientClasses[gradientIndex]} text-white`
                  : 'bg-white text-gray-800'
              } transition-colors duration-200 hover:shadow-lg hover:scale-103`}
              onClick={() => handleTeamSelect(team.id)}
            >
              {teamFlags[team.id]} {team.name}
            </div>
          ))}
        </div>
      </div>
      {selectedTeams.length === 3 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Select Teams to View Players</h3>
          <Select
            options={teams.map((team) => ({ value: team.id, label: `${teamFlags[team.id]} ${team.name}` }))}
            onChange={(selectedOption) => {
              const selectedTeamId = (selectedOption as any).value;
              setDropdownTeam(selectedTeamId);
            }}
            className="w-full"
            classNamePrefix="react-select"
          />
        </div>
      )}
      {dropdownTeam !== null &&
        (<div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Select Top 3 Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
              { type: 'Batsman', icon: <GiCricketBat /> },
              { type: 'Bowler', icon: <BiCricketBall /> },
              { type: 'All Rounder', icon: <FaRunning /> },
              { type: 'Wicket Keeper', icon: <GiGloves /> },
            ].map(({ type, icon }) => (
            <div key={type}>
              <h4 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                {icon} <span className="ml-2">{type}</span>
              </h4>
                <div className="grid grid-cols-1 gap-2">
                  {players
                    .filter((player) => player.role === type)
                    .map((player) => (
                      <div
                        key={player.id}
                        className={`p-4 border rounded-lg cursor-pointer ${
                          selectedPlayers.includes(player)
                            ? `${gradientClasses[gradientIndex]} text-white`
                            : 'bg-white text-gray-800'
                        } transition-colors duration-200 hover:shadow-lg hover:scale-103`}
                        onClick={() => handlePlayerSelect(player)}
                      >
                        {teamFlags[player.teamId]} {player.name}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        {limitReached && (
          <p className="text-red-500 text-xs italic mt-4">
            You have reached the limit of 3 players. To select a different player, remove one from the "Your Selection" below.
          </p>
        )}
        </div>)
      }
      
      {selectedPlayers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedPlayers.map((player) => (
              <div
                key={player.id}
                className="p-4 border rounded-lg bg-white text-gray-800 flex justify-between items-center"
              >
                {teamFlags[player.teamId]} {player.name}
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemovePlayer(player.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedPlayers.length === 3 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};

export default JoinPool;