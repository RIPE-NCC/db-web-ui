export type ApiKey = {
    name: string;
    lastUsed: string;
    expirationDate: string;
    details?: string;
    application?: string;
    scopes?: string[];
    accessKey?: string;
    secretKey?: string;
    userId?: string;
};
