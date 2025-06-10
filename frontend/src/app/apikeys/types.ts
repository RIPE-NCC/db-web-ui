export type ApiKey = {
    label: string;
    lastUsed?: Date;
    expiresAt: string;
    details?: string;
    application?: string;
    scopes?: string[];
    id?: string;
    secretKey?: string;
    userId?: string;
};
