import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute, convertToParamMap, ParamMap, Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {of, throwError} from "rxjs";
import {DeleteComponent} from "../../../../app/ng/updates/web/delete.component";
import {AlertsComponent} from "../../../../app/ng/shared/alert/alerts.component";
import {WhoisResourcesService} from "../../../../app/ng/shared/whois-resources.service";
import {AlertsService} from "../../../../app/ng/shared/alert/alerts.service";
import {WhoisMetaService} from "../../../../app/ng/shared/whois-meta.service";

describe("DeleteController", () => {
    const OBJECT_TYPE = "as-block";
    const SOURCE = "RIPE";
    const ON_CANCEL = "modify";

    let objectToDisplay: any;
    let multipleObjectsToDisplay: any;
    let whoisObjectWithErrors: any;

    let httpMock: HttpTestingController;
    let component: DeleteComponent;
    let fixture: ComponentFixture<DeleteComponent>;
    let routerMock: any;
    let modalMock: any;
    let paramMapMock: ParamMap;
    let queryParamMock: ParamMap;
    let whois: WhoisResourcesService;

    beforeEach(() => {
        paramMapMock = convertToParamMap({source: SOURCE, objectType: OBJECT_TYPE, objectName: "AS1 - AS2"});
        queryParamMock = convertToParamMap({onCancel: ON_CANCEL});
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        modalMock = jasmine.createSpyObj("NgbModal", ["open"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                DeleteComponent, AlertsComponent
            ],
            providers: [
                WhoisResourcesService,
                AlertsService,
                WhoisMetaService,
                {provide: NgbModal, useValue: modalMock},
                {provide: Router, useValue: routerMock},
                {
                    provide: ActivatedRoute, useValue: {
                        snapshot: {
                            paramMap: paramMapMock,
                            queryParamMap: queryParamMock,
                        }
                    }
                }
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        fixture = TestBed.createComponent(DeleteComponent);
        component = fixture.componentInstance;
        whois = TestBed.get(WhoisResourcesService);

        objectToDisplay = whois.wrapWhoisResources({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "as-block", value: "AS1 - AS2"}]},
                        attributes: {
                            attribute: [
                                {name: "as-block", value: "AS1 - AS2"},
                                {name: "mnt-by", value: "TEST-MNT"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            }
        });

        multipleObjectsToDisplay = whois.wrapWhoisResources({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "as-block", value: "AS1 - AS2"}]},
                        attributes: {
                            attribute: [
                                {name: "as-block", value: "AS1 - AS2"},
                                {name: "mnt-by", value: "TEST-MNT"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    },
                    {
                        "primary-key": {attribute: [{name: "as-block", value: "AS10 - AS20"}]},
                        attributes: {
                            attribute: [
                                {name: "as-block", value: "AS10 - AS20"},
                                {name: "mnt-by", value: "TEST-MNT"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            }
        });

        whoisObjectWithErrors = {
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "as-block", value: "MY-AS-BLOCK"}]},
                        attributes: {
                            attribute: [
                                {name: "as-block", value: "MY-AS-BLOCK"},
                                {name: "mnt-by", value: "TEST-MNT"},
                                {name: "source", value: "RIPE"}
                            ]
                        }
                    }
                ]
            },
            errormessages: {
                errormessage: [
                    {
                        severity: "Error",
                        text: "Unrecognized source: %s",
                        "args": [{value: "INVALID_SOURCE"}]
                    },
                    {
                        severity: "Warning",
                        text: "Not authenticated"
                    }, {
                        severity: "Error",
                        attribute: {
                            name: "as-block",
                            value: "MY-AS-BLOCK"
                        },
                        text: "\'%s\' is not valid for this object type",
                        args: [{value: "MY-AS-BLOCK"}]
                    }
                ]
            }
        };
    });

    afterEach(() => {
       httpMock.verify();
    });


    it("should display delete object modal", async () => {
        fixture.detectChanges();
        modalMock.open.and.returnValue({componentInstance: {}, result: of(objectToDisplay).toPromise()});
        await fixture.whenStable();

        expect(modalMock.open).toHaveBeenCalled();
        expect(modalMock.open().componentInstance.inputData).toEqual({ name: "AS1 - AS2", objectType: OBJECT_TYPE, onCancelPath: ON_CANCEL, source: SOURCE });
    });

    it("should display errors if delete object fail", async () => {
        const error = {
            data: whoisObjectWithErrors
        };

        modalMock.open.and.returnValue({componentInstance: {}, result: throwError(whois.wrapError(error)).toPromise()});
        fixture.detectChanges();

        await fixture.whenStable();
        expect(component.alertService.getErrors()).toEqual([{
            severity: "Error",
            text: "Unrecognized source: %s",
            args: [{value: "INVALID_SOURCE"}],
            plainText: "Unrecognized source: INVALID_SOURCE"
        }]);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });


    it("should display generic errors if delete object fail without returning a whois object", async () => {
        const error = {
            data: "just text"
        };

        modalMock.open.and.returnValue({componentInstance: {}, result: throwError(whois.wrapError(error)).toPromise()});
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.alertService.getErrors()).toEqual([{
            severity: "Error",
            text: "Unexpected error: please retry later",
            plainText: "Unexpected error: please retry later"
        }]);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it("should populate the ui after delete with 1 object", async () => {
        modalMock.open.and.returnValue({componentInstance: {}, result: of(objectToDisplay).toPromise()});

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.deletedObjects.length).toBe(1);

        const whoisobject = whois.wrapAttributes(component.deletedObjects[0].attributes.attribute);
        expect(whoisobject.getSingleAttributeOnName("as-block").value).toBe("AS1 - AS2");

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it("should populate the ui from message-store - Multiple objects", async () => {
        modalMock.open.and.returnValue({componentInstance: {}, result: of(multipleObjectsToDisplay).toPromise()});

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.deletedObjects.length).toBe(2);

        const asblock1 = whois.wrapAttributes(component.deletedObjects[0].attributes.attribute);
        const asblock2 = whois.wrapAttributes(component.deletedObjects[1].attributes.attribute);

        expect(asblock1.getSingleAttributeOnName("as-block").value).toBe("AS1 - AS2");
        expect(asblock2.getSingleAttributeOnName("as-block").value).toBe("AS10 - AS20");

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });
});
