/*global beforeEach,describe,inject,it*/
'use strict';

describe('The QueryService', function () {

    var service;
    var $httpBackend;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (QueryService, _$httpBackend_) {
        service = QueryService;
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', /.*\.html/).respond(200);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not generate a link if there is no text', function () {
        var qp = {};
        $httpBackend.flush();
        expect(service.buildPermalink(qp)).toEqual("");
        expect(service.buildQueryStringForLink(qp)).toEqual("");
    });

    it('should generate a link for text search', function () {
        var qp = {
            types: null,
            inverse: null,
            hierarchy: "",
            reverseDomain: false,
            doNotRetrieveRelatedObjects: false,
            showFullObjectDetails: false
        };

        expect(service.buildPermalink(qp)).toEqual("");
        expect(service.buildQueryStringForLink(qp)).toEqual("");

        qp.queryText = "      ";
        expect(service.buildPermalink(qp)).toEqual("");
        expect(service.buildQueryStringForLink(qp)).toEqual("");

        qp.queryText = "   yorkshire   ";

        expect(service.buildPermalink(qp)).toEqual("searchtext=yorkshire");
        expect(service.buildQueryStringForLink(qp)).toEqual("query-string=yorkshire");

        qp.hierarchy = "Z";

        expect(service.buildPermalink(qp)).toEqual("searchtext=yorkshire");
        expect(service.buildQueryStringForLink(qp)).toEqual("query-string=yorkshire");

        qp.source = "TEST";
        expect(service.buildPermalink(qp)).toEqual("searchtext=yorkshire&source=TEST");
        expect(service.buildQueryStringForLink(qp)).toEqual("query-string=yorkshire&source=TEST");
        $httpBackend.flush();
    });

    it('should generate a link for a text search with options', function () {
        var qp = {
            queryText: "   yorkshire   ",
            types: {MNTNER: true, ORGANISATION: false, AS_SET: true},
            inverse: {MNT_REF: true, form: false, MNT_BY: true},
            hierarchy: "l",
            reverseDomain: true,
            doNotRetrieveRelatedObjects: true,
            showFullObjectDetails: true,
            source: "TEST"
        };
        expect(service.buildPermalink(qp)).toEqual("searchtext=yorkshire&inverse=mnt-ref;mnt-by&types=mntner;as-set&" +
            "hierarchyFlag=one-less&dflag=true&rflag=true&bflag=true&source=TEST");
        expect(service.buildQueryStringForLink(qp)).toEqual("query-string=yorkshire&inverse-attribute=mnt-ref&" +
            "inverse-attribute=mnt-by&type-filter=mntner&type-filter=as-set&flags=one-less&flags=reverse-domain&" +
            "flags=no-referenced&flags=no-irt&flags=no-filtering&source=TEST");
        $httpBackend.flush();
    });

    it('should handle multiple search terms', function () {
        var qp = {
            queryText: "middlestown;wakefield;yorkshire;horbury;ossett;dewsbury;netherton",
            types: {MNTNER: true, ORGANISATION: false, AS_SET: true},
            inverse: {MNT_REF: true, form: false, MNT_BY: true},
            hierarchy: "l",
            reverseDomain: true,
            doNotRetrieveRelatedObjects: true,
            showFullObjectDetails: true,
            source: "TEST"
        };
        expect(service.buildPermalink(qp)).toEqual("");
        expect(service.buildQueryStringForLink(qp)).toEqual("");
        $httpBackend.flush();
    });

    it('should be able to run queries and accumulate results', function (done) {
        $httpBackend.when("GET", "api/whois/search?abuse-contact=true&flags=rB&ignore404=true&inverse-attribute=MNT-REF,MNT-BY&managed-attributes=true&query-string=middlestown&resource-holder=true&type-filter=MNTNER,AS-SET")
            .respond(404, mockResponse.middlestown);
        $httpBackend.when("GET", "api/whois/search?abuse-contact=true&flags=rB&ignore404=true&inverse-attribute=MNT-REF,MNT-BY&managed-attributes=true&query-string=wakefield&resource-holder=true&type-filter=MNTNER,AS-SET")
            .respond(mockResponse.wakefield);
        $httpBackend.when("GET", "api/whois/search?abuse-contact=true&flags=rB&ignore404=true&inverse-attribute=MNT-REF,MNT-BY&managed-attributes=true&query-string=yorkshire&resource-holder=true&type-filter=MNTNER,AS-SET")
            .respond(mockResponse.yorkshire);
        $httpBackend.when("GET", "api/whois/search?abuse-contact=true&flags=rB&ignore404=true&inverse-attribute=MNT-REF,MNT-BY&managed-attributes=true&query-string=horbury&resource-holder=true&type-filter=MNTNER,AS-SET")
            .respond(404, mockResponse.horbury);
        $httpBackend.when("GET", "api/whois/search?abuse-contact=true&flags=rB&ignore404=true&inverse-attribute=MNT-REF,MNT-BY&managed-attributes=true&query-string=ossett&resource-holder=true&type-filter=MNTNER,AS-SET")
            .respond(404, mockResponse.ossett);
        var qp = {
            queryText: "middlestown;wakefield;yorkshire;horbury;ossett;dewsbury;netherton",
            types: {MNTNER: true, ORGANISATION: false, AS_SET: true},
            inverse: {MNT_REF: true, form: false, MNT_BY: true},
            hierarchy: "",
            reverseDomain: false,
            doNotRetrieveRelatedObjects: true,
            showFullObjectDetails: true,
            source: "TEST"
        };
        service.searchWhoisObjects(qp).then(function (resp) {
            expect(resp.data.objects.object.length).toEqual(28);
            expect(resp.data.errormessages.errormessage.length).toEqual(3);
            done();
        });
        $httpBackend.flush();
    });

});

