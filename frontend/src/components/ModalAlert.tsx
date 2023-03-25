import React, {
  useEffect, useRef,
} from 'react';

// should be exported, but importing in alertContext
// means a dependency cycle and we don't have an FE type folder
// FIXME(Alert was since moved to a separate component from AlertContainer, is this still relevant?)
type AlertVariants = 'danger' | 'warning' | 'success' | 'info';

interface AlertProps {
  message?: string;
  variant: AlertVariants;
  clearAlert: () => void
  removalDelaySecs?: number;
}

function Alert({
  message, variant, clearAlert, removalDelaySecs = 1000,
}: AlertProps) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const baseAlertClasses = 'text-white text-ft-body pl-12 pr-2 py-1 '
                         + 'flex justify-between items-center ease-linear';

  const alertVariantClasses = {
    danger: 'bg-ft-danger-300',
    warning: 'bg-ft-warning-200 text-black',
    info: 'bg-ft-neutral-400',
    success: 'bg-ft-success-200',
  };

  // the technically extra timer clears are because
  // of strictmode creating extra timers
  useEffect(() => {
    if (timer.current) { clearTimeout(timer.current); }
    timer.current = setTimeout(() => clearAlert(), removalDelaySecs * 1000);
  }, []);

  const handleMouseEnter = () => {
    // stop doom timer whenever element is mouseovered
    if (timer.current) { clearTimeout(timer.current); }
  };

  const handleMouseLeave = () => {
    // start countdown to remove yourself again
    if (removalDelaySecs) {
      if (timer.current) { clearTimeout(timer.current); }
      timer.current = setTimeout(() => clearAlert(), removalDelaySecs * 1000);
    }
  };

  if (message) {
    return (
      <div
        className={`${baseAlertClasses} ${alertVariantClasses[variant]}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="">
          {message}
        </span>
      </div>
    );
  }

  return null;
}

export default Alert;
