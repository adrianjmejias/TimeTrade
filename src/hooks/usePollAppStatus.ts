import { APP_STATUS } from "../constants/appStatus.ts";
import { checkAppStatus } from "../services/checkAppStatus.ts";
import { TCMD_COMMANDS } from "../types/utilityTypes.ts";
import { useEffect, useState } from "react";

export const usePollAppStatus = (command: TCMD_COMMANDS, game: string) => {
  const [isAppRunning, setIsAppRunning] = useState(false);
  const [wasAppRunning, setWasAppRunning] = useState(false); // To track previous state
  const [message, setMessage] = useState(`${game} ${APP_STATUS.not_running}`);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const appRunning = await checkAppStatus(command);
        setIsAppRunning(appRunning);
        setMessage(
          `${game} ${appRunning ? APP_STATUS.running : APP_STATUS.not_running}`
        );

        // Check for transition from not running to running
        if (!wasAppRunning && appRunning) {
          setWasAppRunning(true); // App just started running
        }

        // Check for transition from running to not running
        if (wasAppRunning && !appRunning) {
          setTimeout(() => {
            setWasAppRunning(false); // App just stopped running, delay turning off wasAppRunning
          }, 10); // Allows wasAppRunning to be true when isAppRunning is false for one cycle
        }
      } catch (error) {
        console.error("Error polling app status:", error);
        setMessage(`Error checking status for ${game}`);
      }
    };

    const intervalId = setInterval(pollStatus, 5000);
    pollStatus(); // Run immediately once

    return () => clearInterval(intervalId);
  }, [command, game, wasAppRunning]);

  return { isAppRunning, wasAppRunning, message };
};
