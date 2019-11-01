import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ActivatedRoute, convertToParamMap, ParamMap, Router} from "@angular/router";
import {AlertsComponent} from "../../../../src/app/shared/alert/alerts.component";
import {DisplayMntnerPairComponent} from "../../../../src/app/updates/web/display-mntner-pair.component";
import {MessageStoreService} from "../../../../src/app/updates/message-store.service";
import {WhoisResourcesService} from "../../../../src/app/shared/whois-resources.service";
import {WhoisMetaService} from "../../../../src/app/shared/whois-meta.service";
import {RestService} from "../../../../src/app/updates/rest.service";
import {AlertsService} from "../../../../src/app/shared/alert/alerts.service";

describe("displayPairComponent", () => {

    const SOURCE = "RIPE";
    const PERSON_NAME = "dw-ripe";
    const MNTNER_NAME = "aardvark-mnt";

    let httpMock: HttpTestingController;
    let component: DisplayMntnerPairComponent;
    let fixture: ComponentFixture<DisplayMntnerPairComponent>;
    let routerMock: any;
    let paramMapMock: ParamMap;
    let queryParamMock: ParamMap;
    let messageStoreServiceMock: any;
    let personToDisplay: any;
    let mntnerToDisplay: any;

    beforeEach(() => {
        paramMapMock = convertToParamMap({source: SOURCE, person: PERSON_NAME, mntner: MNTNER_NAME});
        queryParamMock = convertToParamMap({});
        routerMock = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
        messageStoreServiceMock = jasmine.createSpyObj("MessageStoreService", ["get"]);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [
                DisplayMntnerPairComponent, AlertsComponent
            ],
            providers: [
                WhoisResourcesService,
                WhoisMetaService,
                RestService,
                AlertsService,
                {provide: MessageStoreService, useValue: messageStoreServiceMock},
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
        fixture = TestBed.createComponent(DisplayMntnerPairComponent);
        component = fixture.componentInstance;
        const whois = TestBed.get(WhoisResourcesService);
        personToDisplay = whois.wrapWhoisResources({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "person", value: PERSON_NAME}]},
                        attributes: {
                            attribute: [
                                {name: "person", value: PERSON_NAME},
                                {name: "mnt-by", value: MNTNER_NAME},
                                {name: "source", value: SOURCE}
                            ]
                        }
                    }
                ]
            }
        });
        mntnerToDisplay = whois.wrapWhoisResources({
            objects: {
                object: [
                    {
                        "primary-key": {attribute: [{name: "mntner", value: MNTNER_NAME}]},
                        attributes: {
                            attribute: [
                                {name: "mntner", value: MNTNER_NAME},
                                {name: "admin-c", value: PERSON_NAME},
                                {name: "mnt-by", value: MNTNER_NAME},
                                {name: "source", value: SOURCE}
                            ]
                        }
                    }
                ]
            }
        });
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should extract data from url", () => {
        messageStoreServiceMock.get.withArgs(PERSON_NAME).and.returnValue(personToDisplay);
        messageStoreServiceMock.get.withArgs(MNTNER_NAME).and.returnValue(mntnerToDisplay);

        fixture.detectChanges();

        expect(component.objectSource).toBe(SOURCE);
        expect(component.objectTypeName).toBe(PERSON_NAME);
        expect(component.mntnerName).toBe(MNTNER_NAME);
    });


    it("should populate the ui from message-store", () => {
        messageStoreServiceMock.get.withArgs(PERSON_NAME).and.returnValue(personToDisplay);
        messageStoreServiceMock.get.withArgs(MNTNER_NAME).and.returnValue(mntnerToDisplay);

        fixture.detectChanges();

        // @ts-ignore
        expect(component.objectTypeAttributes.getSingleAttributeOnName("person").value).toBe(PERSON_NAME);
        // @ts-ignore
        expect(component.objectTypeAttributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(MNTNER_NAME);
        // @ts-ignore
        expect(component.objectTypeAttributes.getSingleAttributeOnName("source").value).toEqual(SOURCE);

        // @ts-ignore
        expect(component.mntnerAttributes.getSingleAttributeOnName("mntner").value).toBe(MNTNER_NAME);
        // @ts-ignore
        expect(component.mntnerAttributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(MNTNER_NAME);
        // @ts-ignore
        expect(component.mntnerAttributes.getSingleAttributeOnName("admin-c").value).toEqual(PERSON_NAME);
        // @ts-ignore
        expect(component.mntnerAttributes.getSingleAttributeOnName("source").value).toEqual(SOURCE);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it("should populate the ui from rest ok", () => {
        // no objects in message store
        fixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/dw-ripe?unfiltered=true"}).flush(personToDisplay);
        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/mntner/aardvark-mnt?unfiltered=true"}).flush(mntnerToDisplay);

        // @ts-ignore
        expect(component.objectTypeAttributes.getSingleAttributeOnName("person").value).toBe(PERSON_NAME);
        // @ts-ignore
        expect(component.objectTypeAttributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(MNTNER_NAME);
        // @ts-ignore
        expect(component.objectTypeAttributes.getSingleAttributeOnName("source").value).toEqual(SOURCE);

        // @ts-ignore
        expect(component.mntnerAttributes.getSingleAttributeOnName("mntner").value).toBe(MNTNER_NAME);
        // @ts-ignore
        expect(component.mntnerAttributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(MNTNER_NAME);
        // @ts-ignore
        expect(component.mntnerAttributes.getSingleAttributeOnName("admin-c").value).toEqual(PERSON_NAME);
        // @ts-ignore
        expect(component.mntnerAttributes.getSingleAttributeOnName("source").value).toEqual(SOURCE);

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it("should populate the ui from rest failure", () => {
        // no objects in message store
        fixture.detectChanges();

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/person/dw-ripe?unfiltered=true"}).flush({
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
                    }
                ]
            }
        }, {status: 403, statusText: "error"});

        httpMock.expectOne({method: "GET", url: "api/whois/RIPE/mntner/aardvark-mnt?unfiltered=true"}).flush(mntnerToDisplay);

        expect(component.alertService.getErrors()[0].plainText).toEqual("Unrecognized source: INVALID_SOURCE");
        expect(component.alertService.getWarnings()[0].plainText).toEqual("Not authenticated");

        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
    });

    it("should navigate to select screen", () => {
        messageStoreServiceMock.get.withArgs(PERSON_NAME).and.returnValue(personToDisplay);
        messageStoreServiceMock.get.withArgs(MNTNER_NAME).and.returnValue(mntnerToDisplay);

        fixture.detectChanges();

        component.navigateToSelect();
        expect(routerMock.navigate).toHaveBeenCalledWith(["webupdates/select"]);
    });

    it("should navigate to modify person screen", () => {
        messageStoreServiceMock.get.withArgs(PERSON_NAME).and.returnValue(personToDisplay);
        messageStoreServiceMock.get.withArgs(MNTNER_NAME).and.returnValue(mntnerToDisplay);

        fixture.detectChanges();

        component.navigateToModifyPerson();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/modify/${SOURCE}/person/${PERSON_NAME}?noRedirect`);
    });

    it("should navigate to modify mntner screen", () => {
        messageStoreServiceMock.get.withArgs(PERSON_NAME).and.returnValue(personToDisplay);
        messageStoreServiceMock.get.withArgs(MNTNER_NAME).and.returnValue(mntnerToDisplay);

        fixture.detectChanges();

        component.navigateToModifyMntner();

        expect(routerMock.navigateByUrl).toHaveBeenCalledWith(`webupdates/modify/${SOURCE}/mntner/${MNTNER_NAME}?noRedirect`);
    });

});
