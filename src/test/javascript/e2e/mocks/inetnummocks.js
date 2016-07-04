exports.module = function () {
    'use strict';
    angular.module('dbWebAppE2E', ['dbWebApp', 'ngMockE2E'])
        .run(function ($httpBackend) {
            var mimeJson = {'Content-type': 'application/json'};

            var mockGet = {
                'api/user/info': {
                    status: 200,
                    data: {
                        username: 'petchells@ripe.net',
                        displayName: 'Paul Etchells',
                        expiryDate: [2020, 4, 7, 14, 36, 10, 989],
                        uuid: 'b7a7fc22-4c22-4059-b5b4-3b84b2748141',
                        active: true
                    }
                },
                'api/user/mntners': {
                    status: 200,
                    data: [{
                        'mine': true,
                        'auth': ['SSO'],
                        'type': 'mntner',
                        'key': 'etchells-mnt'
                    }, {
                        'mine': true,
                        'auth': ['MD5-PW', 'SSO'],
                        'type': 'mntner',
                        'key': 'AS5486-MNT'
                    }, {
                        'mine': true,
                        'auth': ['MD5-PW', 'SSO', 'SSO', 'SSO', 'SSO'],
                        'type': 'mntner',
                        'key': 'AARDALSNETT-MNT'
                    }, {
                        //                            'mine': true,
                        //                            'auth': ['MD5-PW', 'SSO', 'PGPKEY-8736F482', 'SSO'],
                        //                            'type': 'mntner',
                        //                            'key': 'APPELBAUM-MNT'
                        //                        }, {
                        'mine': true,
                        'auth': ['MD5-PW', 'SSO'],
                        'type': 'mntner',
                        'key': 'EU-IBM-NIC-MNT'
                    }]
                },
                'api/whois/RIPE/aut-num/AS12467?unfiltered=true': {
                    status: 200,
                    data: {
                        objects: {
                            object: [{
                                type: 'aut-num',
                                link: {
                                    type: 'locator',
                                    href: 'http://rest-prepdev.db.ripe.net/ripe/aut-num/AS12467'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'aut-num',
                                        'value': 'AS12467'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'aut-num',
                                        'value': 'AS12467'
                                    }, {
                                        'name': 'as-name',
                                        'value': 'UNSPECIFIED'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-SI89-RIPE'
                                        },
                                        'name': 'org',
                                        'value': 'ORG-SI89-RIPE',
                                        'referenced-type': 'organisation'
                                    }, {
                                        'name': 'import',
                                        'value': 'from AS5400 accept ANY'
                                    }, {
                                        'name': 'import',
                                        'value': 'from AS702 accept ANY'
                                    }, {
                                        'name': 'export',
                                        'value': 'to AS5400 announce AS12467'
                                    }, {
                                        'name': 'export',
                                        'value': 'to AS702 announce AS12467'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/SIG20-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'SIG20-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/MF7462-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'MF7462-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'name': 'remarks',
                                        'value': 'For information on \'status:\' attribute read https://www.ripe.net/data-tools/db/faq/faq-status-values-legacy-resources'
                                    }, {
                                        'name': 'status',
                                        'value': 'ASSIGNED'
                                    }, {
                                        'name': 'notify',
                                        'value': '***@aladdin.com'
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
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/AS5486-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'AS5486-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/MNT-ALADDIN'
                                        },
                                        'name': 'mnt-routes',
                                        'value': 'MNT-ALADDIN',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '1970-01-01T00:00:00Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2015-05-05T04:31:55Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-AGNS1-RIPE'
                                        },
                                        'name': 'sponsoring-org',
                                        'value': 'ORG-AGNS1-RIPE',
                                        'referenced-type': 'organisation'
                                    }]
                                },
                                'tags': {
                                    'tag': [{
                                        'id': 'RIPE-REGISTRY-RESOURCE',
                                        'data': null
                                    }]
                                }
                            }]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }
                },
                'api/whois/autocomplete?extended=true&field=inetnum&query=193.0.4.0+-+193.0.4.255': {
                    data: [{
                        'key': '193.0.4.0 - 193.0.4.255',
                        'type': 'inetnum'
                    }]
                },
                'api/whois/autocomplete?extended=true&field=inetnum&query=213.159.160.0+-+213.159.190.255': {
                    data: []
                },
                'api/whois/search?flags=lr&query-string=193.0.4.0+-+193.0.4.255&type-filter=inetnum': {
                    data: {
                        'service': {
                            'name': 'search'
                        },
                        'parameters': {
                            'inverse-lookup': {},
                            'type-filters': {
                                'type-filter': [{
                                    'id': 'inetnum'
                                }]
                            },
                            'flags': {
                                'flag': [{
                                    'value': 'one-less'
                                }, {
                                    'value': 'no-referenced'
                                }]
                            },
                            'query-strings': {
                                'query-string': [{
                                    'value': '193.0.4.0 - 193.0.4.255'
                                }]
                            },
                            'sources': {}
                        },
                        'objects': {
                            'object': [{
                                'type': 'inetnum',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inetnum/193.0.0.0 - 193.0.7.255'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inetnum',
                                        'value': '193.0.0.0 - 193.0.7.255'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inetnum',
                                        'value': '193.0.0.0 - 193.0.7.255'
                                    }, {
                                        'name': 'netname',
                                        'value': 'RIPE-NCC'
                                    }, {
                                        'name': 'descr',
                                        'value': 'RIPE Network Coordination Centre'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-RIEN1-RIPE'
                                        },
                                        'name': 'org',
                                        'value': 'ORG-RIEN1-RIPE',
                                        'referenced-type': 'organisation'
                                    }, {
                                        'name': 'descr',
                                        'value': 'Amsterdam, Netherlands'
                                    }, {
                                        'name': 'remarks',
                                        'value': 'Used for RIPE NCC infrastructure.'
                                    }, {
                                        'name': 'country',
                                        'value': 'NL'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/JDR-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'JDR-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/BRD-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'BRD-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/OPS4-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'OPS4-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'name': 'status',
                                        'value': 'ASSIGNED PI'
                                    }, {
                                        'name': 'created',
                                        'value': '2003-03-17T12:15:57Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2015-03-04T16:35:39Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE',
                                        'comment': 'Filtered'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'RIPE-NCC-MNT',
                                        'referenced-type': 'mntner'
                                    }]
                                },
                                'tags': {
                                    'tag': [{
                                        'id': 'RIPE-USER-RESOURCE',
                                        'data': null
                                    }]
                                }
                            }]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }
                },
                'api/whois/search?flags=lr&ignore404=true&query-string=213.159.160.0+-+213.159.190.255&type-filter=inetnum': {
                    data: {
                        'service': {
                            'name': 'search'
                        },
                        'parameters': {
                            'inverse-lookup': {},
                            'type-filters': {
                                'type-filter': [{
                                    'id': 'inetnum'
                                }]
                            },
                            'flags': {
                                'flag': [{
                                    'value': 'one-less'
                                }, {
                                    'value': 'no-referenced'
                                }]
                            },
                            'query-strings': {
                                'query-string': [{
                                    'value': '213.159.160.0 - 213.159.190.255'
                                }]
                            },
                            'sources': {}
                        },
                        'objects': {
                            'object': [{
                                'type': 'inetnum',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inetnum/213.159.160.0 - 213.159.191.255'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inetnum',
                                        'value': '213.159.160.0 - 213.159.191.255'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inetnum',
                                        'value': '213.159.160.0 - 213.159.191.255'
                                    }, {
                                        'name': 'netname',
                                        'value': 'SE-ERICSSON-20010504'
                                    }, {
                                        'name': 'country',
                                        'value': 'DK'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-EA44-RIPE'
                                        },
                                        'name': 'org',
                                        'value': 'ORG-EA44-RIPE',
                                        'referenced-type': 'organisation'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/LO371-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'LO371-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/TL3286-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'TL3286-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/LO371-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'LO371-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/PH3044-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'PH3044-RIPE',
                                        'referenced-type': 'person'
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
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/ERICSSON-MNT'
                                        },
                                        'name': 'mnt-lower',
                                        'value': 'ERICSSON-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '1970-01-01T00:00:00Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2012-02-17T14:10:19Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE'
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

                },
                'api/whois/RIPE/inetnum/91.208.34.0-91.208.34.255?unfiltered=true': {
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
                },
                'api/whois/RIPE/inetnum/185.102.172.0-185.102.175.255?unfiltered=true': {
                    data: {
                        objects: {
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
                },
                'api/whois/RIPE/inetnum/186.102.172.0-186.102.175.255?unfiltered=true': {
                    data: {
                        objects: {
                            'object': [{
                                'type': 'inetnum',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inetnum/186.102.172.0 - 186.102.175.255'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inetnum',
                                        'value': '186.102.172.0 - 186.102.175.255'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inetnum',
                                        'value': '186.102.172.0 - 186.102.175.255'
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
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/UHUUUU-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'UHUUUU-MNT',
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
                },
                'api/whois/RIPE/inetnum/194.219.52.224-194.219.52.239?unfiltered=true': {
                    data: {
                        'objects': {
                            'object': [{
                                'type': 'inetnum',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inetnum/194.219.52.224 - 194.219.52.239'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inetnum',
                                        'value': '194.219.52.224 - 194.219.52.239'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inetnum',
                                        'value': '194.219.52.224 - 194.219.52.239'
                                    }, {
                                        'name': 'netname',
                                        'value': 'FORTHNET-NOC-KLI'
                                    }, {
                                        'name': 'descr',
                                        'value': 'FORTHnet NOC'
                                    }, {
                                        'name': 'descr',
                                        'value': 'Kallithea'
                                    }, {
                                        'name': 'country',
                                        'value': 'GR'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/FTO1-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'FTO1-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/SK1697-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'SK1697-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'name': 'status',
                                        'value': 'ASSIGNED PA'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/TPOLYCHNIA4-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'TPOLYCHNIA4-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '1970-01-01T00:00:00Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2015-12-16T16:05:26Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE'
                                    }]
                                },
                                'tags': {
                                    'tag': [{
                                        'id': 'RIPE-USER-RESOURCE'
                                    }]
                                }
                            }]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }
                },
                'api/whois/autocomplete?extended=true&field=inet6num&query=2001:888:2000::%2F38': {
                    data: []
                },
                'api/whois/search?flags=lr&ignore404=true&query-string=2001:888:2000::%2F38&type-filter=inet6num': {
                    data: {
                        'service': {
                            'name': 'search'
                        },
                        'parameters': {
                            'inverse-lookup': {},
                            'type-filters': {
                                'type-filter': [{
                                    'id': 'inet6num'
                                }]
                            },
                            'flags': {
                                'flag': [{
                                    'value': 'one-less'
                                }, {
                                    'value': 'no-referenced'
                                }]
                            },
                            'query-strings': {
                                'query-string': [{
                                    'value': '2001:888:2000::/38'
                                }]
                            },
                            'sources': {}
                        },
                        'objects': {
                            'object': [{
                                'type': 'inet6num',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inet6num/2001:888:2000::/36'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:888:2000::/36'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:888:2000::/36'
                                    }, {
                                        'name': 'netname',
                                        'value': 'XS4ALL'
                                    }, {
                                        'name': 'descr',
                                        'value': 'XS4ALL Internet BV'
                                    }, {
                                        'name': 'descr',
                                        'value': 'Colocation services'
                                    }, {
                                        'name': 'country',
                                        'value': 'NL'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/XS42-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'XS42-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/XS42-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'XS42-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'name': 'status',
                                        'value': 'AGGREGATED-BY-LIR'
                                    }, {
                                        'name': 'assignment-size',
                                        'value': '48'
                                    }, {
                                        'name': 'remarks',
                                        'value': 'Please send email to \'abuse@xs4all.nl\' for complaints'
                                    }, {
                                        'name': 'remarks',
                                        'value': 'regarding portscans, DoS attacks and spam.'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/XS4ALL-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'XS4ALL-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '2011-02-16T08:38:25Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2011-02-16T14:41:14Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE',
                                        'comment': 'Filtered'
                                    }]
                                },
                                'tags': {
                                    'tag': [{
                                        'id': 'RIPE-USER-RESOURCE'
                                    }]
                                }
                            }]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }
                },
                'api/whois/RIPE/inet6num/2001:999:2000::%2F36?unfiltered=true': {
                    data: {
                        'service': {
                            'name': 'search'
                        },
                        'parameters': {
                            'inverse-lookup': {},
                            'type-filters': {
                                'type-filter': [{
                                    'id': 'inet6num'
                                }]
                            },
                            'flags': {
                                'flag': [{
                                    'value': 'one-less'
                                }, {
                                    'value': 'no-referenced'
                                }]
                            },
                            'query-strings': {
                                'query-string': [{
                                    'value': '2001:999:2000::/36'
                                }]
                            },
                            'sources': {}
                        },
                        'objects': {
                            'object': [{
                                'type': 'inet6num',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inet6num/2001:999:2000::/36'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:999:2000::/36'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:999:2000::/36'
                                    }, {
                                        'name': 'netname',
                                        'value': 'XS4ALL'
                                    }, {
                                        'name': 'descr',
                                        'value': 'XS4ALL Internet BV'
                                    }, {
                                        'name': 'descr',
                                        'value': 'Colocation services'
                                    }, {
                                        'name': 'country',
                                        'value': 'NL'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/XS42-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'XS42-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/XS42-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'XS42-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'name': 'status',
                                        'value': 'ALLOCATED-BY-RIR'
                                    }, {
                                        'name': 'assignment-size',
                                        'value': '48'
                                    }, {
                                        'name': 'remarks',
                                        'value': 'Please send email to \'abuse@xs4all.nl\' for complaints'
                                    }, {
                                        'name': 'remarks',
                                        'value': 'regarding portscans, DoS attacks and spam.'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/XS4ALL-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'XS4ALL-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'RIPE-NCC-HM-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '2011-02-16T08:38:25Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2011-02-16T14:41:14Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE',
                                        'comment': 'Filtered'
                                    }]
                                },
                                'tags': {
                                    'tag': [{
                                        'id': 'RIPE-USER-RESOURCE'
                                    }]
                                }
                            }]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }
                },
                'api/whois/RIPE/inet6num/2001:998:2000::%2F36?unfiltered=true': {
                    data: {
                        'service': {
                            'name': 'search'
                        },
                        'parameters': {
                            'inverse-lookup': {},
                            'type-filters': {
                                'type-filter': [{
                                    'id': 'inet6num'
                                }]
                            },
                            'flags': {
                                'flag': [{
                                    'value': 'one-less'
                                }, {
                                    'value': 'no-referenced'
                                }]
                            },
                            'query-strings': {
                                'query-string': [{
                                    'value': '2001:998:2000::/36'
                                }]
                            },
                            'sources': {}
                        },
                        'objects': {
                            'object': [{
                                'type': 'inet6num',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inet6num/2001:998:2000::/36'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:998:2000::/36'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:998:2000::/36'
                                    }, {
                                        'name': 'netname',
                                        'value': 'XS4ALL'
                                    }, {
                                        'name': 'descr',
                                        'value': 'XS4ALL Internet BV'
                                    }, {
                                        'name': 'descr',
                                        'value': 'Colocation services'
                                    }, {
                                        'name': 'country',
                                        'value': 'NL'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/XS42-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'XS42-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/XS42-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'XS42-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'name': 'status',
                                        'value': 'ASSIGNED'
                                    }, {
                                        'name': 'assignment-size',
                                        'value': '48'
                                    }, {
                                        'name': 'remarks',
                                        'value': 'Please send email to \'abuse@xs4all.nl\' for complaints'
                                    }, {
                                        'name': 'remarks',
                                        'value': 'regarding portscans, DoS attacks and spam.'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/XS4ALL-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'XS4ALL-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'RIPE-NCC-END-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '2011-02-16T08:38:25Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2011-02-16T14:41:14Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE',
                                        'comment': 'Filtered'
                                    }]
                                },
                                'tags': {
                                    'tag': [{
                                        'id': 'RIPE-USER-RESOURCE'
                                    }]
                                }
                            }]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }
                },
                'api/whois/RIPE/inet6num/2001:a08::%2F32?unfiltered=true': {
                    data: {
                        'objects': {
                            'object': [{
                                'type': 'inet6num',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inet6num/2001:a08::/32'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:a08::/32'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:a08::/32'
                                    }, {
                                        'name': 'netname',
                                        'value': 'UK-HIGHSPEEDOFFICE-20021115'
                                    }, {
                                        'name': 'country',
                                        'value': 'GB'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-HOL1-RIPE'
                                        },
                                        'name': 'org',
                                        'value': 'ORG-HOL1-RIPE',
                                        'referenced-type': 'organisation'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/SWR1-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'SWR1-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/NPT1-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'NPT1-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/APEL1-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'APEL1-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'name': 'status',
                                        'value': 'ALLOCATED-BY-RIR'
                                    }, {
                                        'name': 'notify',
                                        'value': '***@highspeedoffice.net'
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
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/HSO-MNT'
                                        },
                                        'name': 'mnt-lower',
                                        'value': 'HSO-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/HSO-MNT'
                                        },
                                        'name': 'mnt-routes',
                                        'value': 'HSO-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/GOSCOMB-MNT'
                                        },
                                        'name': 'mnt-routes',
                                        'value': 'GOSCOMB-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/HSO-MNT'
                                        },
                                        'name': 'mnt-domains',
                                        'value': 'HSO-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '2002-11-15T09:27:57Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2014-02-19T14:53:45Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE'
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
                },
                'api/whois/RIPE/inet6num/2001:978:ffff:fffe::%2F64?unfiltered=true': {
                    data: {
                        'objects': {
                            'object': [{
                                'type': 'inet6num',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/inet6num/2001:978:ffff:fffe::/64'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:978:ffff:fffe::/64'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'inet6num',
                                        'value': '2001:978:ffff:fffe::/64'
                                    }, {
                                        'name': 'netname',
                                        'value': 'ITEX-6NET'
                                    }, {
                                        'name': 'descr',
                                        'value': 'ITEX Media GmbH'
                                    }, {
                                        'name': 'country',
                                        'value': 'DE'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/ITEX-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'ITEX-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/ITEX-RIPE'
                                        },
                                        'name': 'tech-c',
                                        'value': 'ITEX-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'name': 'status',
                                        'value': 'ALLOCATED-BY-LIR'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/COGENT-HM-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'COGENT-HM-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '2002-11-14T13:31:20Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2005-01-05T13:52:29Z'
                                    }, {
                                        'name': 'source',
                                        'value': 'RIPE'
                                    }]
                                },
                                'tags': {
                                    'tag': [{
                                        'id': 'RIPE-USER-RESOURCE'
                                    }]
                                }
                            }]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }
                },
                'api/whois/RIPE/organisation/ORG-AGNS1-RIPE?unfiltered=true': {
                    data: {
                        'objects': {
                            'object': [{
                                'type': 'organisation',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-AGNS1-RIPE'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'organisation',
                                        'value': 'ORG-AGNS1-RIPE'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'organisation',
                                        'value': 'ORG-AGNS1-RIPE'
                                    }, {
                                        'name': 'org-name',
                                        'value': 'AT&T Global Network Services Nederland B.V.'
                                    }, {
                                        'name': 'org-type',
                                        'value': 'LIR'
                                    }, {
                                        'name': 'address',
                                        'value': 'Wilhelmina van Pruisenweg 106'
                                    }, {
                                        'name': 'address',
                                        'value': '2595 AN'
                                    }, {
                                        'name': 'address',
                                        'value': 'AC Den Haag'
                                    }, {
                                        'name': 'address',
                                        'value': 'NETHERLANDS'
                                    }, {
                                        'name': 'phone',
                                        'value': '+31703376803'
                                    }, {
                                        'name': 'fax-no',
                                        'value': '+31703376699'
                                    }, {
                                        'name': 'e-mail',
                                        'value': 'euabsipa@emea.att.com'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/AR13530-RIPE'
                                        },
                                        'name': 'abuse-c',
                                        'value': 'AR13530-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/NI9-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'NI9-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/RK7531-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'RK7531-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/DR7890-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'DR7890-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/LL6103-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'LL6103-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/person/PZ2930-RIPE'
                                        },
                                        'name': 'admin-c',
                                        'value': 'PZ2930-RIPE',
                                        'referenced-type': 'person'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/MAINT-AS2686'
                                        },
                                        'name': 'mnt-ref',
                                        'value': 'MAINT-AS2686',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT'
                                        },
                                        'name': 'mnt-ref',
                                        'value': 'RIPE-NCC-HM-MNT',
                                        'referenced-type': 'mntner'
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
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/etchells-mnt'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'etchells-mnt',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'abuse-mailbox',
                                        'value': 'abuse@attglobal.net'
                                    }, {
                                        'name': 'created',
                                        'value': '2004-04-17T10:55:11Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2016-03-31T13:28:07Z'
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
                },
                'api/whois/RIPE/organisation/ORG-SI89-RIPE?unfiltered=true': {
                    data: {
                        'objects': {
                            'object': [{
                                'type': 'organisation',
                                'link': {
                                    'type': 'locator',
                                    'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-SI89-RIPE'
                                },
                                'source': {
                                    'id': 'ripe'
                                },
                                'primary-key': {
                                    'attribute': [{
                                        'name': 'organisation',
                                        'value': 'ORG-SI89-RIPE'
                                    }]
                                },
                                'attributes': {
                                    'attribute': [{
                                        'name': 'organisation',
                                        'value': 'ORG-SI89-RIPE'
                                    }, {
                                        'name': 'org-name',
                                        'value': 'SafeNet Inc.'
                                    }, {
                                        'name': 'org-type',
                                        'value': 'OTHER'
                                    }, {
                                        'name': 'address',
                                        'value': '***'
                                    }, {
                                        'name': 'address',
                                        'value': '***'
                                    }, {
                                        'name': 'address',
                                        'value': 'USA'
                                    }, {
                                        'name': 'e-mail',
                                        'value': '***@safenet.net'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/role/AR30200-RIPE'
                                        },
                                        'name': 'abuse-c',
                                        'value': 'AR30200-RIPE',
                                        'referenced-type': 'role'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/EU-IBM-NIC-MNT'
                                        },
                                        'name': 'mnt-ref',
                                        'value': 'EU-IBM-NIC-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'link': {
                                            'type': 'locator',
                                            'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/EU-IBM-NIC-MNT'
                                        },
                                        'name': 'mnt-by',
                                        'value': 'EU-IBM-NIC-MNT',
                                        'referenced-type': 'mntner'
                                    }, {
                                        'name': 'created',
                                        'value': '2013-08-15T09:03:37Z'
                                    }, {
                                        'name': 'last-modified',
                                        'value': '2014-11-17T22:46:50Z'
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

                },
                'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=COGENT-HM-MNT': {
                    data: [{
                        'key': 'COGENT-HM-MNT',
                        'type': 'mntner',
                        'auth': ['MD5-PW', 'PGPKEY-A64383E9', 'PGPKEY-BBD4123B', 'PGPKEY-4C8A9D8D', 'PGPKEY-6B6A5097', 'PGPKEY-726BD791', 'PGPKEY-B3004B9E', 'PGPKEY-D3D6B8C4', 'PGPKEY-E3BAB9C6']
                    }]
                },
                'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TPOLYCHNIA4-MNT': {
                    data: [{
                        'key': 'TPOLYCHNIA4-MNT',
                        'type': 'mntner',
                        'auth': ['MD5-PW', 'MD5-PW']
                    }]
                },
                'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=RIPE-NCC-HM-MNT': {
                    data: [{
                        'key': 'RIPE-NCC-HM-MNT',
                        'type': 'mntner',
                        'auth': ['MD5-PW', 'SSO', 'SSO', 'SSO', 'SSO', 'PGPKEY-0E3AEA10']
                    }]

                },
                'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=RIPE-NCC-END-MNT': {
                    data: [{
                        key: 'RIPE-NCC-END-MNT',
                        type: 'mntner',
                        auth: ['MD5-PW', 'SSO', 'PGPKEY-0E3AEA10']
                    }]
                },
                'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=AS5486-MNT': {
                    data: [{
                        key: 'AS5486-MNT',
                        type: 'mntner',
                        auth: ['MD5-PW', 'SSO']
                    }]
                },
                'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=APPELBAUM-MNT': {
                    data: [{
                        key: 'APPELBAUM-MNT',
                        type: 'mntner',
                        auth: ['MD5-PW', 'SSO', 'PGPKEY-8736F482', 'SSO']
                    }]
                },
                'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=NEWNET-MNT': {
                    data: [{
                        'key': 'NEWNET-MNT',
                        'type': 'mntner',
                        'auth': ['MD5-PW']
                    }]
                },
                'api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=UHUUUU-MNT': {
                    data: [{
                        'key': 'UHUUUU-MNT',
                        'type': 'mntner',
                        'auth': ['SSO']
                    }]
                }
            };

            // prepare the mocks
            Object.keys(mockGet).forEach(
                function (key) {
                    $httpBackend.whenGET(key).respond(mockGet[key].status || 200, mockGet[key].data, mockGet[key].contentType || mimeJson);
                }
            );
            $httpBackend.whenGET(/.*/).passThrough();

        });
};
