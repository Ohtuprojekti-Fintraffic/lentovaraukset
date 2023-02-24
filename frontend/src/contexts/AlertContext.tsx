import React, {
  createContext, useState, useMemo,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

// duplicate from AlertContainer.tsx, but
// otherwise we get a dependency cycle
// FIXME when we get a type folder for FE
interface AlertType {
  id: string
  text: string
  variant: 'danger' | 'warning' | 'success' | 'info',
  removalDelayMillis?: number;
}

interface AlertFunc {
  (text: string, variant: AlertType['variant'], removalDelayMillis?: number): void
}

export interface AlertContextType {
  alerts: AlertType[]
  addNewAlert: AlertFunc
  removeAlertById: (removedId: string) => void;
}

const AlertContext = createContext<AlertContextType>(
  // ugly temporary cast because
  // AlertContextProvider fills the fields
  {} as AlertContextType,
);

export function AlertContextProvider({ children }: { children?: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const addNewAlert: AlertFunc = (text, variant, removalDelayMillis = 5000) => {
    const id = uuidv4();

    const newAlert: AlertType = {
      id, variant, text, removalDelayMillis,
    };
    setAlerts((arr) => [...arr, newAlert]);
  };

  const removeAlertById = (removedId: string): void => {
    setAlerts((arr) => arr.filter(({ id }) => (id !== removedId)));
  };

  // memo so object reference doesn't change all the time
  const ctxObj = useMemo(
    () => ({ alerts, addNewAlert, removeAlertById }),
    [alerts, addNewAlert, removeAlertById],
  );

  return (
    <AlertContext.Provider value={ctxObj}>{children}</AlertContext.Provider>
  );
}

export default AlertContext;
