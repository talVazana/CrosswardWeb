import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PlayerProfile {
    id: string;
    name: string;
    color: string;
}

interface PlayerContextType {
    player: PlayerProfile | null;
    login: (name: string) => void;
    logout: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const PLAYER_STORAGE_KEY = 'crossward_player';

const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', 
    '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'
];

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [player, setPlayer] = useState<PlayerProfile | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(PLAYER_STORAGE_KEY);
        if (stored) {
            try {
                setPlayer(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse player identity", e);
            }
        }
    }, []);

    const login = (name: string) => {
        if (!name.trim()) return;
        
        // Retain existing color and ID if we already have a session, otherwise generate
        const stored = localStorage.getItem(PLAYER_STORAGE_KEY);
        let currentProfile = null;
        if (stored) {
            try {
                currentProfile = JSON.parse(stored);
            } catch (e) {}
        }

        const id = currentProfile?.id || Math.random().toString(36).substring(2, 9);
        const color = currentProfile?.color || COLORS[Math.floor(Math.random() * COLORS.length)];
        
        const profile: PlayerProfile = { id, name: name.trim(), color };
        setPlayer(profile);
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(profile));
    };

    const logout = () => {
        setPlayer(null);
        localStorage.removeItem(PLAYER_STORAGE_KEY);
    };

    return (
        <PlayerContext.Provider value={{ player, login, logout }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('usePlayer must be used within PlayerProvider');
    return context;
};
