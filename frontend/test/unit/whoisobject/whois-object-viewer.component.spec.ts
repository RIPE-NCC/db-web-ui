import {ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {NgSelectModule} from "@ng-select/ng-select";
import {NgOptionHighlightModule} from "@ng-select/ng-option-highlight";
import {CookieService} from "ngx-cookie-service";
import {of} from "rxjs";
import {SharedModule} from "../../../src/app/shared/shared.module";
import {CoreModule} from "../../../src/app/core/core.module";
import {WhoisObjectViewerComponent} from "../../../src/app/whois-object/whois-object-viewer.component";
import {AttributeModule} from "../../../src/app/attribute/attribute.module";
import {PropertiesService} from "../../../src/app/properties.service";
import {UserInfoService} from "../../../src/app/userinfo/user-info.service";

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
                    NgOptionHighlightModule,
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
                    NgOptionHighlightModule,
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

        it("should not show button Update object for RIPE placeholder objects whois object", () => {
            // Placeholder objects => netname = "NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK"
            component.ngModel = placeholderWhoisObject;
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
        };

    const placeholderWhoisObject = {
                "type" : "inetnum",
                "link" : {
                    "type" : "locator",
                    "href" : "https://rest-prepdev.db.ripe.net/ripe/inetnum/192.92.157.0 - 192.92.215.255"
                },
                "source" : {
                    "id" : "ripe"
                },
                "primary-key" : {
                    "attribute" : [ {
                        "name" : "inetnum",
                        "value" : "192.92.157.0 - 192.92.215.255"
                    } ]
                },
                "attributes" : {
                    "attribute" : [ {
                        "name" : "inetnum",
                        "value" : "192.92.157.0 - 192.92.215.255"
                    }, {
                        "name" : "netname",
                        "value" : "NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK"
                    }, {
                        "name" : "country",
                        "value" : "EU",
                        "comment" : "Country is really world wide"
                    }, {
                        "link" : {
                            "type" : "locator",
                            "href" : "https://rest-prepdev.db.ripe.net/ripe/role/IANA1-RIPE"
                        },
                        "name" : "admin-c",
                        "value" : "IANA1-RIPE",
                        "referenced-type" : "role"
                    }, {
                        "link" : {
                            "type" : "locator",
                            "href" : "https://rest-prepdev.db.ripe.net/ripe/role/IANA1-RIPE"
                        },
                        "name" : "tech-c",
                        "value" : "IANA1-RIPE",
                        "referenced-type" : "role"
                    }, {
                        "name" : "status",
                        "value" : "ALLOCATED UNSPECIFIED"
                    }, {
                        "link" : {
                            "type" : "locator",
                            "href" : "https://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT"
                        },
                        "name" : "mnt-by",
                        "value" : "RIPE-NCC-HM-MNT",
                        "referenced-type" : "mntner"
                    }, {
                        "name" : "created",
                        "value" : "2019-01-07T10:49:13Z"
                    }, {
                        "name" : "last-modified",
                        "value" : "2019-01-07T10:49:13Z"
                    }, {
                        "name" : "source",
                        "value" : "RIPE"
                    } ]
                }
            };
});
