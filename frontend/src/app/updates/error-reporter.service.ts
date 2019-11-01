import {Injectable} from "@angular/core";
import {Location} from "@angular/common";
import * as _ from "lodash";
import {IAttributeModel} from "../shared/whois-response-type.model";

@Injectable()
export class ErrorReporterService {

    constructor(private location: Location) {}

    public log(operation: string, objectType: string, globalErrors: any, attributes?: IAttributeModel[]) {
        _.each(globalErrors, (item: any) => {
            console.error("url:" + this.location.path() + ", operation:" + operation + ", objectType: " + objectType + ", description: " + item.plainText);
            // this.$analytics.eventTrack("FormSubmitAction", {
            //     category: "Form Validation Error",
            //     label: objectType,
            //     value: item.plainText,
            // });
        });
        _.each(attributes, (item: any) => {
            if (!_.isUndefined(item.$$error)) {
                console.error("url:" + this.location.path() + ", operation:" + operation + ", objectType: " + objectType +
                    ", attributeType: " + item.name + ", description: " + item.$$error);
                // this.$analytics.eventTrack("FormSubmitAction", {
                //     category: "Form Validation Error",
                //     label: objectType + "." + item.name,
                //     value: item.$$error,
                // });
            }
        });
    }
}
