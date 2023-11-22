import { Injectable } from '@angular/core';

export interface ICredentials {
    mntner: string;
    successfulPassword: string;
}

@Injectable()
export class CredentialsService {
    private credentials: ICredentials[] = [];

    public setCredentials(mntner: string, successfulPassword: string) {
        this.credentials.push({
            mntner,
            successfulPassword,
        });
    }

    public removeCredentials() {
        this.credentials = [];
    }

    public hasCredentials() {
        return this.credentials.length > 0;
    }

    public getCredentials() {
        return this.credentials;
    }

    public getPasswordsForRestCall(): string[] {
        if (this.hasCredentials()) {
            return this.credentials.map((cred) => cred.successfulPassword);
        }
        return [];
    }
}
