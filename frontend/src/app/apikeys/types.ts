export type ApiKey = {
    label: string;
    lastUsed?: string;
    expiresAt: string;
    details?: string;
    application?: string;
    scopes?: string[];
    accessKey?: string;
    secretKey?: string;
    userId?: string;
};
