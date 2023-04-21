import React, {
  useEffect, useRef,
} from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { AlertContextType } from '../contexts/AlertContext';
import Button from './Button';

// should be exported, but importing in alertContext
// means a dependency cycle and we don't have an FE type folder
// FIXME(Alert was since moved to a separate component from AlertContainer, is this still relevant?)
type AlertVariants = 'danger' | 'warning' | 'success' | 'info';

interface AlertProps {
  id: string;
  text: string;
  variant: AlertVariants;
  removeAlertById: AlertContextType['removeAlertById'];
  removalDelayMillis?: number;
}

function Alert({
  id, text, variant, removalDelayMillis, removeAlertById,
}: AlertProps) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const baseAlertClasses = 'text-white text-ft-body pl-12 pr-2 py-1 '
                         + 'border-b flex justify-between items-center ease-linear';

  const alertVariantClasses = {
    danger: 'bg-ft-danger-300 border-ft-danger-400',
    warning: 'bg-ft-warning-200 border-ft-warning-300 text-black',
    info: 'bg-ft-neutral-400 border-black',
    success: 'bg-ft-success-200 border-ft-success-300',
  };

  // the technically extra timer clears are because
  // of strictmode creating extra timers
  useEffect(() => {
    if (timer.current) { clearTimeout(timer.current); }
    timer.current = setTimeout(() => removeAlertById(id), removalDelayMillis);
  }, []);

  const handleMouseEnter = () => {
    // stop doom timer whenever element is mouseovered
    if (timer.current) { clearTimeout(timer.current); }
  };

  const handleMouseLeave = () => {
    if (timer.current) { clearTimeout(timer.current); }
    // start countdown to remove yourself again
    timer.current = setTimeout(() => removeAlertById(id), removalDelayMillis);
  };

  const removeButtonHandler = () => {
    if (timer.current) { clearTimeout(timer.current); }
    // start countdown to remove yourself again
    removeAlertById(id);
  };

  return (
    <div
      className={twMerge(baseAlertClasses, alertVariantClasses[variant])}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="">
        {text}
      </span>
      <Button variant="glyph" className="ml-4 mr-6" onClick={removeButtonHandler}>
        <X strokeWidth="1.5" color="white" />
      </Button>
    </div>
  );
}

export default Alert;
