export const CMD_COMMANDS = {
  leagueOfLegendsGameClient:
    "wmic process where \"name='League of Legends.exe'\" get ProcessId,CommandLine",
} as const;
