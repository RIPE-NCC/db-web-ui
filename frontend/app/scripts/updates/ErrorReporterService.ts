class ErrorReporterService {

    public static $inject = ["$log", "$location", "$analytics"];
    constructor(private $log: angular.ILogService, private $location: angular.ILocationService, private $analytics: any) {}

    public log(operation: string, objectType: string, globalErrors: any, attributes: IAttributeModel[]) {
        _.each(globalErrors, (item: any) => {
            this.$log.error("url:" + this.$location.path() + ", operation:" + operation + ", objectType: " + objectType + ", description: " + item.plainText);
            this.$analytics.eventTrack("FormSubmitAction", {
                category: "Form Validation Error",
                label: objectType,
                value: item.plainText,
            });

        });
        _.each(attributes, (item: any) => {
            if (!_.isUndefined(item.$$error)) {
                this.$log.error("url:" + this.$location.path() + ", operation:" + operation + ", objectType: " + objectType + ", attributeType: " + item.name + ", description: " + item.$$error);
                this.$analytics.eventTrack("FormSubmitAction", {
                    category: "Form Validation Error",
                    label: objectType + "." + item.name,
                    value: item.$$error,
                });
            }
        });
    }
}

angular.module("updates").service("ErrorReporterService", ErrorReporterService);
