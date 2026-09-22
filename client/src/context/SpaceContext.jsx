import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const SpaceContext = createContext();

export function SpaceProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [currentSpace, setCurrentSpace] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSpaces = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/spaces');
      if (res.success && res.spaces) {
        setSpaces(res.spaces);
        // If no space is active or active space was deleted, select the first one
        if (!currentSpace && res.spaces.length > 0) {
          const savedSpaceId = localStorage.getItem('documind_active_space');
          const matched = res.spaces.find(s => (s._id || s.id) === savedSpaceId);
          setCurrentSpace(matched || res.spaces[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch knowledge spaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [isAuthenticated]);

  const selectSpace = (space) => {
    setCurrentSpace(space);
    if (space) {
      localStorage.setItem('documind_active_space', space._id || space.id);
    }
  };

  return (
    <SpaceContext.Provider value={{
      spaces,
      currentSpace,
      setCurrentSpace: selectSpace,
      refreshSpaces: fetchSpaces,
      loading
    }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
}
