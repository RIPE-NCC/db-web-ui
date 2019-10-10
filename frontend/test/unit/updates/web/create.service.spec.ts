import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Router} from "@angular/router";
import {of} from "rxjs";
import {CreateService} from "../../../../app/ng/updates/web/create.service";
import {WhoisResourcesService} from "../../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../../app/ng/shared/whois-meta.service";

describe("CreateService", () => {

    let httpMock: HttpTestingController;
    let createService: CreateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CreateService,
                WhoisResourcesService,
                WhoisMetaService,
                { provide: "WhoisResources", useValue: {wrapError: (error: string) => error, wrapSuccess: (success: string) => success}},
                { provide: Router, useValue: {navigateByUrl:() => {}, events: of()}}
            ],
        });
        httpMock = TestBed.get(HttpTestingController);
        createService = TestBed.get(CreateService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create two object in same time person-maintainer pair objects", () => {
        const source = "RIPE";
        const multipleWhoisObjects = "MNT";

        createService.createPersonMntner(source, multipleWhoisObjects)
            .subscribe((resp) => {
                expect(resp).toBe(createRoleRespons);
        });
        const req = httpMock.expectOne({method: "POST", url: "api/whois-internal/api/mntner-pair/RIPE/person"});
        expect(req.request.method).toBe("POST");
        req.flush(createRoleRespons);
    });

    it("should create two object in same time person-maintainer pair objects", () => {
        const source = "RIPE";
        const multipleWhoisObjects = "MNT";

        createService.createRoleMntner(source, multipleWhoisObjects)
            .subscribe((resp) => {
                expect(resp).toBe(createPersonRespons);
        });
        const req = httpMock.expectOne({method: "POST", url: "api/whois-internal/api/mntner-pair/RIPE/role"});
        expect(req.request.method).toBe("POST");
        req.flush(createPersonRespons);
    });
});

const createRoleRespons = {
    "objects" : {
        "object" : [ {
            "type" : "mntner",
            "link" : {
                "type" : "locator",
                "href" : "https://rest-prepdev.db.ripe.net/ripe/mntner/IVANA-MNT"
            },
            "source" : {
                "id" : "ripe"
            },
            "primary-key" : {
                "attribute" : [ {
                    "name" : "mntner",
                    "value" : "IVANA-MNT"
                } ]
            },
            "attributes" : {
                "attribute" : [ {
                    "name" : "mntner",
                    "value" : "IVANA-MNT"
                }, {
                    "name" : "admin-c",
                    "value" : "IA5444-RIPE"
                }, {
                    "name" : "upd-to",
                    "value" : "bad@ripe.net"
                }, {
                    "name" : "auth",
                    "value" : "SSO bad@ripe.net"
                }, {
                    "name" : "mnt-by",
                    "value" : "IVANA-MNT"
                }, {
                    "name" : "created",
                    "value" : "2019-09-18T09:27:11Z"
                }, {
                    "name" : "last-modified",
                    "value" : "2019-09-18T09:27:12Z"
                }, {
                    "name" : "source",
                    "value" : "RIPE"
                } ]
            }
        }, {
            "type" : "role",
            "link" : {
                "type" : "locator",
                "href" : "https://rest-prepdev.db.ripe.net/ripe/role/IA5444-RIPE"
            },
            "source" : {
                "id" : "ripe"
            },
            "primary-key" : {
                "attribute" : [ {
                    "name" : "nic-hdl",
                    "value" : "IA5444-RIPE"
                } ]
            },
            "attributes" : {
                "attribute" : [ {
                    "name" : "role",
                    "value" : "IVANA-ROLE"
                }, {
                    "name" : "address",
                    "value" : "Utrecht"
                }, {
                    "name" : "e-mail",
                    "value" : "isvonja@ripe.net"
                }, {
                    "name" : "nic-hdl",
                    "value" : "IA5444-RIPE"
                }, {
                    "name" : "mnt-by",
                    "value" : "IVANA-MNT"
                }, {
                    "name" : "created",
                    "value" : "2019-09-18T09:27:12Z"
                }, {
                    "name" : "last-modified",
                    "value" : "2019-09-18T09:27:12Z"
                }, {
                    "name" : "source",
                    "value" : "RIPE"
                } ]
            }
        } ]
    }
};
const createPersonRespons = {
    "objects" : {
        "object" : [ {
            "type" : "mntner",
            "link" : {
                "type" : "locator",
                "href" : "https://rest-prepdev.db.ripe.net/ripe/mntner/ESMA-MNT"
            },
            "source" : {
                "id" : "ripe"
            },
            "primary-key" : {
                "attribute" : [ {
                    "name" : "mntner",
                    "value" : "ESMA-MNT"
                } ]
            },
            "attributes" : {
                "attribute" : [ {
                    "name" : "mntner",
                    "value" : "ESMA-MNT"
                }, {
                    "name" : "admin-c",
                    "value" : "ES13451-RIPE"
                }, {
                    "name" : "upd-to",
                    "value" : "bad@ripe.net"
                }, {
                    "name" : "auth",
                    "value" : "SSO bad@ripe.net"
                }, {
                    "name" : "mnt-by",
                    "value" : "ESMA-MNT"
                }, {
                    "name" : "created",
                    "value" : "2019-09-18T09:30:21Z"
                }, {
                    "name" : "last-modified",
                    "value" : "2019-09-18T09:30:21Z"
                }, {
                    "name" : "source",
                    "value" : "RIPE"
                } ]
            }
        }, {
            "type" : "person",
            "link" : {
                "type" : "locator",
                "href" : "https://rest-prepdev.db.ripe.net/ripe/person/ES13451-RIPE"
            },
            "source" : {
                "id" : "ripe"
            },
            "primary-key" : {
                "attribute" : [ {
                    "name" : "nic-hdl",
                    "value" : "ES13451-RIPE"
                } ]
            },
            "attributes" : {
                "attribute" : [ {
                    "name" : "person",
                    "value" : "Esma Svonja"
                }, {
                    "name" : "address",
                    "value" : "Utrecht"
                }, {
                    "name" : "phone",
                    "value" : "+31611111111111"
                }, {
                    "name" : "nic-hdl",
                    "value" : "ES13451-RIPE"
                }, {
                    "name" : "mnt-by",
                    "value" : "ESMA-MNT"
                }, {
                    "name" : "created",
                    "value" : "2019-09-18T09:30:21Z"
                }, {
                    "name" : "last-modified",
                    "value" : "2019-09-18T09:30:21Z"
                }, {
                    "name" : "source",
                    "value" : "RIPE"
                } ]
            }
        } ]
    }
};
