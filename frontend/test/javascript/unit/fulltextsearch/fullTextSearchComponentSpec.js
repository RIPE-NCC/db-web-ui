/*global afterEach,beforeEach,describe,expect,inject,it*/

'use strict';

describe('dbWebApp: FullTextSearchComponent', function () {

    var $componentController;

    var $log;
    var $http;
    var FullTextSearchService;
    var FullTextResponseService;
    var WhoisMetaService;
    var $httpBackend;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_) {
        $componentController = _$componentController_;
    }));

    beforeEach(inject(function (_$log_, _$http_, _FullTextSearchService_, _FullTextResponseService_, _WhoisMetaService_, _$httpBackend_) {
        $log = _$log_;
        $http = _$http_;
        FullTextSearchService = _FullTextSearchService_;
        FullTextResponseService = _FullTextResponseService_;
        WhoisMetaService = _WhoisMetaService_;
        $httpBackend = _$httpBackend_;
    }));

    it('should support addition and removal of object types and attributes', function () {
        var ctrl = $componentController('fullTextSearch', {
            $log: $log,
            searchService: FullTextSearchService,
            fullTextResponseService: FullTextResponseService,
            whoisMetaService: WhoisMetaService,
            labels: {},
            properties: {}
        });

        var expectedObjectTypes = ['as-block', 'as-set', 'aut-num', 'domain', 'filter-set', 'inet6num', 'inetnum', 'inet-rtr', 'irt', 'key-cert', 'mntner', 'organisation', 'peering-set', 'person', 'poem', 'poetic-form', 'role', 'route', 'route6', 'route-set', 'rtr-set'];

        expect(expectedObjectTypes.length).toEqual(ctrl.objectTypes.length);

        for (var i = 0; i < expectedObjectTypes.length; i++) {
            expect(expectedObjectTypes[i]).toEqual(ctrl.objectTypes[i]);
        }

        expect(ctrl.selectedObjectTypes.length).toEqual(0);
        ctrl.toggleSearchMode();
        expect(ctrl.advancedSearch).toEqual(true);
        expect(ctrl.queryHash()).toEqual("alltrue");

        ctrl.addObjectToFilter('inetnum');
        expect(ctrl.selectedObjectTypes.length).toEqual(1);
        ctrl.addObjectToFilter('inetnum'); // Still 1 coz it's already added
        expect(ctrl.selectedObjectTypes.length).toEqual(1);
        expect(ctrl.selectableAttributes.length).toEqual(22);
        expect(ctrl.queryHash()).toEqual("alltrueinetnum");

        ctrl.selectAll();
        expect(ctrl.selectedObjectTypes.length).toEqual(21);
        expect(ctrl.selectableAttributes.length).toEqual(101);
        expect(ctrl.queryHash()).toEqual("alltrueas-blockas-setaut-numdomainfilter-setinet6numinetnuminet-rtrirtkey-certmntnerorganisationpeering-setpersonpoempoetic-formrolerouteroute6route-setrtr-set");

        ctrl.selectNone();
        expect(ctrl.selectedObjectTypes.length).toEqual(0);
        expect(ctrl.selectableAttributes.length).toEqual(0);
        expect(ctrl.queryHash()).toEqual("alltrue");

        ctrl.addObjectToFilter("inetnum");
        ctrl.selectedAttrs = ["country"];
        expect(ctrl.queryHash()).toEqual("alltrueinetnumcountry");
    });

    it('should be able to search and process the result', function () {

        var response;

        response = {
            data: responseEtchMnt
        };

        FullTextSearchService.doSearch = function (q, start, isAdv, advMode, objTypes, attrs) {
            return {
                then: function (promise) {
                    promise(response);
                }
            }
        };

        var ctrl;

        ctrl = $componentController('fullTextSearch', {
            $log: $log,
            searchService: FullTextSearchService,
            fullTextResponseService: FullTextResponseService,
            whoisMetaService: WhoisMetaService,
            labels: {},
            properties: {}
        });

        ctrl.searchClicked();
        expect(ctrl.showError).toEqual("fullText.emptyQueryText.text");
        ctrl.ftquery = "etch-mnt";
        ctrl.searchClicked();
        expect(ctrl.showError).toBeFalsy();
        expect(ctrl.numResults).toEqual(7);
        ctrl.searchClicked();
        expect(ctrl.showError).toBeFalsy();
        expect(ctrl.numResults).toEqual(7);

        response = {
            data: responseEmpty
        };
        ctrl.searchClicked();
        expect(ctrl.showError).toBeTruthy();
        expect(ctrl.numResults).toEqual(0);

    });

});

