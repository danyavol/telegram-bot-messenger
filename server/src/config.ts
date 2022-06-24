import { FirebaseOptions } from "firebase/app";

require('dotenv').config();

export const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID
};

export const telegramBotToken = process.env.TG_BOT_TOKEN;

export const firebaseAuth = {
    login: process.env.FB_EMAIL,
    password: process.env.FB_PASS
};
