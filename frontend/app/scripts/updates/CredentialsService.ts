class CredentialsService {

    private credentials: {
        mntner: string;
        successfulPassword: string;
    };

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
        return angular.isDefined(this.credentials);
    }

    public getCredentials() {
        return this.credentials;
    }

    public getPasswordsForRestCall(objectType: string) {
        const passwords = [];

        if (this.hasCredentials()) {
            passwords.push(this.credentials.successfulPassword);
        }

        /*
         * For routes and aut-nums we always add the password for the RIPE-NCC-RPSL-MNT
         * This to allow creation for out-of-region objects, without explicitly asking for the RIPE-NCC-RPSL-MNT-pasword
         */
        if (["route", "route6", "aut-num"].indexOf(objectType) > -1) {
            passwords.push("RPSL");
        }
        return passwords;
    }

}

angular
    .module("dbWebApp")
    .service("CredentialsService", CredentialsService);
