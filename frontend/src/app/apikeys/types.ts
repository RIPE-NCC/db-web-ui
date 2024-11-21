export type ApiKey = {
    label: string;
    createdAt: string;
    expiresAt: string;
    details?: string;
    application?: string;
    scopes?: string[];
    accessKey?: string;
    secretKey?: string;
    userId?: string;
};
