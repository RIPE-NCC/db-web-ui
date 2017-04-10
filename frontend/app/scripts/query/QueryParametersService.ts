interface IQueryParametersService {
    searchWhoisObjects(queryString: string,
                       source: string,
                       types: {},
                       flags: string,
                       inverse: {}): IHttpPromise<IWhoisResponseModel>;

    getWhoisObject(key: string,
                   type: string,
                   source: string): IHttpPromise<IWhoisResponseModel>;
}

class QueryParametersService implements IQueryParametersService {
    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService,
                private $http: angular.IHttpService) {
    }

    public searchWhoisObjects(queryString: string,
                              source: string,
                              types: {},
                              flags: string,
                              inverse: {}): IHttpPromise<IWhoisResponseModel> {

        const typeFilter = _.filter(Object.keys(types), (type: string) => types[type]).join(",");
        const inverseFilter = _.filter(Object.keys(inverse), (inv: string) => inverse[inv]).join(",");
        const config: angular.IRequestShortcutConfig = {};
        config.params = {
            "ignore404": true,
            "query-string": queryString,
        };
        if (typeFilter) {
            config.params["type-filter"] = typeFilter.replace("_", "-");
        }
        if (inverseFilter) {
            config.params["inverse-attribute"] = inverseFilter.replace("_", "-");
        }
        if (flags) {
            config.params.flags = flags;
        }
        return this.$http.get("api/whois/search", config);
    }

    public getWhoisObject(key: string,
                          type: string,
                          source: string): IHttpPromise<IWhoisResponseModel> {
        return this.$http.get("api/whois/" + source + "/" + type + "/" + key);
    }
}

angular
    .module("dbWebApp")
    .service("QueryParametersService", QueryParametersService);
