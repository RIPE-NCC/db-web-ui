import {TestBed} from "@angular/core/testing";
import {SharedModule} from "../../../app/ng/shared/shared.module";
import {WhoisResourcesService} from "../../../app/ng/shared/whois-resources.service";
import {WhoisMetaService} from "../../../app/ng/shared/whois-meta.service";

describe("WhoisResourcesService", () => {

    let whoisResourcesService: WhoisResourcesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule],
            providers: [
                WhoisResourcesService,
                WhoisMetaService
            ],
        });
        whoisResourcesService = TestBed.get(WhoisResourcesService);
    });

    it("should wrap a success response", () => {
        const resp = {
            "link": {
                "type": "locator",
                "href": "http://rest-prepdev.db.ripe.net/ripe/route/80.99.0.0/16AS6830?dry-run=false&reason=I+don%27t+need+this+object"
            },
            "objects": {
                "object": [
                    {
                        "type": "route",
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/route/80.99.0.0/16AS6830"
                        },
                        "source": {
                            "id": "ripe"
                        },
                        "primary-key": {
                            "attribute": [
                                {
                                    "name": "route",
                                    "value": "80.99.0.0/16"
                                },
                                {
                                    "name": "origin",
                                    "value": "AS6830"
                                }
                            ]
                        },
                        "attributes": {
                            "attribute": [
                                {
                                    "name": "route",
                                    "value": "80.99.0.0/16"
                                },
                                {
                                    "name": "descr",
                                    "value": "UPC"
                                },
                                {
                                    "name": "descr",
                                    "value": "UPC Magyarorszag Kft."
                                },
                                {
                                    "link": {
                                        "type": "locator",
                                        "href": "http://rest-prepdev.db.ripe.net/ripe/aut-num/AS6830"
                                    },
                                    "name": "origin",
                                    "value": "AS6830",
                                    "referenced-type": "aut-num"
                                },
                                {
                                    "name": "notify",
                                    "value": "***@broadband.hu"
                                },
                                {
                                    "link": {
                                        "type": "locator",
                                        "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/SZABINET-MNT"
                                    },
                                    "name": "mnt-by",
                                    "value": "SZABINET-MNT",
                                    "referenced-type": "mntner"
                                },
                                {
                                    "name": "changed",
                                    "value": "***@broadband.hu 20040702"
                                },
                                {
                                    "name": "changed",
                                    "value": "***@chello.at 20100125"
                                },
                                {
                                    "name": "created",
                                    "value": "2010-01-25T10:18:10Z"
                                },
                                {
                                    "name": "last-modified",
                                    "value": "2010-01-25T10:18:10Z"
                                },
                                {
                                    "name": "source",
                                    "value": "RIPE"
                                }
                            ]
                        }
                    }
                ]
            },
            "terms-and-conditions": {
                "type": "locator",
                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
            }
        };

        whoisResourcesService.wrapSuccess(resp);
    });

    it("should detect invalid whoisressources", () => {
        expect(whoisResourcesService.wrapWhoisResources(null)).toBeUndefined();
        expect(whoisResourcesService.wrapWhoisResources("garbage")).toBeUndefined();
        expect(whoisResourcesService.wrapWhoisResources({otherField: "hi", otherRef: {number: 4}})).toBeUndefined();

        expect(whoisResourcesService.wrapWhoisResources({objects: {object: []}})).toBeDefined();
        expect(whoisResourcesService.wrapWhoisResources({
            errormessages: {
                errormessage: [{
                    severity: "Warning",
                    text: "Not authenticated"
                }]
            }
        })).toBeDefined();

    });

    it("should embed attributes within a whoisressources-request", () => {

        expect(whoisResourcesService.turnAttrsIntoWhoisObject([
            {name: "mnt-by", value: "b"},
            {name: "source"}
        ])).toEqual({
            objects: {
                object: [
                    {
                        attributes: {
                            attribute: [
                                {name: "mnt-by", value: "b"},
                                {name: "source"}]
                        }
                    }
                ]
            }
        });
    });

    it("should produce a list of filterable attributes", () => {
        let attrs = whoisResourcesService.getFilterableAttrsForObjectTypes(["role"]);
        expect(attrs).toEqual(["role", "nic-hdl", "abuse-mailbox"]);

        attrs = whoisResourcesService.getFilterableAttrsForObjectTypes(["person"]);
        expect(attrs).toEqual(["person", "nic-hdl"]);

        attrs = whoisResourcesService.getFilterableAttrsForObjectTypes(["organisation"]);
        expect(attrs).toEqual(["organisation", "org-name"]);

        attrs = whoisResourcesService.getFilterableAttrsForObjectTypes(["person", "role", "organisation"]);
        expect(attrs).toEqual(["person", "nic-hdl", "role", "abuse-mailbox", "organisation", "org-name"]);

    });

    it("should produce a list of viewable attributes", () => {
    });

    it("should embed multiple objects within a whoisressources-request", () => {

        expect(whoisResourcesService.turnAttrsIntoWhoisObjects(
            [
                [{name: "person", value: "p"}, {name: "source", value: "ripe"}],
                [{name: "mntner", value: "m"}, {name: "auth", value: "SSO a@b"}]
            ]
        )).toEqual({
            objects: {
                object: [
                    {
                        type: "person",
                        attributes: {attribute: [{name: "person", value: "p"}, {name: "source", value: "ripe"}]}
                    },
                    {
                        type: "mntner",
                        attributes: {attribute: [{name: "mntner", value: "m"}, {name: "auth", value: "SSO a@b"}]}
                    }
                ]
            }
        });
    });

    it("should peel errors out of a whoisresources error response", () => {

        const errorResponse = whoisResourcesService.wrapWhoisResources({
            errormessages: {
                objects: {
                    object: [
                        {
                            attributes: {
                                attribute: [
                                    {name: "admin-c", value: "XYZ"}
                                ]
                            }
                        }
                    ]
                },
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
                            name: "admin-c",
                            value: "XYZ"
                        },
                        text: "\"%s\" is not valid for this object type",
                        args: [{value: "XYZ"}]
                    }
                ]
            }
        });
        expect(errorResponse).toBeDefined();

        expect(errorResponse.getGlobalErrors(errorResponse)).toEqual([
            {
                severity: "Error",
                text: "Unrecognized source: %s",
                args: [{value: "INVALID_SOURCE"}],
                plainText: "Unrecognized source: INVALID_SOURCE"
            }
        ]);

        expect(errorResponse.getGlobalWarnings()).toEqual([
            {severity: "Warning", text: "Not authenticated", plainText: "Not authenticated"}
        ]);

        expect(errorResponse.readableError(errorResponse.errormessages.errormessage[0])).toEqual(
            "Unrecognized source: INVALID_SOURCE"
        );

        expect(errorResponse.readableError(errorResponse.errormessages.errormessage[1])).toEqual(
            "Not authenticated"
        );

        // has second %s withoutv second arg
        expect(errorResponse.readableError({
            severity: "Error",
            text: "Unrecognized source: %s %s",
            args: [{value: "INVALID_SOURCE"}]
        })).toEqual(
            "Unrecognized source: INVALID_SOURCE %s"
        );

        expect(errorResponse.getErrorsOnAttribute("admin-c", "XYZ")).toEqual([
            {
                severity: "Error",
                attribute: {
                    name: "admin-c",
                    value: "XYZ"
                },
                text: "\"%s\" is not valid for this object type",
                args: [{value: "XYZ"}],
                plainText: "\"XYZ\" is not valid for this object type"
            }
        ]);

        expect(errorResponse.getAttributes()).toEqual([])

        expect(errorResponse.getPrimaryKey()).toEqual(undefined);

    });

    it("should extract authentication candidates from error resp", () => {
        const errorResponse = whoisResourcesService.wrapWhoisResources({
            errormessages: {
                errormessage: [
                    {
                        severity: "Error",
                        text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                        args: [
                            {value: "inetnum"}, {value: "194.219.52.240 - 194.219.52.243"},
                            {value: "mnt-by"}, {value: "TPOLYCHNIA4-MNT"}
                        ]
                    },
                    {
                        severity: "Error",
                        text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                        args: [
                            {value: "inetnum"}, {value: "194.219.0.0 - 194.219.255.255"},
                            {value: "mnt-lower"}, {value: "FORTHNETGR-MNT"}
                        ]
                    },
                    {
                        severity: "Error",
                        text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                        args: [{value: "inetnum"}, {value: "194.219.0.0 - 194.219.255.255"},
                            {value: "mnt-by"}, {value: "RIPE-NCC-HM-MNT, AARDVARK-MNT"}
                        ]
                    },
                    {
                        severity: "Info",
                        text: "Dry-run performed, no changes to the database have been made"
                    }
                ]
            }
        });
        expect(errorResponse).toBeDefined();

        expect(errorResponse.getAuthenticationCandidatesFromError()).toEqual(
            ["TPOLYCHNIA4-MNT", "FORTHNETGR-MNT", "RIPE-NCC-HM-MNT", " AARDVARK-MNT"]
        );
    });

    it("should interact with whoisresources success-response", () => {

        const successResponse = whoisResourcesService.wrapWhoisResources({
            link: {
                type: "locator",
                href: "http://localhost.dev.ripe.net:8443/RIPE/person"
            },
            objects: {
                object: [
                    {
                        type: "person",
                        link: {
                            type: "locator",
                            href: "http://rest-dev.db.ripe.net/ripe/person/MG20276-RIPE"
                        },
                        source: {
                            id: "ripe"
                        },
                        "primary-key": {
                            attribute: [
                                {
                                    name: "nic-hdl",
                                    value: "MG20276-RIPE"
                                },
                                {
                                    name: "imaginary",
                                    value: "XYZ"
                                }
                            ]
                        },
                        attributes: {
                            attribute: [
                                {
                                    name: "as-block",
                                    value: "a"
                                },
                                {
                                    name: "mnt-by",
                                    value: "b"
                                },
                                {
                                    name: "source",
                                    value: "c"
                                }
                            ]
                        }
                    }
                ]
            },
            "terms-and-conditions": {
                type: "locator",
                href: "http://www.ripe.net/db/support/db-terms-conditions.pdf"
            }
        });

        expect(successResponse).toBeDefined();

        expect(successResponse.getGlobalErrors()).toEqual([]);

        expect(successResponse.getGlobalWarnings()).toEqual([]);

        expect(successResponse.getAttributes()).toEqual([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: "b"},
            {name: "source", value: "c"}
        ]);

        expect(successResponse.getPrimaryKey()).toEqual("MG20276-RIPEXYZ");

    });

    it("should read from attributes", () => {

        expect(whoisResourcesService.wrapAttributes(null)).toEqual([]);

        const whoisAttributes = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: null},
            {name: "mnt-by", value: "c"},
            {name: "source", value: "d"}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName("source")).toEqual(
            {name: "source", value: "d"}
        );

        expect(whoisAttributes.getSingleAttributeOnName("non-existing")).toEqual(undefined);

        expect(whoisAttributes.getAllAttributesOnName("mnt-by")).toEqual([
            {name: "mnt-by", value: null},
            {name: "mnt-by", value: "c"}
        ]);

        expect(whoisAttributes.getAllAttributesOnName("non-existing")).toEqual([]);

        expect(whoisAttributes.getAllAttributesWithValueOnName("mnt-by")).toEqual([
            {name: "mnt-by", value: "c"}
        ]);

    });

    it("should adjust attributes", () => {

        const whoisAttributes = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: null},
            {name: "mnt-by", value: "c"},
            {name: "source", value: "d"}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName("as-block").value).toEqual("a");
        expect(whoisAttributes.getSingleAttributeOnName("mnt-by").value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName("mnt-by")[1].value).toEqual("c");
        expect(whoisAttributes.getSingleAttributeOnName("source").value).toEqual("d");

        // has side effects
        expect(whoisAttributes.setSingleAttributeOnName("source", "RIPE")).toEqual([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: null},
            {name: "mnt-by", value: "c"},
            {name: "source", value: "RIPE"}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName("as-block").value).toEqual("a");
        expect(whoisAttributes.getSingleAttributeOnName("mnt-by").value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName("mnt-by")[1].value).toEqual("c");
        expect(whoisAttributes.getSingleAttributeOnName("source").value).toEqual("RIPE");

    });

    it("should adjust attributes", () => {

        const whoisAttributes = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: null},
            {name: "mnt-by", value: "c"},
            {name: "source", value: "d"}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName("as-block").value).toEqual("a");
        expect(whoisAttributes.getSingleAttributeOnName("mnt-by").value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName("mnt-by")[0].value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName("mnt-by")[1].value).toEqual("c");
        expect(whoisAttributes.getSingleAttributeOnName("source").value).toEqual("d");

        // has side effects
        expect(whoisAttributes.setSingleAttributeOnName("mnt-by", "TEST-MNT")).toEqual([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: "TEST-MNT"},
            {name: "mnt-by", value: "c"},
            {name: "source", value: "d"}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName("as-block").value).toEqual("a");
        expect(whoisAttributes.getSingleAttributeOnName("mnt-by").value).toEqual("TEST-MNT");
        expect(whoisAttributes.getAllAttributesOnName("mnt-by")[0].value).toEqual("TEST-MNT");
        expect(whoisAttributes.getAllAttributesOnName("mnt-by")[1].value).toEqual("c");
        expect(whoisAttributes.getSingleAttributeOnName("source").value).toEqual("d");

    });

    it("should merge two attribute lists", () => {

        const whoisAttributesWithMeta = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$idx: 0}},
            {name: "mnt-by", value: "b", $$meta: {$$idx: 1}},
            {name: "source", value: "d", $$meta: {$$idx: 2}}
        ]);

        // has side effectts
        expect(whoisAttributesWithMeta.addAttrsSorted("mnt-by",
            [{name: "mnt-by", value: "c"}]
        )).toEqual([
            {name: "as-block", value: "a", $$meta: {$$idx: 0}},
            {name: "mnt-by", value: "b", $$meta: {$$idx: 1}},
            {name: "mnt-by", value: "c", $$meta: {$$idx: 1}},
            {name: "source", value: "d", $$meta: {$$idx: 2}}
        ]);
    });

    it("should add an attribute after", () => {
        const whoisAttributes = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: "c"},
            {name: "source", value: "d"}
        ]);
        const after = whoisAttributes.addAttributeAfter({name: "remarks"}, whoisAttributes[0]);
        expect(after[1].name).toEqual("remarks");
    });

    it("should merge two attribute lists: no existing field", () => {

        const whoisAttributesWithMeta = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$idx: 0}},
            {name: "source", value: "d", $$meta: {$$idx: 2}},
        ]);

        // has side effectts
        expect(whoisAttributesWithMeta.addAttrsSorted("mnt-by",
            [{name: "mnt-by", value: "c"}]
        )).toEqual([
            {name: "as-block", value: "a", $$meta: {$$idx: 0}},
            {name: "source", value: "d", $$meta: {$$idx: 2}},
            {name: "mnt-by", value: "c"}
        ]);
    });

    it("should detect missing mandatory attribute", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
        ]);

        const missingMandatories = attrs.getMissingMandatoryAttributes("as-block");
        expect(missingMandatories.length).toEqual(2);
        expect(missingMandatories[0].name).toEqual("mnt-by");
        expect(missingMandatories[1].name).toEqual("source");
    });

    it("should add missing mandatory attribute", () => {
        let attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
        ]);

        _.each(attrs.getMissingMandatoryAttributes("as-block"), (item) => {
            attrs = whoisResourcesService.wrapAttributes(attrs.addMissingMandatoryAttribute("as-block", item));
        });

        expect(attrs.length).toEqual(3);
        expect(attrs[0].name).toEqual("as-block");
        expect(attrs[0].value).toEqual("a");

        expect(attrs[1].name).toEqual("mnt-by");
        expect(attrs[1].value).toEqual("");

        expect(attrs[2].name).toEqual("source");
        expect(attrs[2].value).toEqual("");
    });

    it("should accept a correct object", () => {
        let attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: "mnt-by", value: "c", $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: "mnt-by", value: "e", $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: "source", value: "d", $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validateWithoutSettingErrors()).toEqual(true);

        expect(attrs.validate()).toEqual(true);
        expect(attrs.getSingleAttributeOnName("as-block").$$error).toEqual(undefined);
        expect(attrs.getAllAttributesOnName("mnt-by")[0].$$error).toEqual(undefined);
        expect(attrs.getAllAttributesOnName("mnt-by")[1].$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName("source").$$error).toEqual(undefined);
    });

    it("should accept a correct object with second multiple null", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: "mnt-by", value: "c", $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: "mnt-by", value: null, $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: "source", value: "d", $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validateWithoutSettingErrors()).toEqual(true);

        expect(attrs.validate()).toEqual(true);
        expect(attrs.getSingleAttributeOnName("as-block").$$error).toEqual(undefined);
        expect(attrs.getAllAttributesOnName("mnt-by")[0].$$error).toEqual(undefined);
        expect(attrs.getAllAttributesOnName("mnt-by")[1].$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName("source").$$error).toEqual(undefined);
    });

    it("should detect missing single mandatory attribute", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: null, $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: "mnt-by", value: "c", $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: "mnt-by", value: null, $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: "source", value: "d", $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validateWithoutSettingErrors()).toEqual(false);

        expect(attrs.validate()).toEqual(false);
        expect(attrs.getSingleAttributeOnName("as-block").$$error).toEqual("Mandatory attribute not set");
        expect(attrs.getSingleAttributeOnName("mnt-by").$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName("source").$$error).toEqual(undefined);
    });

    it("should detect missing multiple mandatory attribute", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: "mnt-by", value: null, $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: "source", value: "d", $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validateWithoutSettingErrors()).toEqual(false);

        expect(attrs.validate()).toEqual(false);
        expect(attrs.getSingleAttributeOnName("as-block").$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName("mnt-by").$$error).toEqual("Mandatory attribute not set");
        expect(attrs.getSingleAttributeOnName("source").$$error).toEqual(undefined);
    });

    it("should detect missing multiple mandatory attribute", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$error: "my error", $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: "mnt-by", value: null, $$error: "my error", $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: "source", value: "d", $$error: "my error", $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);
        expect(attrs.getSingleAttributeOnName("mnt-by").$$error).toEqual("my error");

        attrs.clearErrors();
        expect(attrs.getSingleAttributeOnName("as-block").$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName("mnt-by").$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName("source").$$error).toEqual(undefined);
    });

    it("should detact if an attribute can be added", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "person", value: "a", $$meta: {$$mandatory: true, $$multiple: false}},
            {name: "address", value: "b", $$meta: {$$mandatory: true, $$multiple: true}},
            {name: "address", value: "c", $$meta: {$$mandatory: true, $$multiple: true}},
            {name: "phone", value: "d", $$meta: {$$mandatory: true, $$multiple: true}},
            {name: "nic-hdl", value: "e", $$meta: {$$mandatory: true, $$multiple: false}},
            {name: "source", value: "g", $$meta: {$$mandatory: true, $$multiple: false}},
        ]);

        const addableAttrs = attrs.getAddableAttributes("person", attrs);
        expect(addableAttrs[0].name).toBe("address");
        expect(addableAttrs[1].name).toBe("phone");
        expect(addableAttrs[2].name).toBe("fax-no");
        expect(addableAttrs[3].name).toBe("e-mail");
        expect(addableAttrs[4].name).toBe("org");
        expect(addableAttrs[5].name).toBe("remarks");
        expect(addableAttrs[6].name).toBe("notify");
        expect(addableAttrs[7].name).toBe("mnt-by");
        expect(addableAttrs[8].name).toBe("created");
        expect(addableAttrs.length).toBe(9);
    });

    it("should detact if an attribute can be removed", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "person", value: "a", $$meta: {$$mandatory: true, $$multiple: false}},
            {name: "address", value: "a", $$meta: {$$mandatory: true, $$multiple: true}},
            {name: "address", value: "a", $$meta: {$$mandatory: true, $$multiple: true}},
            {name: "phone", value: "a", $$meta: {$$mandatory: true, $$multiple: true}},
            {name: "nic-hdl", value: "a", $$meta: {$$mandatory: true, $$multiple: false}},
            {name: "last-modified", value: "f", $$meta: {$$mandatory: false, $$multiple: false}},
            {name: "source", value: "g", $$meta: {$$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.canAttributeBeRemoved(attrs.getSingleAttributeOnName("person"))).toBe(false);

        expect(attrs.canAttributeBeRemoved(attrs.getAllAttributesOnName("address")[0])).toBe(true);
        expect(attrs.canAttributeBeRemoved(attrs.getAllAttributesOnName("address")[1])).toBe(true);

        expect(attrs.canAttributeBeRemoved(attrs.getAllAttributesOnName("phone")[0])).toBe(false);
        expect(attrs.canAttributeBeRemoved(attrs.getSingleAttributeOnName("nic-hdl"))).toBe(false);

        expect(attrs.canAttributeBeRemoved(attrs.getSingleAttributeOnName("last-modified"))).toBe(true);

        expect(attrs.canAttributeBeRemoved(attrs.getSingleAttributeOnName("source"))).toBe(false);


    });


    it("should allow certain attrs to be empty but remove all others", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a"},
            {name: "address", value: "c"},
            {name: "address", value: null},
            {name: "remarks", value: ''},
            {name: "mnt-by", value: ''},
            {name: "source", value: "d"}
        ]);

        const result = attrs.removeNullAttributes();

        expect(result.length).toEqual(5);
        expect(result[0].value).toEqual("a");
        expect(result[1].value).toEqual("c");
        expect(result[2].value).toBeNull();
        expect(result[3].value).toEqual("");
        expect(result[4].value).toEqual("d");
    });

    it("should remove an attribute", () => {
        let attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: "b"},
            {name: "source", value: "c"},
        ]);

        attrs = attrs.removeAttribute(attrs[1]);

        expect(attrs.length).toEqual(2);
        expect(attrs[0].value).toEqual("a");
        expect(attrs[1].value).toEqual("c");
    });

    it("should remove null attributes", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a"},
            {name: "mnt-by", value: null},
            {name: "source", value: "c"},
        ]);

        const result = attrs.removeNullAttributes();

        expect(result.length).toEqual(2);
        expect(result[0].value).toEqual("a");
        expect(result[1].value).toEqual("c");
    });

    it("should remove a null valued attribute", () => {
        let attrs = whoisResourcesService.wrapAttributes([
            {name: "mnt-by", value: null},
            {name: "source", value: "c"},
        ]);

        attrs = attrs.removeAttribute(attrs[0]);

        expect(attrs.length).toEqual(1);
    });

    it("should remove an undefined valued attribute", () => {
        let attrs = whoisResourcesService.wrapAttributes([
            {name: "mnt-by"},
            {name: "source", value: "c"},
        ]);

        attrs = attrs.removeAttribute(attrs[0]);

        expect(attrs.length).toEqual(1);
    });

    it("should duplicate an attribute", () => {
        let attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$mandatory: true, $$multiple: false}},
            {name: "mnt-by", value: "b", $$meta: {$$mandatory: true, $$multiple: true}},
            {name: "source", value: "c", $$meta: {$$mandatory: true, $$multiple: false}}
        ]);

        attrs = attrs.duplicateAttribute(attrs[1]);

        expect(attrs.length).toEqual(4);
        expect(attrs[0].value).toEqual("a");
        expect(attrs[1].value).toEqual("b");
        expect(attrs[2].name).toEqual("mnt-by");
        expect(attrs[2].value).toEqual("");
        expect(attrs[3].value).toEqual("c");
    });

    it("should plaintext version of attributes", () => {
        const attrs = whoisResourcesService.wrapAttributes([
            {name: "as-block", value: "a", $$meta: {$$mandatory: true, $$multiple: false}},
            {name: "mnt-by", value: "b", $$meta: {$$mandatory: true, $$multiple: true}},
            {name: "source", value: "c", $$meta: {$$mandatory: true, $$multiple: false}}
        ]);

        expect(attrs.toPlaintext()).toEqual(
            "as-block:            a\n" +
            "mnt-by:              b\n" +
            "source:              c\n");
    });

    it("should plaintext version of object", () => {
        const resources = whoisResourcesService.wrapWhoisResources({
            objects: {
                object: [
                    {
                        type: "person",
                        link: {
                            type: "locator",
                            href: "http://rest-dev.db.ripe.net/ripe/person/MG20276-RIPE"
                        },
                        source: {
                            id: "ripe"
                        },
                        "primary-key": {
                            attribute: [
                                {
                                    name: "nic-hdl",
                                    value: "MG20276-RIPE"
                                }
                            ]
                        },
                        attributes: {
                            attribute: [
                                {
                                    name: "person",
                                    value: "Test Person"
                                },
                                {
                                    name: "nic-hdl",
                                    value: "MG20276-RIPE"
                                },
                                {
                                    name: "source",
                                    value: "RIPE"
                                }
                            ]
                        }
                    }
                ]
            }
        });

        expect(whoisResourcesService.wrapAttributes(resources.getAttributes()).toPlaintext()).toEqual(
            "person:              Test Person\n" +
            "nic-hdl:             MG20276-RIPE\n" +
            "source:              RIPE\n");
    });

    it("should extract object from a response", () => {
        const personAttrs = [
            {name: "person", value: "Test Person"},
            {name: "nic-hdl", value: "MG20276-RIPE"},
            {name: "mnt-by", value: "TEST-MNT"},
            {name: "source", value: "RIPE"}
        ];
        const mntnerAttrs = [
            {name: "mntner", value: "TEST-MNT"},
            {name: "admin-c", value: "MG20276-RIPE"},
            {name: "mnt-by", value: "TEST-MNT"},
            {name: "source", value: "RIPE"}
        ];
        const resources = whoisResourcesService.wrapWhoisResources({
            objects: {
                object: [
                    {attributes: {attribute: personAttrs}},
                    {attributes: {attribute: mntnerAttrs}}
                ]
            }
        });

        expect(whoisResourcesService.getAttributesForObjectOfType(resources, "person")).toEqual(personAttrs);
        expect(whoisResourcesService.getAttributesForObjectOfType(resources, "mntner")).toEqual(mntnerAttrs);
        expect(whoisResourcesService.getAttributesForObjectOfType(resources, "inetnum")).toEqual([]);
    });
});
