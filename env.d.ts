declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_HOST: string;
            DB_USER: string;
            DB_PASSWORD: string;
            DB_NAME: string;
            DB_PORT?: string;
            SESSION_SECRET: string;
            JWT_SECRET: string;
        }
    }
}