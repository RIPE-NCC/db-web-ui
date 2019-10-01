import {ComponentFixture, TestBed} from "@angular/core/testing";
import {NgSelectModule} from "@ng-select/ng-select";
import {SharedModule} from "../../../app/ng/shared/shared.module";
import {CoreModule} from "../../../app/ng/core/core.module";
import {WhoisObjectViewerComponent} from "../../../app/ng/whois-object/whois-object-viewer.component";
import {AttributeModule} from "../../../app/ng/attribute/attribute.module";
import {PropertiesService} from "../../../app/ng/properties.service";
import {RouterTestingModule} from "@angular/router/testing";
import {UserInfoService} from "../../../app/ng/userinfo/user-info.service";
import {CookieService} from "ngx-cookie-service";
import {of} from "rxjs";

describe("WhoisObjectViewerComponent", () => {

    let component: WhoisObjectViewerComponent;
    let fixture: ComponentFixture<WhoisObjectViewerComponent>;

    describe("with logged in user", () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    SharedModule,
                    CoreModule,
                    NgSelectModule,
                    AttributeModule,
                    RouterTestingModule],
                declarations: [
                    WhoisObjectViewerComponent
                ],
                providers: [
                    {provide: UserInfoService, useValue: {isLogedIn: () => true, userLoggedIn$: of()}},
                    CookieService,
                    PropertiesService,
                ]
            });

            fixture = TestBed.createComponent(WhoisObjectViewerComponent);
            component = fixture.componentInstance;
        });

        it("should create", () => {
            component.ngModel = ripeWhoisObject;
            expect(component).toBeTruthy();
        });

        it("should show button Update object for RIPE whois object", () => {
            component.ngModel = ripeWhoisObject;
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeTruthy();
        });

        it("should not show button Update object for GRS whois object", () => {
            component.ngModel = grsWhoisObject;
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeFalsy();
        });
    });

    describe("without logged in user", () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    SharedModule,
                    CoreModule,
                    NgSelectModule,
                    AttributeModule,
                    RouterTestingModule],
                declarations: [
                    WhoisObjectViewerComponent
                ],
                providers: [
                    {provide: UserInfoService, useValue: {isLogedIn: () => false, userLoggedIn$: of()}},
                    CookieService,
                    PropertiesService,
                ]
            });

            fixture = TestBed.createComponent(WhoisObjectViewerComponent);
            component = fixture.componentInstance;
            component.ngModel = ripeWhoisObject;
        });

        it("should not show button Update object for RIPE whois object", () => {
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeFalsy();
        });

        it("should not show button Update object for GRS whois object", () => {
            component.ngModel = grsWhoisObject;
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeFalsy();
        });
    });

    const ripeWhoisObject = {
        "type": "route",
        "link": {
            "type": "locator",
            "href": "http://rest-prepdev.db.ripe.net/ripe/route/185.62.164.0/24AS12041"
        },
        "source": {
            "id": "ripe"
        },
        "primary-key": {
            "attribute": [
                {
                    "name": "route",
                    "value": "185.62.164.0/24"
                },
                {
                    "name": "origin",
                    "value": "AS12041"
                }
            ]
        },
        "attributes": {
            "attribute": [
                {
                    "name": "route",
                    "value": "185.62.164.0/24"
                },
                {
                    "name": "descr",
                    "value": "l.registry.qa"
                },
                {
                    "name": "origin",
                    "value": "AS12041"
                },
                {
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/PV51549-MNT"
                    },
                    "name": "mnt-by",
                    "value": "PV51549-MNT",
                    "referenced-type": "mntner"
                },
                {
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/MAINT-AFILIAS"
                    },
                    "name": "mnt-by",
                    "value": "MAINT-AFILIAS",
                    "referenced-type": "mntner"
                },
                {
                    "name": "created",
                    "value": "2014-09-11T16:17:43Z"
                },
                {
                    "name": "last-modified",
                    "value": "2014-09-11T16:19:36Z"
                },
                {
                    "name": "source",
                    "value": "RIPE"
                }
            ]
        },
        "managed": false
    };

    const grsWhoisObject = {
            "type": "route",
            "link": {
                "type": "locator",
                "href": "http://rest-prepdev.db.ripe.net/radb-grs/route/185.62.164.0/22AS12041"
            },
            "source": {
                "id": "radb-grs"
            },
            "primary-key": {
                "attribute": [
                    {
                        "name": "route",
                        "value": "185.62.164.0/22"
                    },
                    {
                        "name": "origin",
                        "value": "AS12041"
                    }
                ]
            },
            "attributes": {
                "attribute": [
                    {
                        "name": "route",
                        "value": "185.62.164.0/22"
                    },
                    {
                        "name": "descr",
                        "value": "Servers Australia"
                    },
                    {
                        "name": "origin",
                        "value": "AS12041"
                    },
                    {
                        "name": "notify",
                        "value": "net-support@ap.equinix.com"
                    },
                    {
                        "name": "notify",
                        "value": "ap-noc@ap.equinix.com"
                    },
                    {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/radb-grs/mntner/MAINT-AS17819"
                        },
                        "name": "mnt-by",
                        "value": "MAINT-AS17819",
                        "referenced-type": "mntner"
                    },
                    {
                        "name": "source",
                        "value": "RADB-GRS"
                    },
                    {
                        "name": "remarks",
                        "value": "****************************"
                    },
                    {
                        "name": "remarks",
                        "value": "* THIS OBJECT IS MODIFIED"
                    },
                    {
                        "name": "remarks",
                        "value": "* Please note that all data that is generally regarded as personal"
                    },
                    {
                        "name": "remarks",
                        "value": "* data has been removed from this object."
                    },
                    {
                        "name": "remarks",
                        "value": "* To view the original object, please query the RADB Database at:"
                    },
                    {
                        "name": "remarks",
                        "value": "* http://www.radb.net/"
                    },
                    {
                        "name": "remarks",
                        "value": "****************************"
                    }
                ]
            },
            "managed": false
        }
    ;
});
