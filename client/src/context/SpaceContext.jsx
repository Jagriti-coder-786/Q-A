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
        if (res.spaces.length > 0) {
          const currentId = currentSpace?._id || currentSpace?.id || localStorage.getItem('documind_active_space');
          const matched = res.spaces.find(s => (s._id || s.id) === currentId);
          setCurrentSpace(matched || res.spaces[0]);
          if (matched || res.spaces[0]) {
            localStorage.setItem('documind_active_space', (matched || res.spaces[0])._id || (matched || res.spaces[0]).id);
          }
        } else {
          setCurrentSpace(null);
          localStorage.removeItem('documind_active_space');
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
