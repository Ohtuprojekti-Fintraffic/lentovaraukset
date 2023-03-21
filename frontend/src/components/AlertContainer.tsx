import React, { useContext } from 'react';
import AlertContext from '../contexts/AlertContext';
import Alert from './Alert';

function AlertContainer() {
  const { alerts, removeAlertById } = useContext(AlertContext);

  return (
    <>
      {alerts.map(
        ({
          id, variant, text, removalDelayMillis,
        }) => (
          <Alert
            key={id}
            variant={variant}
            text={text}
            id={id} // so alert can remove itself
            removeAlertById={removeAlertById}
            removalDelayMillis={removalDelayMillis}
          />
        ),
      )}
    </>
  );
}

export default AlertContainer;
