import React, { createContext, useContext, useState } from 'react';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';

const UpgradeContext = createContext(null);

export function UpgradeProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openUpgradeDialog = () => setOpen(true);

  return (
    <UpgradeContext.Provider value={{ openUpgradeDialog }}>
      {children}
      <SubscriptionDialog open={open} onOpenChange={setOpen} />
    </UpgradeContext.Provider>
  );
}

export function useUpgrade() {
  const ctx = useContext(UpgradeContext);
  if (!ctx) throw new Error('useUpgrade must be used within UpgradeProvider');
  return ctx;
}
