import React, { createContext, useMemo, useState } from 'react';
import type { PopupProps } from '../components/Popup';

interface PopupContextFuncs {
  showPopup: (newPopupProps: PopupProps) => void,
  clearPopup: () => void,
}

type PopupState = ({
  isPopupShown: true,
  popupProps: PopupProps,
} | {
  isPopupShown: false,
  popupProps: undefined,
});

type PopupContextType = PopupContextFuncs & { popupState: PopupState };

const PopupContext = createContext<PopupContextType | null>(null);

interface PopupProviderProps {
  children?: React.ReactNode;
}

export function PopupProvider({ children }: PopupProviderProps) {
  const [popupState, setPopupState] = useState<PopupState>(
    {
      isPopupShown: false,
      popupProps: undefined,
    },
  );

  const showPopup = (newPopupProps: PopupProps): void => {
    setPopupState({ isPopupShown: true, popupProps: newPopupProps });
  };

  const clearPopup = (): void => {
    setPopupState({ isPopupShown: false, popupProps: undefined });
  };

  // memo so object reference doesn't change all the time
  const popupValue = useMemo(() => ({
    popupState, showPopup, clearPopup,
  }), [popupState, showPopup, clearPopup]);

  return (
    <PopupContext.Provider value={popupValue}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopupContext() {
  const context = React.useContext(PopupContext);
  if (!context) {
    throw new Error('Context is undefined. usePopupContext must be used within a PopupProvider');
  }
  return context;
}
