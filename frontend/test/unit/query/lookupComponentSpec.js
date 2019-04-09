/*global beforeEach,describe,expect,inject,it,spyOn*/
'use strict';

describe('LookupComponent', function () {

    var $componentController;
    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_) {
        $componentController = _$componentController_;
    }));

    describe('shows an object', function () {

        it('with abuse headers and highlighted RIPE attributes', function () {
            var ctrl = $componentController('lookup', {}, {ngModel: mockResponse.singleResult.objects.object[0]});
            expect(ctrl.abuseContactFound).toEqual(false);
            expect(ctrl.header).toEqual(true);
            expect(ctrl.resourceHolderFound).toEqual(true);
        });

        it("with abuse headers but with suspected org-id", function () {
            var ctrl = $componentController("lookup", {}, {ngModel: mockAbuseCResponse.objects.object[0]});
            expect(ctrl.abuseContactFound).toEqual(true);
            expect(ctrl.header).toEqual(true);
            expect(ctrl.abuseContactSuspected).toEqual(true);
            expect(ctrl.ngModel["abuse-contact"]["org-id"] !== "").toEqual(true);
        });

        it("with abuse headers but without suspected org-id", function () {
            mockAbuseCResponse.objects.object[0]["abuse-contact"]["org-id"] = "";
            var ctrl = $componentController("lookup", {}, {ngModel: mockAbuseCResponse.objects.object[0]});
            expect(ctrl.abuseContactFound).toEqual(true);
            expect(ctrl.header).toEqual(true);
            expect(ctrl.abuseContactSuspected).toEqual(true);
            expect(ctrl.ngModel["abuse-contact"]["org-id"] !== "").toEqual(false);
        });

    });
    var mockResponse = {
        singleResult: {
            "service": {
                "name": "search"
            },
            "parameters": {
                "inverse-lookup": {},
                "type-filters": {
                    "type-filter": [{
                        "id": "INETNUM"
                    }]
                },
                "flags": {
                    "flag": [{
                        "value": "no-referenced"
                    }, {
                        "value": "no-filtering"
                    }]
                },
                "query-strings": {
                    "query-string": [{
                        "value": "193.0.0.0/26"
                    }]
                },
                "sources": {}
            },
            "objects": {
                "object": [{
                    "type": "inetnum",
                    "link": {
                        "type": "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/193.0.0.0 - 193.0.0.63"
                    },
                    "source": {
                        "id": "ripe"
                    },
                    "primary-key": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "193.0.0.0 - 193.0.0.63"
                        }]
                    },
                    "attributes": {
                        "attribute": [{
                            "name": "inetnum",
                            "value": "193.0.0.0 - 193.0.0.63",
                            "managed": true
                        }, {
                            "name": "netname",
                            "value": "NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK",
                            "managed": true
                        }, {
                            "name": "descr",
                            "value": "IPv4 address block not managed by the RIPE NCC"
                        }, {
                            "name": "remarks",
                            "value": "------------------------------------------------------"
                        }, {
                            "name": "remarks",
                            "value": ""
                        }, {
                            "name": "remarks",
                            "value": "You can find the whois server to query, or the"
                        }, {
                            "name": "remarks",
                            "value": "IANA registry to query on this web page:"
                        }, {
                            "name": "remarks",
                            "value": "http://www.iana.org/assignments/ipv4-address-space"
                        }, {
                            "name": "remarks",
                            "value": ""
                        }, {
                            "name": "remarks",
                            "value": "You can access databases of other RIR's at:"
                        }, {
                            "name": "remarks",
                            "value": ""
                        }, {
                            "name": "remarks",
                            "value": "AFRINIC (Africa)"
                        }, {
                            "name": "remarks",
                            "value": "http://www.afrinic.net/ whois.afrinic.net"
                        }, {
                            "name": "remarks",
                            "value": ""
                        }, {
                            "name": "remarks",
                            "value": "APNIC (Asia Pacific)"
                        }, {
                            "name": "remarks",
                            "value": "http://www.apnic.net/ whois.apnic.net"
                        }, {
                            "name": "remarks",
                            "value": ""
                        }, {
                            "name": "remarks",
                            "value": "ARIN (Northern America)"
                        }, {
                            "name": "remarks",
                            "value": "http://www.arin.net/ whois.arin.net"
                        }, {
                            "name": "remarks",
                            "value": ""
                        }, {
                            "name": "remarks",
                            "value": "LACNIC (Latin America and the Carribean)"
                        }, {
                            "name": "remarks",
                            "value": "http://www.lacnic.net/ whois.lacnic.net"
                        }, {
                            "name": "remarks",
                            "value": ""
                        }, {
                            "name": "remarks",
                            "value": "------------------------------------------------------"
                        }, {
                            "name": "country",
                            "value": "EU",
                            "comment": "Country is really world wide"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-IANA1-RIPE"
                            },
                            "name": "org",
                            "value": "ORG-IANA1-RIPE",
                            "referenced-type": "organisation",
                            "managed": true
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/IANA1-RIPE"
                            },
                            "name": "admin-c",
                            "value": "IANA1-RIPE",
                            "referenced-type": "role"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/IANA1-RIPE"
                            },
                            "name": "tech-c",
                            "value": "IANA1-RIPE",
                            "referenced-type": "role"
                        }, {
                            "name": "status",
                            "value": "ALLOCATED UNSPECIFIED",
                            "managed": true
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT"
                            },
                            "name": "mnt-by",
                            "value": "RIPE-NCC-HM-MNT",
                            "referenced-type": "mntner",
                            "managed": true
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT"
                            },
                            "name": "mnt-lower",
                            "value": "RIPE-NCC-HM-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "link": {
                                "type": "locator",
                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-RPSL-MNT"
                            },
                            "name": "mnt-routes",
                            "value": "RIPE-NCC-RPSL-MNT",
                            "referenced-type": "mntner"
                        }, {
                            "name": "created",
                            "value": "2016-04-25T13:00:50Z"
                        }, {
                            "name": "last-modified",
                            "value": "2016-04-25T13:00:50Z"
                        }, {
                            "name": "source",
                            "value": "RIPE",
                            "managed": true
                        }]
                    },
                    "resource-holder": {
                        "key": "ORG-IANA1-RIPE",
                        "name": "Internet Assigned Numbers Authority"
                    },
                    "managed": true
                }]
            },
            "terms-and-conditions": {
                "type": "locator",
                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
            }
        }
    };

    var mockAbuseCResponse = {
        objects: {
            object: [
                {
                    type: "inetnum",
                    link: {
                        type: "locator",
                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/24.132.74.0 - 24.132.77.255"
                    },
                    source: {
                        id: "ripe"
                    },
                    "primary-key": {
                        attribute: [
                            {
                                name: "inetnum",
                                value: "24.132.74.0 - 24.132.77.255"
                            }
                        ]
                    },
                    attributes: {
                        attribute: [
                            {
                                name: "inetnum",
                                value: "24.132.74.0 - 24.132.77.255"
                            },
                            {
                                name: "netname",
                                value: "VODA-ZIGGO"
                            },
                            {
                                name: "descr",
                                value: "CPE Customers NL"
                            },
                            {
                                name: "country",
                                value: "NL"
                            },
                            {
                                "link": {
                                    type: "locator",
                                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/LGI-RIPE"
                                },
                                name: "admin-c",
                                value: "LGI-RIPE",
                                "referenced-type": "role"
                            },
                            {
                                "link": {
                                    type: "locator",
                                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/LGI-RIPE"
                                },
                                name: "tech-c",
                                value: "LGI-RIPE",
                                "referenced-type": "role"
                            },
                            {
                                name: "status",
                                value: "ASSIGNED PA"
                            },
                            {
                                name: "remarks",
                                value: "Contact abuse@ziggo.nl concerning criminal"
                            },
                            {
                                name: "remarks",
                                value: "activities like spam, hacks, portscans"
                            },
                            {
                                name: "notify",
                                value: "***@chello.at"
                            },
                            {
                                link: {
                                    type: "locator",
                                    href: "http://rest-prepdev.db.ripe.net/ripe/mntner/ZIGGO-SERVICES-MNT"
                                },
                                name: "mnt-by",
                                value: "ZIGGO-SERVICES-MNT",
                                "referenced-type": "mntner"
                            },
                            {
                                name: "created",
                                value: "2008-12-02T10:26:51Z"
                            },
                            {
                                name: "last-modified",
                                value: "2017-12-06T14:29:33Z"
                            },
                            {
                                name: "source",
                                value: "RIPE"
                            }
                        ]
                    },
                    tags: {
                        tag: [
                            {
                                id: "RIPE-USER-RESOURCE"
                            }
                        ]
                    },
                    "resource-holder": {
                        key: "ORG-CB6-RIPE",
                        name: "Ziggo Services B.V."
                    },
                    "abuse-contact": {
                        key: "UNA7-RIPE",
                        email: "abuse@ziggo.nl",
                        suspect: true,
                        "org-id": "ORG-CB6-RIPE"
                    },
                    managed: false
                }
            ]
        },
        "terms-and-conditions": {
            type: "locator",
            href: "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    };
});

