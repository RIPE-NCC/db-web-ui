interface IForgotMaintainerPasswordService {
    generatePdfAndEmail(forgotPasswordMaintainerModel: IForgotMaintainerPassword): ng.IPromise<string>;
}

class ForgotMaintainerPasswordService implements IForgotMaintainerPasswordService {
    public static $inject = ["$http", "$log"];
    private readonly API_BASE_URL: string = "api/whois-internal/api/fmp-pub/forgotmntnerpassword";

    constructor(private $http: ng.IHttpService,
                private $log: angular.ILogService) {
    }

    public generatePdfAndEmail(forgotPasswordMaintainerModel: IForgotMaintainerPassword): ng.IPromise<string> {
        this.$log.info("Posting data to url {} with object {}.", this.API_BASE_URL, forgotPasswordMaintainerModel);
        return this.$http.post(this.API_BASE_URL, forgotPasswordMaintainerModel, {})
            .then(() => this.API_BASE_URL + "/" + btoa(JSON.stringify(forgotPasswordMaintainerModel)));
    }
}

angular
    .module("fmp")
    .service("ForgotMaintainerPasswordService", ForgotMaintainerPasswordService);