var mockResponse = {
    middlestown: {
        "link": {
            "type": "locator",
            "href": "http://wagyu.prepdev.ripe.net:1080/search?abuse-contact=true&flags=B&ignore404=true&managed-attributes=true&query-string=middlestown&resource-holder=true"
        },
        "errormessages": {
            "errormessage": [{
                "severity": "Error",
                "text": "ERROR:101: no entries found\n\nNo entries found in source %s.\n",
                "args": [{
                    "value": "RIPE"
                }]
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    },
    wakefield: {
        "service": {
            "name": "search"
        },
        "parameters": {
            "inverse-lookup": {},
            "type-filters": {},
            "flags": {
                "flag": [{
                    "value": "no-filtering"
                }]
            },
            "query-strings": {
                "query-string": [{
                    "value": "wakefield"
                }]
            },
            "sources": {}
        },
        "objects": {
            "object": [{
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/82.109.34.192 - 82.109.34.223"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.34.192 - 82.109.34.223"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.34.192 - 82.109.34.223"
                    }, {
                        "name": "netname",
                        "value": "WAKEFIELD"
                    }, {
                        "name": "descr",
                        "value": "Wakefield Media Centre Ltd"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Wakefield"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CM2992-RIPE"
                        },
                        "name": "admin-c",
                        "value": "CM2992-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2004-11-17T12:00:56Z"
                    }, {
                        "name": "last-modified",
                        "value": "2004-11-17T12:00:56Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "role",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "role",
                        "value": "Easynet Hostmaster"
                    }, {
                        "name": "address",
                        "value": "Easynet Ltd"
                    }, {
                        "name": "address",
                        "value": "Chancellor House"
                    }, {
                        "name": "address",
                        "value": "5 Thomas More Square"
                    }, {
                        "name": "address",
                        "value": "London"
                    }, {
                        "name": "address",
                        "value": "E1W 1YW"
                    }, {
                        "name": "address",
                        "value": "England"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 20 7032 5200"
                    }, {
                        "name": "fax-no",
                        "value": "+44 20 7032 5335"
                    }, {
                        "name": "e-mail",
                        "value": "***@easynet.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "admin-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "admin-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "tech-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "tech-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }, {
                        "name": "abuse-mailbox",
                        "value": "abuse@uk.easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@ripe.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2002-01-23T23:24:19Z"
                    }, {
                        "name": "last-modified",
                        "value": "2012-11-29T15:02:34Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "person",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/person/CM2992-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "CM2992-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "person",
                        "value": "Name Removed"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 845......."
                    }, {
                        "name": "e-mail",
                        "value": "***@eleventeenth.com"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "nic-hdl",
                        "value": "CM2992-RIPE"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2004-11-17T12:00:54Z"
                    }, {
                        "name": "last-modified",
                        "value": "2004-11-17T12:00:54Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/82.109.35.128 - 82.109.35.255"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.35.128 - 82.109.35.255"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.35.128 - 82.109.35.255"
                    }, {
                        "name": "netname",
                        "value": "WAKEFIELD"
                    }, {
                        "name": "descr",
                        "value": "Wakefield Ltd"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Wakefield"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/IV401-RIPE"
                        },
                        "name": "admin-c",
                        "value": "IV401-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2005-07-06T15:12:58Z"
                    }, {
                        "name": "last-modified",
                        "value": "2005-07-06T15:12:58Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "role",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "role",
                        "value": "Easynet Hostmaster"
                    }, {
                        "name": "address",
                        "value": "Easynet Ltd"
                    }, {
                        "name": "address",
                        "value": "Chancellor House"
                    }, {
                        "name": "address",
                        "value": "5 Thomas More Square"
                    }, {
                        "name": "address",
                        "value": "London"
                    }, {
                        "name": "address",
                        "value": "E1W 1YW"
                    }, {
                        "name": "address",
                        "value": "England"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 20 7032 5200"
                    }, {
                        "name": "fax-no",
                        "value": "+44 20 7032 5335"
                    }, {
                        "name": "e-mail",
                        "value": "***@easynet.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "admin-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "admin-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "tech-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "tech-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }, {
                        "name": "abuse-mailbox",
                        "value": "abuse@uk.easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@ripe.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2002-01-23T23:24:19Z"
                    }, {
                        "name": "last-modified",
                        "value": "2012-11-29T15:02:34Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "person",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/person/IV401-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "IV401-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "person",
                        "value": "Name Removed"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 797......."
                    }, {
                        "name": "e-mail",
                        "value": "***@harratts.co.uk"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "nic-hdl",
                        "value": "IV401-RIPE"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2005-07-06T15:12:58Z"
                    }, {
                        "name": "last-modified",
                        "value": "2005-07-06T15:12:58Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/87.85.219.104 - 87.85.219.111"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "87.85.219.104 - 87.85.219.111"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "87.85.219.104 - 87.85.219.111"
                    }, {
                        "name": "netname",
                        "value": "WAKEFIELD"
                    }, {
                        "name": "descr",
                        "value": "Wakefield Shirt Group"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Wakefield"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/SM1273-RIPE"
                        },
                        "name": "admin-c",
                        "value": "SM1273-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.com"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2013-03-06T09:31:21Z"
                    }, {
                        "name": "last-modified",
                        "value": "2013-03-06T09:31:21Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "role",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "role",
                        "value": "Easynet Hostmaster"
                    }, {
                        "name": "address",
                        "value": "Easynet Ltd"
                    }, {
                        "name": "address",
                        "value": "Chancellor House"
                    }, {
                        "name": "address",
                        "value": "5 Thomas More Square"
                    }, {
                        "name": "address",
                        "value": "London"
                    }, {
                        "name": "address",
                        "value": "E1W 1YW"
                    }, {
                        "name": "address",
                        "value": "England"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 20 7032 5200"
                    }, {
                        "name": "fax-no",
                        "value": "+44 20 7032 5335"
                    }, {
                        "name": "e-mail",
                        "value": "***@easynet.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "admin-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "admin-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "tech-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "tech-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }, {
                        "name": "abuse-mailbox",
                        "value": "abuse@uk.easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@ripe.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2002-01-23T23:24:19Z"
                    }, {
                        "name": "last-modified",
                        "value": "2012-11-29T15:02:34Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "person",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/person/SM1273-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "SM1273-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "person",
                        "value": "Name Removed"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 192. ......"
                    }, {
                        "name": "fax-no",
                        "value": "+44 192. ......"
                    }, {
                        "name": "e-mail",
                        "value": "***@wsg.co.uk"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "nic-hdl",
                        "value": "SM1273-RIPE"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2003-06-30T11:47:07Z"
                    }, {
                        "name": "last-modified",
                        "value": "2003-06-30T11:47:07Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/194.217.44.64 - 194.217.44.65"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "194.217.44.64 - 194.217.44.65"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "194.217.44.64 - 194.217.44.65"
                    }, {
                        "name": "netname",
                        "value": "WAKEFIELD"
                    }, {
                        "name": "descr",
                        "value": "Wakefield Media & Creativity Centre"
                    }, {
                        "name": "descr",
                        "value": "West Yorkshire WF1"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/GD477-RIPE"
                        },
                        "name": "admin-c",
                        "value": "GD477-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/GD477-RIPE"
                        },
                        "name": "tech-c",
                        "value": "GD477-RIPE",
                        "referenced-type": "person"
                    }, {
                        "name": "status",
                        "value": "assigned PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/AS2529-MNT"
                        },
                        "name": "mnt-by",
                        "value": "AS2529-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/AS2529-MNT"
                        },
                        "name": "mnt-lower",
                        "value": "AS2529-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "notify",
                        "value": "***@demon.net"
                    }, {
                        "name": "created",
                        "value": "2002-08-07T14:58:36Z"
                    }, {
                        "name": "last-modified",
                        "value": "2002-08-07T14:58:36Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-TPtD1-RIPE",
                    "name": "Thus PLC t/a Demon Internet"
                },
                "abuse-contact": {
                    "key": "AR17596-RIPE",
                    "email": "abuse@demon.net"
                },
                "comaintained": false
            }, {
                "type": "person",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/person/GD477-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "GD477-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "person",
                        "value": "Name Removed"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "West Yorkshire WF1"
                    }, {
                        "name": "phone",
                        "value": "+44-1924 ... ..."
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/AS2529-MNT"
                        },
                        "name": "mnt-by",
                        "value": "AS2529-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "notify",
                        "value": "***@demon.net"
                    }, {
                        "name": "nic-hdl",
                        "value": "GD477-RIPE"
                    }, {
                        "name": "created",
                        "value": "2002-08-07T14:58:35Z"
                    }, {
                        "name": "last-modified",
                        "value": "2002-08-07T14:58:35Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/212.134.76.216 - 212.134.76.223"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "212.134.76.216 - 212.134.76.223"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "212.134.76.216 - 212.134.76.223"
                    }, {
                        "name": "netname",
                        "value": "WAKEFIELD"
                    }, {
                        "name": "descr",
                        "value": "Wakefield Shirt Group"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Wakefield, Thornes Wharf Lane"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/SM8402-RIPE"
                        },
                        "name": "admin-c",
                        "value": "SM8402-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "remarks",
                        "value": "rev-srv: ns0.easynet.co.uk"
                    }, {
                        "name": "remarks",
                        "value": "rev-srv: ns1.easynet.co.uk"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "1970-01-01T00:00:00Z"
                    }, {
                        "name": "last-modified",
                        "value": "2009-09-02T14:25:27Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }, {
                        "name": "remarks",
                        "value": "rev-srv attribute deprecated by RIPE NCC on 02/09/2009"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "role",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "role",
                        "value": "Easynet Hostmaster"
                    }, {
                        "name": "address",
                        "value": "Easynet Ltd"
                    }, {
                        "name": "address",
                        "value": "Chancellor House"
                    }, {
                        "name": "address",
                        "value": "5 Thomas More Square"
                    }, {
                        "name": "address",
                        "value": "London"
                    }, {
                        "name": "address",
                        "value": "E1W 1YW"
                    }, {
                        "name": "address",
                        "value": "England"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 20 7032 5200"
                    }, {
                        "name": "fax-no",
                        "value": "+44 20 7032 5335"
                    }, {
                        "name": "e-mail",
                        "value": "***@easynet.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "admin-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "admin-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "tech-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "tech-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }, {
                        "name": "abuse-mailbox",
                        "value": "abuse@uk.easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@ripe.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2002-01-23T23:24:19Z"
                    }, {
                        "name": "last-modified",
                        "value": "2012-11-29T15:02:34Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "person",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/person/SM8402-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "SM8402-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "person",
                        "value": "Name Removed"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "UK"
                    }, {
                        "name": "phone",
                        "value": "+44 192. ......"
                    }, {
                        "name": "fax-no",
                        "value": "+44 192. ......"
                    }, {
                        "name": "e-mail",
                        "value": "***@easynet.net"
                    }, {
                        "name": "nic-hdl",
                        "value": "SM8402-RIPE"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "1970-01-01T00:00:00Z"
                    }, {
                        "name": "last-modified",
                        "value": "2001-09-22T02:59:54Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/217.206.125.180 - 217.206.125.183"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.206.125.180 - 217.206.125.183"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.206.125.180 - 217.206.125.183"
                    }, {
                        "name": "netname",
                        "value": "WAKEFIELD"
                    }, {
                        "name": "descr",
                        "value": "Wake field Diocesan Board of Finance"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Wakefield, West Yorkshire"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/SB476-RIPE"
                        },
                        "name": "admin-c",
                        "value": "SB476-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2001-11-23T17:12:10Z"
                    }, {
                        "name": "last-modified",
                        "value": "2001-11-23T17:12:10Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "role",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "role",
                        "value": "Easynet Hostmaster"
                    }, {
                        "name": "address",
                        "value": "Easynet Ltd"
                    }, {
                        "name": "address",
                        "value": "Chancellor House"
                    }, {
                        "name": "address",
                        "value": "5 Thomas More Square"
                    }, {
                        "name": "address",
                        "value": "London"
                    }, {
                        "name": "address",
                        "value": "E1W 1YW"
                    }, {
                        "name": "address",
                        "value": "England"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 20 7032 5200"
                    }, {
                        "name": "fax-no",
                        "value": "+44 20 7032 5335"
                    }, {
                        "name": "e-mail",
                        "value": "***@easynet.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "admin-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "admin-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "tech-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "tech-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }, {
                        "name": "abuse-mailbox",
                        "value": "abuse@uk.easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@ripe.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2002-01-23T23:24:19Z"
                    }, {
                        "name": "last-modified",
                        "value": "2012-11-29T15:02:34Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "person",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/person/SB476-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "SB476-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "person",
                        "value": "Name Removed"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 1924 ... ..."
                    }, {
                        "name": "fax-no",
                        "value": "+44 1924 ... ..."
                    }, {
                        "name": "e-mail",
                        "value": "***@wakefield.anglican.org"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "nic-hdl",
                        "value": "SB476-RIPE"
                    }, {
                        "name": "created",
                        "value": "2001-11-23T17:11:53Z"
                    }, {
                        "name": "last-modified",
                        "value": "2001-11-23T17:11:53Z"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-LOCKED-MNT"
                        },
                        "name": "mnt-by",
                        "value": "RIPE-NCC-LOCKED-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/217.206.172.96 - 217.206.172.103"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.206.172.96 - 217.206.172.103"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.206.172.96 - 217.206.172.103"
                    }, {
                        "name": "netname",
                        "value": "WAKEFIELD"
                    }, {
                        "name": "descr",
                        "value": "Wakefield Shirt Group"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Wakefield"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/SM1273-RIPE"
                        },
                        "name": "admin-c",
                        "value": "SM1273-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2003-06-30T11:47:10Z"
                    }, {
                        "name": "last-modified",
                        "value": "2003-06-30T11:47:10Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "role",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "role",
                        "value": "Easynet Hostmaster"
                    }, {
                        "name": "address",
                        "value": "Easynet Ltd"
                    }, {
                        "name": "address",
                        "value": "Chancellor House"
                    }, {
                        "name": "address",
                        "value": "5 Thomas More Square"
                    }, {
                        "name": "address",
                        "value": "London"
                    }, {
                        "name": "address",
                        "value": "E1W 1YW"
                    }, {
                        "name": "address",
                        "value": "England"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 20 7032 5200"
                    }, {
                        "name": "fax-no",
                        "value": "+44 20 7032 5335"
                    }, {
                        "name": "e-mail",
                        "value": "***@easynet.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "admin-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "admin-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PPD-RIPE"
                        },
                        "name": "tech-c",
                        "value": "PPD-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/CVK6-RIPE"
                        },
                        "name": "tech-c",
                        "value": "CVK6-RIPE",
                        "referenced-type": "person"
                    }, {
                        "name": "nic-hdl",
                        "value": "EH92-RIPE"
                    }, {
                        "name": "abuse-mailbox",
                        "value": "abuse@uk.easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "notify",
                        "value": "***@ripe.net"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2002-01-23T23:24:19Z"
                    }, {
                        "name": "last-modified",
                        "value": "2012-11-29T15:02:34Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "person",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/person/SM1273-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "SM1273-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "person",
                        "value": "Name Removed"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "GB"
                    }, {
                        "name": "phone",
                        "value": "+44 192. ......"
                    }, {
                        "name": "fax-no",
                        "value": "+44 192. ......"
                    }, {
                        "name": "e-mail",
                        "value": "***@wsg.co.uk"
                    }, {
                        "name": "notify",
                        "value": "***@easynet.net"
                    }, {
                        "name": "nic-hdl",
                        "value": "SM1273-RIPE"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2003-06-30T11:47:07Z"
                    }, {
                        "name": "last-modified",
                        "value": "2003-06-30T11:47:07Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }, {
                "type": "organisation",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-CWSR1-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "organisation",
                        "value": "ORG-CWSR1-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "organisation",
                        "value": "ORG-CWSR1-RIPE"
                    }, {
                        "name": "org-name",
                        "value": "Cushman & Wakefield Stiles & Riabokobylko LLC"
                    }, {
                        "name": "org-type",
                        "value": "OTHER"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "Russia"
                    }, {
                        "name": "phone",
                        "value": "+7 (495) ......."
                    }, {
                        "name": "fax-no",
                        "value": "+7 (495) ......."
                    }, {
                        "name": "e-mail",
                        "value": "***@eur.cushwake.com"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/SOVINTEL-MNT"
                        },
                        "name": "mnt-ref",
                        "value": "SOVINTEL-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/SOVINTEL-MNT"
                        },
                        "name": "mnt-by",
                        "value": "SOVINTEL-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2006-12-07T09:08:48Z"
                    }, {
                        "name": "last-modified",
                        "value": "2010-07-23T11:49:56Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    },
    yorkshire: {
        "service": {
            "name": "search"
        },
        "parameters": {
            "inverse-lookup": {},
            "type-filters": {},
            "flags": {
                "flag": [{
                    "value": "no-referenced"
                }, {
                    "value": "no-filtering"
                }]
            },
            "query-strings": {
                "query-string": [{
                    "value": "yorkshire"
                }]
            },
            "sources": {}
        },
        "objects": {
            "object": [{
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/82.109.32.80 - 82.109.32.87"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.32.80 - 82.109.32.87"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.32.80 - 82.109.32.87"
                    }, {
                        "name": "netname",
                        "value": "YORKSHIRE"
                    }, {
                        "name": "descr",
                        "value": "Yorkshire Post Newspapers"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Leeds"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/IT417-RIPE"
                        },
                        "name": "admin-c",
                        "value": "IT417-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2004-05-26T15:24:07Z"
                    }, {
                        "name": "last-modified",
                        "value": "2004-05-26T15:24:07Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/82.109.38.224 - 82.109.38.239"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.38.224 - 82.109.38.239"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.38.224 - 82.109.38.239"
                    }, {
                        "name": "netname",
                        "value": "YORKSHIRE"
                    }, {
                        "name": "descr",
                        "value": "Yorkshire Cottage Bakeries"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Bradford"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/SB4917-RIPE"
                        },
                        "name": "admin-c",
                        "value": "SB4917-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2005-04-05T14:05:08Z"
                    }, {
                        "name": "last-modified",
                        "value": "2005-04-05T14:05:08Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/82.109.38.240 - 82.109.38.255"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.38.240 - 82.109.38.255"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "82.109.38.240 - 82.109.38.255"
                    }, {
                        "name": "netname",
                        "value": "YORKSHIRE"
                    }, {
                        "name": "descr",
                        "value": "Yorkshire Cottage Bakeries"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Bradford"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/SB4918-RIPE"
                        },
                        "name": "admin-c",
                        "value": "SB4918-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2005-04-05T17:25:14Z"
                    }, {
                        "name": "last-modified",
                        "value": "2005-04-05T17:25:14Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/217.204.53.32 - 217.204.53.47"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.204.53.32 - 217.204.53.47"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.204.53.32 - 217.204.53.47"
                    }, {
                        "name": "netname",
                        "value": "YORKSHIRE"
                    }, {
                        "name": "descr",
                        "value": "Yorkshire and Humberland Regional Forum"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Leeds"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PN643-RIPE"
                        },
                        "name": "admin-c",
                        "value": "PN643-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2002-12-12T10:45:01Z"
                    }, {
                        "name": "last-modified",
                        "value": "2002-12-12T10:45:01Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/217.204.53.224 - 217.204.53.231"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.204.53.224 - 217.204.53.231"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.204.53.224 - 217.204.53.231"
                    }, {
                        "name": "netname",
                        "value": "YORKSHIRE"
                    }, {
                        "name": "descr",
                        "value": "Yorkshire Post Newspapers Ltd"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Leeds"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/DM1766-RIPE"
                        },
                        "name": "admin-c",
                        "value": "DM1766-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2003-03-07T13:33:14Z"
                    }, {
                        "name": "last-modified",
                        "value": "2003-03-07T13:33:14Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "inetnum",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/217.204.53.232 - 217.204.53.239"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.204.53.232 - 217.204.53.239"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "inetnum",
                        "value": "217.204.53.232 - 217.204.53.239"
                    }, {
                        "name": "netname",
                        "value": "YORKSHIRE"
                    }, {
                        "name": "descr",
                        "value": "Yorkshire Post Newspapers"
                    }, {
                        "name": "descr",
                        "value": "Office"
                    }, {
                        "name": "descr",
                        "value": "Leeds"
                    }, {
                        "name": "country",
                        "value": "GB"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/DM1767-RIPE"
                        },
                        "name": "admin-c",
                        "value": "DM1767-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/EH92-RIPE"
                        },
                        "name": "tech-c",
                        "value": "EH92-RIPE",
                        "referenced-type": "role"
                    }, {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EASYNET-UK-MNT"
                        },
                        "name": "mnt-by",
                        "value": "EASYNET-UK-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2003-03-07T13:49:40Z"
                    }, {
                        "name": "last-modified",
                        "value": "2003-03-07T13:49:40Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "tags": {
                    "tag": [{
                        "id": "RIPE-USER-RESOURCE"
                    }]
                },
                "resource-holder": {
                    "key": "ORG-EA49-RIPE",
                    "name": "Easynet Global Services Limited"
                },
                "abuse-contact": {
                    "key": "AR17615-RIPE",
                    "email": "abuse@easynet.com"
                },
                "comaintained": false
            }, {
                "type": "role",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/role/SYDC-RIPE"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "nic-hdl",
                        "value": "SYDC-RIPE"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "role",
                        "value": "South Yorkshire Datacentre Operators"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "***"
                    }, {
                        "name": "address",
                        "value": "S63 7JZ"
                    }, {
                        "name": "phone",
                        "value": "+44114......."
                    }, {
                        "name": "fax-no",
                        "value": "+44870......."
                    }, {
                        "name": "e-mail",
                        "value": "***@yorkshiredatacentres.co.uk"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-WDCL1-RIPE"
                        },
                        "name": "org",
                        "value": "ORG-WDCL1-RIPE",
                        "referenced-type": "organisation"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/JE281-RIPE"
                        },
                        "name": "admin-c",
                        "value": "JE281-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/SUMO"
                        },
                        "name": "admin-c",
                        "value": "SUMO",
                        "referenced-type": "role"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/JE281-RIPE"
                        },
                        "name": "tech-c",
                        "value": "JE281-RIPE",
                        "referenced-type": "person"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/role/SUMO"
                        },
                        "name": "tech-c",
                        "value": "SUMO",
                        "referenced-type": "role"
                    }, {
                        "name": "nic-hdl",
                        "value": "SYDC-RIPE"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/W2DATACENTRES-MNT"
                        },
                        "name": "mnt-by",
                        "value": "W2DATACENTRES-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/NETSUMO-MNT"
                        },
                        "name": "mnt-by",
                        "value": "NETSUMO-MNT",
                        "referenced-type": "mntner"
                    }, {
                        "name": "notify",
                        "value": "***@netsumo.com"
                    }, {
                        "name": "created",
                        "value": "2010-04-28T14:18:04Z"
                    }, {
                        "name": "last-modified",
                        "value": "2010-04-28T14:49:34Z"
                    }, {
                        "name": "source",
                        "value": "RIPE"
                    }]
                },
                "comaintained": false
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    },
    horbury: {
        "link": {
            "type": "locator",
            "href": "http://wagyu.prepdev.ripe.net:1080/search?abuse-contact=true&flags=B&ignore404=true&managed-attributes=true&query-string=horbury&resource-holder=true"
        },
        "errormessages": {
            "errormessage": [{
                "severity": "Error",
                "text": "ERROR:101: no entries found\n\nNo entries found in source %s.\n",
                "args": [{
                    "value": "RIPE"
                }]
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    },
    ossett: {
        "link": {
            "type": "locator",
            "href": "http://wagyu.prepdev.ripe.net:1080/search?abuse-contact=true&flags=B&ignore404=true&managed-attributes=true&query-string=ossett&resource-holder=true"
        },
        "errormessages": {
            "errormessage": [{
                "severity": "Error",
                "text": "ERROR:101: no entries found\n\nNo entries found in source %s.\n",
                "args": [{
                    "value": "RIPE"
                }]
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    }
};
