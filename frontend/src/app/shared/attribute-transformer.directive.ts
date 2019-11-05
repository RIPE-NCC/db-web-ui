import {Directive, ElementRef, HostListener, ViewContainerRef} from "@angular/core";

@Directive({
    selector: '[attributetransformer]'
})
export class AttributeTransformerDirective {
    // constructor(vc: ViewContainerRef) {
    //     vc.constructor.
    // }
    // // trim value and in case of empty string putting null
    // @HostListener('input', ['$event'])
    // onKeyDown(event: KeyboardEvent) {
    //     const value = (event.target as HTMLInputElement).value.trim();
    //     this.control.control.patchValue((value === '') ? null : value);
    // }
}

// angular.module("webUpdates")
//         .directive("attributetransformer", [() => {
//             return {
//                 link: (scope: any, elem: any, attrs: any, ngModel: any) => {
//
//                     function doTransform(viewValue: any) {
//                         let transformed = viewValue;
//                         console.info("name:" + attrs.name + " with value " + viewValue);
//
//                         if (attrs.name === "inetnum" && viewValue) {
//                             // Add spaces around inetnum to make sure auto-complete service can find it
//                             const addresses = viewValue.split("-");
//                             if (addresses.length === 2) {
//                                 transformed = _.trim(addresses[0]) + " - " + _.trim(addresses[1]);
//                             }
//                         }
//                         return transformed;
//                     }
//
//                     ngModel.$parsers.push(doTransform);
//                 },
//                 require: "ngModel",
//                 restrict: "A",
//             };
//         }]);
