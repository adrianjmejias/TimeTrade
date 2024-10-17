import { useEffect, useState } from "react";

export const useTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const formatTime = () => {
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const reset = () => {
    setSeconds(0);
    setMinutes(0);
    setHours(0);
    setIsActive(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds < 59) {
            return prevSeconds + 1;
          } else {
            setMinutes((prevMinutes) => {
              if (prevMinutes < 59) {
                return prevMinutes + 1;
              } else {
                setHours((prevHours) => prevHours + 1);
                return 0;
              }
            });
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval!);
  }, [isActive]);

  return { seconds, minutes, hours, isActive, toggle, reset, formatTime };
};
