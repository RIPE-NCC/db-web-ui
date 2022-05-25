import { Injectable } from '@angular/core';
import * as _ from 'lodash';

export interface ICredentials {
    mntner: string;
    successfulPassword: string;
}

@Injectable()
export class CredentialsService {
    private credentials: ICredentials;

    public setCredentials(mntner: string, successfulPassword: string) {
        this.credentials = {
            mntner,
            successfulPassword,
        };
    }

    public removeCredentials() {
        this.credentials = undefined;
    }

    public hasCredentials() {
        return !_.isUndefined(this.credentials);
    }

    public getCredentials() {
        return this.credentials;
    }

    public getPasswordsForRestCall(objectType: string): string[] {
        const passwords = [];
        if (this.hasCredentials()) {
            passwords.push(this.credentials.successfulPassword);
        }
        return passwords;
    }
}
