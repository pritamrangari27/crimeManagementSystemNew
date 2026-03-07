import React, { createContext, useContext, useState } from 'react';

const ChangePasswordContext = createContext();

export const ChangePasswordProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChangePasswordModal = () => setIsOpen(true);
  const closeChangePasswordModal = () => setIsOpen(false);

  return (
    <ChangePasswordContext.Provider value={{ isOpen, openChangePasswordModal, closeChangePasswordModal }}>
      {children}
    </ChangePasswordContext.Provider>
  );
};

export const useChangePassword = () => {
  const context = useContext(ChangePasswordContext);
  if (!context) {
    throw new Error('useChangePassword must be used within ChangePasswordProvider');
  }
  return context;
};
