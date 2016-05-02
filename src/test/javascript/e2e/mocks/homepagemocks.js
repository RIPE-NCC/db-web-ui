exports.module = function (data) {
    angular.module('dbWebAppE2E', ['dbWebApp', 'ngMockE2E'])
        .run(function($httpBackend) {
            var mimeJson = {'Content-type': 'application/json'};

            var mockGet = {
                info: {
                    req: 'api/user/info',
                    resp: {
                        status: 200,
                        data: {
                            username: 'petchells@ripe.net',
                            displayName: 'Paul Etchells',
                            expiryDate: [2020, 4, 7, 14, 36, 10, 989],
                            uuid: 'b7a7fc22-4c22-4059-b5b4-3b84b2748141',
                            active: true
                        }
                    }
                },
                mntners: {
                    req: 'api/user/mntners',
                    resp: {
                        status: 200,
                        data: [{
                            "mine": true,
                            "auth": ["SSO"],
                            "type": "mntner",
                            "key": "etchells-mnt"
                        }, {
                            "mine": true,
                            "auth": ["MD5-PW", "SSO"],
                            "type": "mntner", "key": "AS5486-MNT"
                        }, {
                            "mine": true,
                            "auth": ["MD5-PW", "SSO", "SSO", "SSO", "SSO"],
                            "type": "mntner",
                            "key": "AARDALSNETT-MNT"
                        }, {
                            "mine": true,
                            "auth": ["MD5-PW", "SSO", "PGPKEY-8736F482", "SSO"],
                            "type": "mntner",
                            "key": "APPELBAUM-MNT"
                        }, {
                            "mine": true,
                            "auth": ["MD5-PW", "SSO"],
                            "type": "mntner",
                            "key": "EU-IBM-NIC-MNT"
                        }]
                    }
                },
                AS12467: {
                    req: 'api/whois/RIPE/aut-num/AS12467?unfiltered=true',
                    resp: {
                        status: 200,
                        data: {
                            objects: {
                                object: [{
                                    type: "aut-num",
                                    link: {
                                        type: "locator",
                                        href: "http://rest-prepdev.db.ripe.net/ripe/aut-num/AS12467"
                                    },
                                    "source": {
                                        "id": "ripe"
                                    },
                                    "primary-key": {
                                        "attribute": [{
                                            "name": "aut-num",
                                            "value": "AS12467"
                                        }]
                                    },
                                    "attributes": {
                                        "attribute": [{
                                            "name": "aut-num",
                                            "value": "AS12467"
                                        }, {
                                            "name": "as-name",
                                            "value": "UNSPECIFIED"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-SI89-RIPE"
                                            },
                                            "name": "org",
                                            "value": "ORG-SI89-RIPE",
                                            "referenced-type": "organisation"
                                        }, {
                                            "name": "import",
                                            "value": "from AS5400 accept ANY"
                                        }, {
                                            "name": "import",
                                            "value": "from AS702 accept ANY"
                                        }, {
                                            "name": "export",
                                            "value": "to AS5400 announce AS12467"
                                        }, {
                                            "name": "export",
                                            "value": "to AS702 announce AS12467"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/SIG20-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "SIG20-RIPE",
                                            "referenced-type": "role"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/MF7462-RIPE"
                                            },
                                            "name": "tech-c",
                                            "value": "MF7462-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "name": "remarks",
                                            "value": "For information on \"status:\" attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources"
                                        }, {
                                            "name": "status",
                                            "value": "ASSIGNED"
                                        }, {
                                            "name": "notify",
                                            "value": "***@aladdin.com"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-END-MNT"
                                            },
                                            "name": "mnt-by",
                                            "value": "RIPE-NCC-END-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/AS5486-MNT"
                                            },
                                            "name": "mnt-by",
                                            "value": "AS5486-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/MNT-ALADDIN"
                                            },
                                            "name": "mnt-routes",
                                            "value": "MNT-ALADDIN",
                                            "referenced-type": "mntner"
                                        }, {
                                            "name": "created",
                                            "value": "1970-01-01T00:00:00Z"
                                        }, {
                                            "name": "last-modified",
                                            "value": "2015-05-05T04:31:55Z"
                                        }, {
                                            "name": "source",
                                            "value": "RIPE"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-AGNS1-RIPE"
                                            },
                                            "name": "sponsoring-org",
                                            "value": "ORG-AGNS1-RIPE",
                                            "referenced-type": "organisation"
                                        }]
                                    },
                                    "tags": {
                                        "tag": [{
                                            "id": "RIPE-REGISTRY-RESOURCE",
                                            "data": null
                                        }]
                                    }
                                }]
                            },
                            "terms-and-conditions": {
                                "type": "locator",
                                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
                            }
                        }
                    }
                },
                inetnumAutoComplete: {
                    req: 'api/whois/autocomplete?extended=true&field=inetnum&query=193.0.4.0+-+193.0.4.255',
                    resp: {
                        data: [{
                            "key": "193.0.4.0 - 193.0.4.255",
                            "type": "inetnum"
                        }]
                    }
                },
                inetnumParentQuery: {
                    req: 'api/whois/search?flags=lr&query-string=193.0.4.0+-+193.0.4.255&type-filter=inetnum',
                    resp: {
                        data: {
                            "service": {
                                "name": "search"
                            },
                            "parameters": {
                                "inverse-lookup": {},
                                "type-filters": {
                                    "type-filter": [{
                                        "id": "inetnum"
                                    }]
                                },
                                "flags": {
                                    "flag": [{
                                        "value": "one-less"
                                    }, {
                                        "value": "no-referenced"
                                    }]
                                },
                                "query-strings": {
                                    "query-string": [{
                                        "value": "193.0.4.0 - 193.0.4.255"
                                    }]
                                },
                                "sources": {}
                            },
                            "objects": {
                                "object": [{
                                    "type": "inetnum",
                                    "link": {
                                        "type": "locator",
                                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/193.0.0.0 - 193.0.7.255"
                                    },
                                    "source": {
                                        "id": "ripe"
                                    },
                                    "primary-key": {
                                        "attribute": [{
                                            "name": "inetnum",
                                            "value": "193.0.0.0 - 193.0.7.255"
                                        }]
                                    },
                                    "attributes": {
                                        "attribute": [{
                                            "name": "inetnum",
                                            "value": "193.0.0.0 - 193.0.7.255"
                                        }, {
                                            "name": "netname",
                                            "value": "RIPE-NCC"
                                        }, {
                                            "name": "descr",
                                            "value": "RIPE Network Coordination Centre"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-RIEN1-RIPE"
                                            },
                                            "name": "org",
                                            "value": "ORG-RIEN1-RIPE",
                                            "referenced-type": "organisation"
                                        }, {
                                            "name": "descr",
                                            "value": "Amsterdam, Netherlands"
                                        }, {
                                            "name": "remarks",
                                            "value": "Used for RIPE NCC infrastructure."
                                        }, {
                                            "name": "country",
                                            "value": "NL"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/JDR-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "JDR-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/BRD-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "BRD-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/OPS4-RIPE"
                                            },
                                            "name": "tech-c",
                                            "value": "OPS4-RIPE",
                                            "referenced-type": "role"
                                        }, {
                                            "name": "status",
                                            "value": "ASSIGNED PI"
                                        }, {
                                            "name": "created",
                                            "value": "2003-03-17T12:15:57Z"
                                        }, {
                                            "name": "last-modified",
                                            "value": "2015-03-04T16:35:39Z"
                                        }, {
                                            "name": "source",
                                            "value": "RIPE",
                                            "comment": "Filtered"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-MNT"
                                            },
                                            "name": "mnt-by",
                                            "value": "RIPE-NCC-MNT",
                                            "referenced-type": "mntner"
                                        }]
                                    },
                                    "tags": {
                                        "tag": [{
                                            "id": "RIPE-USER-RESOURCE",
                                            "data": null
                                        }]
                                    }
                                }]
                            },
                            "terms-and-conditions": {
                                "type": "locator",
                                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
                            }
                        }
                    }
                },
                inetnumWithParent1: {
                    req: 'api/whois/ripe/inetnum/91.208.34.0%20-%2091.208.34.255?unfiltered=true',
                    resp: {
                        data: {
                            "objects": {
                                "object": [{
                                    "type": "inetnum",
                                    "link": {
                                        "type": "locator",
                                        "href": "http://rest-prepdev.db.ripe.net/ripe/inetnum/91.208.34.0 - 91.208.34.255"
                                    },
                                    "source": {
                                        "id": "ripe"
                                    },
                                    "primary-key": {
                                        "attribute": [{
                                            "name": "inetnum",
                                            "value": "91.208.34.0 - 91.208.34.255"
                                        }]
                                    },
                                    "attributes": {
                                        "attribute": [{
                                            "name": "inetnum",
                                            "value": "91.208.34.0 - 91.208.34.255"
                                        }, {
                                            "name": "netname",
                                            "value": "APPELBAUM-NET"
                                        }, {
                                            "name": "country",
                                            "value": "AT"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-JA88-RIPE"
                                            },
                                            "name": "org",
                                            "value": "ORG-JA88-RIPE",
                                            "referenced-type": "organisation"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/JA2712-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "JA2712-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/JA2712-RIPE"
                                            },
                                            "name": "tech-c",
                                            "value": "JA2712-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "name": "status",
                                            "value": "ASSIGNED PI"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-END-MNT"
                                            },
                                            "name": "mnt-by",
                                            "value": "RIPE-NCC-END-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT"
                                            },
                                            "name": "mnt-by",
                                            "value": "APPELBAUM-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT"
                                            },
                                            "name": "mnt-routes",
                                            "value": "APPELBAUM-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/XS4ALL-MNT"
                                            },
                                            "name": "mnt-routes",
                                            "value": "XS4ALL-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT"
                                            },
                                            "name": "mnt-domains",
                                            "value": "APPELBAUM-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "name": "created",
                                            "value": "2008-07-08T10:39:34Z"
                                        }, {
                                            "name": "last-modified",
                                            "value": "2015-05-05T01:59:37Z"
                                        }, {
                                            "name": "source",
                                            "value": "RIPE"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-XIB1-RIPE"
                                            },
                                            "name": "sponsoring-org",
                                            "value": "ORG-XIB1-RIPE",
                                            "referenced-type": "organisation"
                                        }]
                                    },
                                    "tags": {
                                        "tag": [{
                                            "id": "RIPE-REGISTRY-RESOURCE",
                                            "data": null
                                        }]
                                    }
                                }]
                            },
                            "terms-and-conditions": {
                                "type": "locator",
                                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
                            }
                        }
                    }
                },
                inet6numAutoComplete: {
                    req: 'api/whois/autocomplete?extended=true&field=inet6num&query=2001:888:2000::%2F36',
                    resp: {
                        data: [{
                            "key": "2001:888:2000::/36",
                            "type": "inet6num"
                        }]
                    }
                },
                inet6numParentQuery: {
                    req: 'api/whois/search?flags=lr&query-string=2001:888:2000::%2F36&type-filter=inet6num',
                    resp: {
                        data: {
                            "service": {
                                "name": "search"
                            },
                            "parameters": {
                                "inverse-lookup": {},
                                "type-filters": {
                                    "type-filter": [{
                                        "id": "inet6num"
                                    }]
                                },
                                "flags": {
                                    "flag": [{
                                        "value": "one-less"
                                    }, {
                                        "value": "no-referenced"
                                    }]
                                },
                                "query-strings": {
                                    "query-string": [{
                                        "value": "2001:888:2000::/36"
                                    }]
                                },
                                "sources": {}
                            },
                            "objects": {
                                "object": [{
                                    "type": "inet6num",
                                    "link": {
                                        "type": "locator",
                                        "href": "http://rest-prepdev.db.ripe.net/ripe/inet6num/2001:888::/29"
                                    },
                                    "source": {
                                        "id": "ripe"
                                    },
                                    "primary-key": {
                                        "attribute": [{
                                            "name": "inet6num",
                                            "value": "2001:888::/29"
                                        }]
                                    },
                                    "attributes": {
                                        "attribute": [{
                                            "name": "inet6num",
                                            "value": "2001:888::/29"
                                        }, {
                                            "name": "netname",
                                            "value": "NL-XS4ALL-20020807"
                                        }, {
                                            "name": "country",
                                            "value": "NL"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-XIB1-RIPE"
                                            },
                                            "name": "org",
                                            "value": "ORG-XIB1-RIPE",
                                            "referenced-type": "organisation"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/XS42-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "XS42-RIPE",
                                            "referenced-type": "role"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/XS42-RIPE"
                                            },
                                            "name": "tech-c",
                                            "value": "XS42-RIPE",
                                            "referenced-type": "role"
                                        }, {
                                            "name": "status",
                                            "value": "ALLOCATED-BY-RIR"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT"
                                            },
                                            "name": "mnt-by",
                                            "value": "RIPE-NCC-HM-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/XS4ALL-MNT"
                                            },
                                            "name": "mnt-lower",
                                            "value": "XS4ALL-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/XS4ALL-MNT"
                                            },
                                            "name": "mnt-routes",
                                            "value": "XS4ALL-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "name": "created",
                                            "value": "2014-05-15T11:44:49Z"
                                        }, {
                                            "name": "last-modified",
                                            "value": "2014-05-15T11:44:49Z"
                                        }, {
                                            "name": "source",
                                            "value": "RIPE",
                                            "comment": "Filtered"
                                        }]
                                    },
                                    "tags": {
                                        "tag": [{
                                            "id": "RIPE-REGISTRY-RESOURCE",
                                            "data": null
                                        }]
                                    }
                                }]
                            },
                            "terms-and-conditions": {
                                "type": "locator",
                                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
                            }
                        }
                    }
                },
                ORG_AGNS1_RIPE: {
                    req: 'api/whois/RIPE/organisation/ORG-AGNS1-RIPE?unfiltered=true',
                    resp: {
                        data: {
                            "objects": {
                                "object": [{
                                    "type": "organisation",
                                    "link": {
                                        "type": "locator",
                                        "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-AGNS1-RIPE"
                                    },
                                    "source": {
                                        "id": "ripe"
                                    },
                                    "primary-key": {
                                        "attribute": [{
                                            "name": "organisation",
                                            "value": "ORG-AGNS1-RIPE"
                                        }]
                                    },
                                    "attributes": {
                                        "attribute": [{
                                            "name": "organisation",
                                            "value": "ORG-AGNS1-RIPE"
                                        }, {
                                            "name": "org-name",
                                            "value": "AT&T Global Network Services Nederland B.V."
                                        }, {
                                            "name": "org-type",
                                            "value": "LIR"
                                        }, {
                                            "name": "address",
                                            "value": "Wilhelmina van Pruisenweg 106"
                                        }, {
                                            "name": "address",
                                            "value": "2595 AN"
                                        }, {
                                            "name": "address",
                                            "value": "AC Den Haag"
                                        }, {
                                            "name": "address",
                                            "value": "NETHERLANDS"
                                        }, {
                                            "name": "phone",
                                            "value": "+31703376803"
                                        }, {
                                            "name": "fax-no",
                                            "value": "+31703376699"
                                        }, {
                                            "name": "e-mail",
                                            "value": "euabsipa@emea.att.com"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/AR13530-RIPE"
                                            },
                                            "name": "abuse-c",
                                            "value": "AR13530-RIPE",
                                            "referenced-type": "role"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/NI9-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "NI9-RIPE",
                                            "referenced-type": "role"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/RK7531-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "RK7531-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/DR7890-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "DR7890-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/LL6103-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "LL6103-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/PZ2930-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "PZ2930-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/MAINT-AS2686"
                                            },
                                            "name": "mnt-ref",
                                            "value": "MAINT-AS2686",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT"
                                            },
                                            "name": "mnt-ref",
                                            "value": "RIPE-NCC-HM-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT"
                                            },
                                            "name": "mnt-by",
                                            "value": "RIPE-NCC-HM-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/etchells-mnt"
                                            },
                                            "name": "mnt-by",
                                            "value": "etchells-mnt",
                                            "referenced-type": "mntner"
                                        }, {
                                            "name": "abuse-mailbox",
                                            "value": "abuse@attglobal.net"
                                        }, {
                                            "name": "created",
                                            "value": "2004-04-17T10:55:11Z"
                                        }, {
                                            "name": "last-modified",
                                            "value": "2016-03-31T13:28:07Z"
                                        }, {
                                            "name": "source",
                                            "value": "RIPE"
                                        }]
                                    }
                                }]
                            },
                            "terms-and-conditions": {
                                "type": "locator",
                                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
                            }
                        }
                    }
                },
                ORG_SI89_RIPE: {
                    req: 'api/whois/RIPE/organisation/ORG-SI89-RIPE?unfiltered=true',
                    resp: {
                        data: {
                            "objects": {
                                "object": [{
                                    "type": "organisation",
                                    "link": {
                                        "type": "locator",
                                        "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-SI89-RIPE"
                                    },
                                    "source": {
                                        "id": "ripe"
                                    },
                                    "primary-key": {
                                        "attribute": [{
                                            "name": "organisation",
                                            "value": "ORG-SI89-RIPE"
                                        }]
                                    },
                                    "attributes": {
                                        "attribute": [{
                                            "name": "organisation",
                                            "value": "ORG-SI89-RIPE"
                                        }, {
                                            "name": "org-name",
                                            "value": "SafeNet Inc."
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
                                            "value": "USA"
                                        }, {
                                            "name": "e-mail",
                                            "value": "***@safenet.net"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/role/AR30200-RIPE"
                                            },
                                            "name": "abuse-c",
                                            "value": "AR30200-RIPE",
                                            "referenced-type": "role"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EU-IBM-NIC-MNT"
                                            },
                                            "name": "mnt-ref",
                                            "value": "EU-IBM-NIC-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/EU-IBM-NIC-MNT"
                                            },
                                            "name": "mnt-by",
                                            "value": "EU-IBM-NIC-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "name": "created",
                                            "value": "2013-08-15T09:03:37Z"
                                        }, {
                                            "name": "last-modified",
                                            "value": "2014-11-17T22:46:50Z"
                                        }, {
                                            "name": "source",
                                            "value": "RIPE"
                                        }]
                                    }
                                }]
                            },
                            "terms-and-conditions": {
                                "type": "locator",
                                "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
                            }
                        }
                    }
                },
                autoCompleteAuthRipeMntnr: {
                    req: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=RIPE-NCC-END-MNT',
                    resp: {
                        data: [{
                            key: "RIPE-NCC-END-MNT",
                            type: "mntner",
                            auth: ["MD5-PW", "SSO", "PGPKEY-0E3AEA10"]
                        }]
                    }
                },
                autoCompleteAuthAs5486: {
                    req: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=AS5486-MNT',
                    resp: {
                        data: [{
                            key: "AS5486-MNT",
                            type: "mntner",
                            auth: ["MD5-PW", "SSO"]
                        }]
                    }
                },
                autoCompleteAuthAppel: {
                    req: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=APPELBAUM-MNT',
                    resp: {
                        data: [{
                            key: 'APPELBAUM-MNT',
                            type: 'mntner',
                            auth: ['MD5-PW', 'SSO', 'PGPKEY-8736F482', 'SSO']
                        }]
                    }
                }
            };

            // prepare the mocks
            Object.keys(mockGet).forEach(
                function (key) {
                    $httpBackend.whenGET(mockGet[key].req).respond(mockGet[key].resp.status || 200, mockGet[key].resp.data, mockGet[key].resp.data.contentType || mimeJson);
                }
            );
            $httpBackend.whenGET(/.*/).passThrough();

        });
};
