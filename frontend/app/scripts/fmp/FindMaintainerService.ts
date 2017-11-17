interface IFindMaintainerService {
    search(maintainerKey: string): ng.IPromise<any>;
    sendMail(mntKey: string): ng.IPromise<any>;
}

class FindMaintainerService implements IFindMaintainerService {
    public static $inject = ["$http", "$log", "$q"];
    private readonly API_BASE_URL: string = "api/whois-internal/api/fmp-pub/mntner/";

    constructor(private $http: ng.IHttpService,
                private $log: angular.ILogService,
                private $q: ng.IQService) {
    }

    public search(maintainerKey: string): angular.IPromise<IFindMaintainer> {
        return this.find(maintainerKey)
            .then((result: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                return this.validate(maintainerKey)
                    .then((validationResult: ng.IHttpPromiseCallbackArg<{expired: boolean}>) => {
                        return new FoundMaintainer(maintainerKey,
                            result.data.objects.object[0],
                            validationResult.data.expired);
                }, (error: any) => this.$q.reject("switchToManualResetProcess"));
        }, (error: any) => {
                if (error.status === 404) {
                    return this.$q.reject("The maintainer could not be found.");
                } else {
                    return this.$q.reject("Error fetching maintainer");
                }
            },
        );
    }

    public sendMail(mntKey: string): ng.IPromise<any> {
        this.$log.info("Posting data to url {} with object {}.", this.API_BASE_URL, mntKey);
        return this.$http.post(this.API_BASE_URL + mntKey + "/emaillink.json", {maintainerKey: mntKey});
    }

    private find(maintainerKey: string): ng.IPromise<any> {
        this.$log.info("Posting data to url {} with object {}.", this.API_BASE_URL, maintainerKey);
        return this.$http.get(this.API_BASE_URL + maintainerKey);
    }

    private validate(maintainerKey: string): ng.IPromise<any> {
        this.$log.info("Posting data to url {} with object {}.", this.API_BASE_URL, maintainerKey);
        return this.$http.get(this.API_BASE_URL + maintainerKey + "/validate");
    }
}

angular
    .module("fmp")
    .service("FindMaintainerService", FindMaintainerService);
