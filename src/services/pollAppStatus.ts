import { CMD_COMMANDS } from "@/constants/cmdCommands.js";
import { checkAppStatus } from "./checkAppStatus.js";
import { APP_STATUS } from "@/constants/appStatus.js";
import { ValueOf } from "@/types/utilityTypes.js";

//unused, only used for testing purposes
export async function pollAppStatus(
  command: ValueOf<typeof CMD_COMMANDS>,
  app: string,
  timer: number
) {
  setInterval(async () => {
    const appRunning = await checkAppStatus(command);
    if (appRunning) {
      return `${app} ${APP_STATUS.running}`;
    } else {
      return `${app} ${APP_STATUS.not_running}`;
    }
  }, timer);
}

console.log(
  pollAppStatus(
    CMD_COMMANDS.leagueOfLegendsGameClient,
    "League Of Legends",
    5000
  )
);
