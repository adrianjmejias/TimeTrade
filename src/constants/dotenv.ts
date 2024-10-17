import { config } from "dotenv";
config({ path: "../../.env" });

const RIOT_API_KEY = process.env.RIOT_API_KEY;

console.log(RIOT_API_KEY);
