import { CMD_COMMANDS } from "./../constants/cmdCommands";
export type ValueOf<T> = T[keyof T];

export type TCMD_COMMANDS = ValueOf<typeof CMD_COMMANDS>;
