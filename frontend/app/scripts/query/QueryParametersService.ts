interface IQueryParametersService {

    searchWhoisObjects(queryString: string,
                       source: string,
                       types: { [objectName: string]: boolean },
                       flags: string,
                       inverse: { [attrName: string]: boolean }): ng.IHttpPromise<IWhoisResponseModel>;
}

class QueryParametersService implements IQueryParametersService {
    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService,
                private $http: angular.IHttpService) {
    }

    public searchWhoisObjects(queryString: string,
                              source: string,
                              types: { [objectName: string]: boolean },
                              flags: string,
                              inverse: { [attrName: string]: boolean }): ng.IHttpPromise<IWhoisResponseModel> {

        const typeFilter = _.filter(Object.keys(types), type => types[type]).join(",");
        const inverseFilter = _.filter(Object.keys(inverse), inv => inverse[inv]).join(",");
        const config: angular.IRequestShortcutConfig = {};
        config.params = {
            "abuse-contact": true,
            "ignore404": true,
            "managed-attributes": true,
            "query-string": queryString,
            "resource-holder": true,
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

}

angular
    .module("dbWebApp")
    .service("QueryParametersService", QueryParametersService);
