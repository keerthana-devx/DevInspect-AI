import React, { createContext, useContext } from 'react';
import useMascot from '@/hooks/useMascot.js';
import MascotNotification from '@/components/MascotNotification.jsx';

const MascotContext = createContext({ mascot: {} });

export const MascotProvider = ({ children }) => {
  const { event, dismiss, mascot } = useMascot();
  return (
    <MascotContext.Provider value={{ mascot }}>
      {children}
      <MascotNotification event={event} onClose={dismiss} />
    </MascotContext.Provider>
  );
};

export const useMascotContext = () => useContext(MascotContext);
