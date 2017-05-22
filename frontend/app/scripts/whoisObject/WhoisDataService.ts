/**
 * Supercedes restService.js
 */
class WhoisDataService {

    public static $inject = [
        "$log",
        "$http"];

    constructor(private $log: angular.ILogService,
                private $http: angular.IHttpService) {
    }

    public fetchObject(source: string,
                       objectType: string,
                       objectName: string,
                       password?: string,
                       unformatted?: boolean): IPromise<IWhoisResponseModel> {

        const urlArr = [
            "api/whois/",
            source,
            "/",
            objectType,
            "/",
            decodeURIComponent(objectName),
        ];
        const params: {["unfiltered"]?: boolean, ["unformatted"]?: string, ["password"]?: string} = {};

        // TODO: check that the password is encoded properly -- test with some url-unfriendly chars
        if (typeof unformatted === "boolean") {
            params.unfiltered = true;
            params.unformatted = "" + unformatted;
        }
        if (typeof password === "string") {
            params.password = password;
        }

        return this.$http({
            method: "GET",
            params,
            timeout: 10000,
            url: urlArr.join(""),
        });
    }
}

angular
    .module("dbWebApp")
    .service("WhoisDataService", WhoisDataService);
