class EmailLinkService {

    public static $inject = ["$http"];

    private url = "api/whois-internal/api/fmp-pub/emaillink";

    constructor(private $http: ng.IHttpService) {}

    public get(hash: string): angular.IHttpPromise<any> {
        return this.$http.get(`${this.url}/${hash}.json`);
    }

    public update(hash: string): angular.IHttpPromise<any> {
        return this.$http.put(`${this.url}/${hash}.json`, {hash});
    }
}

angular.module("fmp").service("EmailLink", EmailLinkService);
