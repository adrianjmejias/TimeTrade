import { exec } from "child_process";
import type { TCMD_COMMANDS } from "@/types/utilityTypes";
//import PS from "ps-node";

export function checkAppStatus(command: TCMD_COMMANDS) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        resolve(false); // Resolve false if there's an error or stderr
      } else {
        resolve(!!stdout.trim()); // Resolve true if output exists, false otherwise
      }
    });
  }) as Promise<boolean>;
}
