interface ILookupService {
    lookupWhoisObject(params: ILookupState): ng.IHttpPromise<IWhoisResponseModel>;
}

class LookupService implements ILookupService {

    public static $inject = ["$http"];

    constructor(private $http: angular.IHttpService) {
    }

    public lookupWhoisObject(lookupState: ILookupState): ng.IHttpPromise<IWhoisResponseModel> {
        if (!lookupState.key || !lookupState.source || !lookupState.type) {
            throw new TypeError("Not a valid ILookupState");
        }
        const url = ["api/whois/"];
        url.push(lookupState.source);
        url.push("/");
        url.push(lookupState.type);
        url.push("/");
        url.push(lookupState.key);

        const config: angular.IRequestShortcutConfig = {
            params: {
                "abuse-contact": true,
                "managed-attributes": true,
                "resource-holder": true,
            },
        };
        return this.$http.get<IWhoisResponseModel>(url.join(""), config);
    }
}

angular
    .module("dbWebApp")
    .service("LookupService", LookupService);
