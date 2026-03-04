import { Injectable } from '@angular/core';

export interface ICredentials {
    mntner: string;
    successfulOverride: string;
}

@Injectable({ providedIn: 'root' })
export class OverrideCredentialsService {
    private credentials: ICredentials[] = [];

    public setCredentials(mntner: string, successfulOverride: string) {
        this.credentials.push({
            mntner,
            successfulOverride,
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

    public getOverrideForRestCall(): string[] {
        if (this.hasCredentials()) {
            return this.credentials.map((cred) => cred.successfulOverride);
        }
        return [];
    }
}
