import { FirebaseOptions } from "firebase/app";
import { Telegraf } from "telegraf";

require('dotenv').config();

export const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID
};
export const firebaseAuth = {
    login: process.env.FB_EMAIL,
    password: process.env.FB_PASS
};
export const serverPort = 3000;
export const { SUPERADMIN_PASS, PRIVATE_KEY, TG_BOT_TOKEN } = process.env;

export const bot = new Telegraf(TG_BOT_TOKEN);