var responseEmpty = {
    "result": {
        "name": "response",
        "numFound": 0,
        "start": 0,
        "docs": []
    },
    "lsts": [{
        "lst": {
            "name": "responseHeader",
            "ints": [{
                "int": {
                    "name": "status",
                    "value": "0"
                }
            }, {
                "int": {
                    "name": "QTime",
                    "value": "1824"
                }
            }],
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "params",
                    "ints": null,
                    "strs": [{
                        "str": {
                            "name": "q",
                            "value": "(lkjlkjlkjlkjlknkjnkjnkjnb)"
                        }
                    }, {
                        "str": {
                            "name": "rows",
                            "value": "10"
                        }
                    }, {
                        "str": {
                            "name": "start",
                            "value": "0"
                        }
                    }, {
                        "str": {
                            "name": "hl",
                            "value": "true"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.pre",
                            "value": "<b>"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.post",
                            "value": "</b>"
                        }
                    }, {
                        "str": {
                            "name": "wt",
                            "value": "json"
                        }
                    }, {
                        "str": {
                            "name": "facet",
                            "value": "true"
                        }
                    }],
                    "lsts": null,
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "highlighting",
            "ints": null,
            "strs": null,
            "lsts": [],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "facet_counts",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "facet_fields",
                    "ints": null,
                    "strs": null,
                    "lsts": [],
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }]
};

var responseEtchMnt = {
    "result": {
        "name": "response",
        "numFound": 7,
        "start": 0,
        "docs": [{
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15319480"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "185.169.96.0 - 185.169.99.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "185.169.96.0 - 185.169.99.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "PT-HOMEHOST-20160923"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "PT"
                    }
                }, {
                    "str": {
                        "name": "org",
                        "value": "ORG-WA56-RIPE"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "SR11550-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "SR11550-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ALLOCATED PA"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "RIPE-NCC-HM-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "tdacruzper-mnt"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2016-10-11T11:14:23Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2016-10-24T15:33:06Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "3386406"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "inetnum"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "194.171.2.0 - 194.171.2.255"
                    }
                }, {
                    "str": {
                        "name": "inetnum",
                        "value": "194.171.2.0 - 194.171.2.255"
                    }
                }, {
                    "str": {
                        "name": "netname",
                        "value": "SNET-AT-RU"
                    }
                }, {
                    "str": {
                        "name": "descr",
                        "value": "SURFnet LAN at RU"
                    }
                }, {
                    "str": {
                        "name": "country",
                        "value": "NL"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "SNS1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "tech-c",
                        "value": "SNS1-RIPE"
                    }
                }, {
                    "str": {
                        "name": "status",
                        "value": "ASSIGNED PA"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "SN-LIR-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-irt",
                        "value": "irt-SURFcert"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2005-01-17T10:51:33Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2017-06-07T10:51:43Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15319374"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "mntner"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "mntner",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "admin-c",
                        "value": "PE3013-RIPE"
                    }
                }, {
                    "str": {
                        "name": "upd-to",
                        "value": "petchells@ripe.net"
                    }
                }, {
                    "str": {
                        "name": "auth",
                        "value": "SSO"
                    }
                }, {
                    "str": {
                        "name": "auth",
                        "value": "MD5-PW"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2016-06-29T11:37:40Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2016-10-07T12:12:53Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15319375"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "person"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "PE3013-RIPE"
                    }
                }, {
                    "str": {
                        "name": "person",
                        "value": "Paul Etchells"
                    }
                }, {
                    "str": {
                        "name": "address",
                        "value": "singel, amsterdam"
                    }
                }, {
                    "str": {
                        "name": "phone",
                        "value": "+316 1234 5678"
                    }
                }, {
                    "str": {
                        "name": "nic-hdl",
                        "value": "PE3013-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2016-06-29T11:37:41Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2016-06-29T11:37:41Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15323016"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "person"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "PP14500-RIPE"
                    }
                }, {
                    "str": {
                        "name": "person",
                        "value": "Penelope Pitstop"
                    }
                }, {
                    "str": {
                        "name": "address",
                        "value": "Whacky Races 5"
                    }
                }, {
                    "str": {
                        "name": "phone",
                        "value": "+123"
                    }
                }, {
                    "str": {
                        "name": "nic-hdl",
                        "value": "PP14500-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "SHRYANE-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "xxx"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "BCGE-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "MNT-LGI"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etchells-mnt"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "NATO-MNT1"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2017-10-13T13:54:43Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2017-10-17T13:11:18Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15323018"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "person"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "JTB67-RIPE"
                    }
                }, {
                    "str": {
                        "name": "person",
                        "value": "John The Baptist"
                    }
                }, {
                    "str": {
                        "name": "address",
                        "value": "Hollywood"
                    }
                }, {
                    "str": {
                        "name": "phone",
                        "value": "+123"
                    }
                }, {
                    "str": {
                        "name": "nic-hdl",
                        "value": "JTB67-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "SHRYANE-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "xxx"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "BCGE-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "MNT-LGI"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etchells-mnt"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "NATO-MNT1"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2017-10-13T14:05:33Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2017-10-13T14:05:33Z"
                    }
                }]
            }
        }, {
            "doc": {
                "strs": [{
                    "str": {
                        "name": "primary-key",
                        "value": "15323015"
                    }
                }, {
                    "str": {
                        "name": "object-type",
                        "value": "person"
                    }
                }, {
                    "str": {
                        "name": "lookup-key",
                        "value": "PP14499-RIPE"
                    }
                }, {
                    "str": {
                        "name": "person",
                        "value": "Peter Perfect"
                    }
                }, {
                    "str": {
                        "name": "address",
                        "value": "Whacky Races 7"
                    }
                }, {
                    "str": {
                        "name": "phone",
                        "value": "+123"
                    }
                }, {
                    "str": {
                        "name": "nic-hdl",
                        "value": "PP14499-RIPE"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "SHRYANE-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "xxx"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "BCGE-MNT"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "MNT-LGI"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etchells-mnt"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "etch-mnt"
                    }
                }, {
                    "str": {
                        "name": "mnt-by",
                        "value": "NATO-MNT1"
                    }
                }, {
                    "str": {
                        "name": "created",
                        "value": "2017-10-13T13:54:00Z"
                    }
                }, {
                    "str": {
                        "name": "last-modified",
                        "value": "2017-10-17T13:18:35Z"
                    }
                }]
            }
        }]
    },
    "lsts": [{
        "lst": {
            "name": "responseHeader",
            "ints": [{
                "int": {
                    "name": "status",
                    "value": "0"
                }
            }, {
                "int": {
                    "name": "QTime",
                    "value": "45"
                }
            }],
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "params",
                    "ints": null,
                    "strs": [{
                        "str": {
                            "name": "q",
                            "value": "(etch-mnt)"
                        }
                    }, {
                        "str": {
                            "name": "rows",
                            "value": "10"
                        }
                    }, {
                        "str": {
                            "name": "start",
                            "value": "0"
                        }
                    }, {
                        "str": {
                            "name": "hl",
                            "value": "true"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.pre",
                            "value": "<b>"
                        }
                    }, {
                        "str": {
                            "name": "hl.simple.post",
                            "value": "</b>"
                        }
                    }, {
                        "str": {
                            "name": "wt",
                            "value": "json"
                        }
                    }, {
                        "str": {
                            "name": "facet",
                            "value": "true"
                        }
                    }],
                    "lsts": null,
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "highlighting",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "15319480",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "mnt-by",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "3386406",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "mnt-by",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "15319374",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "lookup-key",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "mntner",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }, {
                        "arr": {
                            "name": "mnt-by",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "15319375",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "mnt-by",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "15323016",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "mnt-by",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "15323018",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "mnt-by",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }]
                }
            }, {
                "lst": {
                    "name": "15323015",
                    "ints": null,
                    "strs": null,
                    "lsts": null,
                    "arrs": [{
                        "arr": {
                            "name": "mnt-by",
                            "str": {
                                "name": null,
                                "value": "<b>etch-mnt</b>"
                            }
                        }
                    }]
                }
            }],
            "arrs": null
        }
    }, {
        "lst": {
            "name": "facet_counts",
            "ints": null,
            "strs": null,
            "lsts": [{
                "lst": {
                    "name": "facet_fields",
                    "ints": null,
                    "strs": null,
                    "lsts": [{
                        "lst": {
                            "name": "object-type",
                            "ints": [{
                                "int": {
                                    "name": "person",
                                    "value": "4"
                                }
                            }, {
                                "int": {
                                    "name": "inetnum",
                                    "value": "2"
                                }
                            }, {
                                "int": {
                                    "name": "mntner",
                                    "value": "1"
                                }
                            }],
                            "strs": null,
                            "lsts": null,
                            "arrs": null
                        }
                    }],
                    "arrs": null
                }
            }],
            "arrs": null
        }
    }]
};

