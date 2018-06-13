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
        if (this.hasCredentials()) {
            return this.credentials.successfulPassword;
        }
        return [];
    }

}

angular
    .module("dbWebApp")
    .service("CredentialsService", CredentialsService);
