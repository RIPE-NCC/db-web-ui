exports.module = function () {
    'use strict';
    angular.module('dbWebAppE2E', ['dbWebApp', 'ngMockE2E'])
        .run(function ($httpBackend) {
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
                            'mine': true,
                            'auth': ['SSO'],
                            'type': 'mntner',
                            'key': 'etchells-mnt'
                        }, {
                            'mine': true,
                            'auth': ['MD5-PW', 'SSO'],
                            'type': 'mntner', 'key': 'AS5486-MNT'
                        }, {
                            'mine': true,
                            'auth': ['MD5-PW', 'SSO', 'SSO', 'SSO', 'SSO'],
                            'type': 'mntner',
                            'key': 'AARDALSNETT-MNT'
                        }, {
                            'mine': true,
                            'auth': ['MD5-PW', 'SSO', 'PGPKEY-8736F482', 'SSO'],
                            'type': 'mntner',
                            'key': 'APPELBAUM-MNT'
                        }, {
                            'mine': true,
                            'auth': ['MD5-PW', 'SSO'],
                            'type': 'mntner',
                            'key': 'EU-IBM-NIC-MNT'
                        }]
                    }
                },
                autoCompleteAuthRipeEndMnt: {
                    req: 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=RIPE-NCC-END-MNT',
                    resp: {
                        data: [{
                            key: 'RIPE-NCC-END-MNT',
                            type: 'mntner',
                            auth: ['MD5-PW', 'SSO', 'PGPKEY-0E3AEA10']
                        }]
                    }
                },
                autoCompleteRipeHmMnt: {
                    'req': 'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=RIPE-NCC-HM-MNT',
                    'resp': {
                        'data': [{
                            'key': 'RIPE-NCC-HM-MNT',
                            'type': 'mntner',
                            'auth': ['MD5-PW', 'SSO', 'SSO', 'SSO', 'SSO', 'PGPKEY-0E3AEA10']
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
                },

                inetnumAssignedPi: {
                    req: 'api/whois/ripe/inetnum/91.208.34.0-91.208.34.255?unfiltered=true',
                    resp: {
                        data: {
                            'objects': {
                                'object': [{
                                    'type': 'inetnum',
                                    'link': {
                                        'type': 'locator',
                                        'href': 'http://rest-prepdev.db.ripe.net/ripe/inetnum/91.208.34.0 - 91.208.34.255'
                                    },
                                    'source': {
                                        'id': 'ripe'
                                    },
                                    'primary-key': {
                                        'attribute': [{
                                            'name': 'inetnum',
                                            'value': '91.208.34.0 - 91.208.34.255'
                                        }]
                                    },
                                    'attributes': {
                                        'attribute': [{
                                            'name': 'inetnum',
                                            'value': '91.208.34.0 - 91.208.34.255'
                                        }, {
                                            'name': 'netname',
                                            'value': 'APPELBAUM-NET'
                                        }, {
                                            'name': 'country',
                                            'value': 'AT'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-JA88-RIPE'
                                            },
                                            'name': 'org',
                                            'value': 'ORG-JA88-RIPE',
                                            'referenced-type': 'organisation'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/person/JA2712-RIPE'
                                            },
                                            'name': 'admin-c',
                                            'value': 'JA2712-RIPE',
                                            'referenced-type': 'person'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/person/JA2712-RIPE'
                                            },
                                            'name': 'tech-c',
                                            'value': 'JA2712-RIPE',
                                            'referenced-type': 'person'
                                        }, {
                                            'name': 'status',
                                            'value': 'ASSIGNED PI'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-END-MNT'
                                            },
                                            'name': 'mnt-by',
                                            'value': 'RIPE-NCC-END-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT'
                                            },
                                            'name': 'mnt-by',
                                            'value': 'APPELBAUM-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT'
                                            },
                                            'name': 'mnt-routes',
                                            'value': 'APPELBAUM-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/XS4ALL-MNT'
                                            },
                                            'name': 'mnt-routes',
                                            'value': 'XS4ALL-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT'
                                            },
                                            'name': 'mnt-domains',
                                            'value': 'APPELBAUM-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'name': 'created',
                                            'value': '2008-07-08T10:39:34Z'
                                        }, {
                                            'name': 'last-modified',
                                            'value': '2015-05-05T01:59:37Z'
                                        }, {
                                            'name': 'source',
                                            'value': 'RIPE'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-XIB1-RIPE'
                                            },
                                            'name': 'sponsoring-org',
                                            'value': 'ORG-XIB1-RIPE',
                                            'referenced-type': 'organisation'
                                        }]
                                    },
                                    'tags': {
                                        'tag': [{
                                            'id': 'RIPE-REGISTRY-RESOURCE'
                                        }]
                                    }
                                }]
                            },
                            'terms-and-conditions': {
                                'type': 'locator',
                                'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                            }
                        }
                    }
                },
                inetnumAssignedPi2: {
                    req: 'api/whois/ripe/inetnum/91.208.34.0-91.208.34.255?unfiltered=true&unformatted=true',
                    resp: {
                        data: {
                            'objects': {
                                'object': [{
                                    'type': 'inetnum',
                                    'link': {
                                        'type': 'locator',
                                        'href': 'http://rest-prepdev.db.ripe.net/ripe/inetnum/91.208.34.0 - 91.208.34.255'
                                    },
                                    'source': {
                                        'id': 'ripe'
                                    },
                                    'primary-key': {
                                        'attribute': [{
                                            'name': 'inetnum',
                                            'value': '91.208.34.0 - 91.208.34.255'
                                        }]
                                    },
                                    'attributes': {
                                        'attribute': [{
                                            'name': 'inetnum',
                                            'value': '91.208.34.0 - 91.208.34.255'
                                        }, {
                                            'name': 'netname',
                                            'value': 'APPELBAUM-NET'
                                        }, {
                                            'name': 'country',
                                            'value': 'AT'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-JA88-RIPE'
                                            },
                                            'name': 'org',
                                            'value': 'ORG-JA88-RIPE',
                                            'referenced-type': 'organisation'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/person/JA2712-RIPE'
                                            },
                                            'name': 'admin-c',
                                            'value': 'JA2712-RIPE',
                                            'referenced-type': 'person'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/person/JA2712-RIPE'
                                            },
                                            'name': 'tech-c',
                                            'value': 'JA2712-RIPE',
                                            'referenced-type': 'person'
                                        }, {
                                            'name': 'status',
                                            'value': 'ASSIGNED PI'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-END-MNT'
                                            },
                                            'name': 'mnt-by',
                                            'value': 'RIPE-NCC-END-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT'
                                            },
                                            'name': 'mnt-by',
                                            'value': 'APPELBAUM-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT'
                                            },
                                            'name': 'mnt-routes',
                                            'value': 'APPELBAUM-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/XS4ALL-MNT'
                                            },
                                            'name': 'mnt-routes',
                                            'value': 'XS4ALL-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/APPELBAUM-MNT'
                                            },
                                            'name': 'mnt-domains',
                                            'value': 'APPELBAUM-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'name': 'created',
                                            'value': '2008-07-08T10:39:34Z'
                                        }, {
                                            'name': 'last-modified',
                                            'value': '2015-05-05T01:59:37Z'
                                        }, {
                                            'name': 'source',
                                            'value': 'RIPE'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-XIB1-RIPE'
                                            },
                                            'name': 'sponsoring-org',
                                            'value': 'ORG-XIB1-RIPE',
                                            'referenced-type': 'organisation'
                                        }]
                                    },
                                    'tags': {
                                        'tag': [{
                                            'id': 'RIPE-REGISTRY-RESOURCE'
                                        }]
                                    }
                                }]
                            },
                            'terms-and-conditions': {
                                'type': 'locator',
                                'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                            }
                        }
                    }
                },
                inetnumAllocatedPa: {
                    'req': 'api/whois/ripe/inetnum/185.102.172.0-185.102.175.255?unfiltered=true',
                    'resp': {
                        'data': {
                            'objects': {
                                'object': [{
                                    'type': 'inetnum',
                                    'link': {
                                        'type': 'locator',
                                        'href': 'http://rest-prepdev.db.ripe.net/ripe/inetnum/185.102.172.0 - 185.102.175.255'
                                    },
                                    'source': {
                                        'id': 'ripe'
                                    },
                                    'primary-key': {
                                        'attribute': [{
                                            'name': 'inetnum',
                                            'value': '185.102.172.0 - 185.102.175.255'
                                        }]
                                    },
                                    'attributes': {
                                        'attribute': [{
                                            'name': 'inetnum',
                                            'value': '185.102.172.0 - 185.102.175.255'
                                        }, {
                                            'name': 'netname',
                                            'value': 'NL-A2B-CONNECT-20150601'
                                        }, {
                                            'name': 'country',
                                            'value': 'ES'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-ACB5-RIPE'
                                            },
                                            'name': 'org',
                                            'value': 'ORG-ACB5-RIPE',
                                            'referenced-type': 'organisation'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/role/AS51088-RIPE'
                                            },
                                            'name': 'admin-c',
                                            'value': 'AS51088-RIPE',
                                            'referenced-type': 'role'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/role/AS51088-RIPE'
                                            },
                                            'name': 'tech-c',
                                            'value': 'AS51088-RIPE',
                                            'referenced-type': 'role'
                                        }, {
                                            'name': 'status',
                                            'value': 'ALLOCATED PA'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT'
                                            },
                                            'name': 'mnt-by',
                                            'value': 'RIPE-NCC-HM-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/A2B-INTERNET-MNT'
                                            },
                                            'name': 'mnt-lower',
                                            'value': 'A2B-INTERNET-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/MODMC-MNT {185.102.172.0/22}'
                                            },
                                            'name': 'mnt-routes',
                                            'value': 'MODMC-MNT {185.102.172.0/22}',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'name': 'created',
                                            'value': '2015-06-01T09:48:00Z'
                                        }, {
                                            'link': {
                                                'type': 'locator',
                                                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/MODMC-MNT'
                                            },
                                            'name': 'mnt-domains',
                                            'value': 'MODMC-MNT',
                                            'referenced-type': 'mntner'
                                        }, {
                                            'name': 'last-modified',
                                            'value': '2015-08-14T10:52:12Z'
                                        }, {
                                            'name': 'source',
                                            'value': 'RIPE'
                                        }]
                                    }
                                }]
                            },
                            'terms-and-conditions': {
                                'type': 'locator',
                                'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                            }
                        }
                    }
                },
                inet6numAllocatedByRir: {
                    req: '0',
                    resp: {
                        data: {
                            "objects": {
                                "object": [{
                                    "type": "inet6num",
                                    "link": {
                                        "type": "locator",
                                        "href": "http://rest-prepdev.db.ripe.net/ripe/inet6num/2001:a08::/32"
                                    },
                                    "source": {
                                        "id": "ripe"
                                    },
                                    "primary-key": {
                                        "attribute": [{
                                            "name": "inet6num",
                                            "value": "2001:a08::/32"
                                        }]
                                    },
                                    "attributes": {
                                        "attribute": [{
                                            "name": "inet6num",
                                            "value": "2001:a08::/32"
                                        }, {
                                            "name": "netname",
                                            "value": "UK-HIGHSPEEDOFFICE-20021115"
                                        }, {
                                            "name": "country",
                                            "value": "GB"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-HOL1-RIPE"
                                            },
                                            "name": "org",
                                            "value": "ORG-HOL1-RIPE",
                                            "referenced-type": "organisation"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/SWR1-RIPE"
                                            },
                                            "name": "admin-c",
                                            "value": "SWR1-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/NPT1-RIPE"
                                            },
                                            "name": "tech-c",
                                            "value": "NPT1-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/person/APEL1-RIPE"
                                            },
                                            "name": "tech-c",
                                            "value": "APEL1-RIPE",
                                            "referenced-type": "person"
                                        }, {
                                            "name": "status",
                                            "value": "ALLOCATED-BY-RIR"
                                        }, {
                                            "name": "notify",
                                            "value": "***@highspeedoffice.net"
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
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/HSO-MNT"
                                            },
                                            "name": "mnt-lower",
                                            "value": "HSO-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/HSO-MNT"
                                            },
                                            "name": "mnt-routes",
                                            "value": "HSO-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/GOSCOMB-MNT"
                                            },
                                            "name": "mnt-routes",
                                            "value": "GOSCOMB-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "link": {
                                                "type": "locator",
                                                "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/HSO-MNT"
                                            },
                                            "name": "mnt-domains",
                                            "value": "HSO-MNT",
                                            "referenced-type": "mntner"
                                        }, {
                                            "name": "created",
                                            "value": "2002-11-15T09:27:57Z"
                                        }, {
                                            "name": "last-modified",
                                            "value": "2014-02-19T14:53:45Z"
                                        }, {
                                            "name": "source",
                                            "value": "RIPE"
                                        }]
                                    },
                                    "tags": {
                                        "tag": [{
                                            "id": "RIPE-REGISTRY-RESOURCE"
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
