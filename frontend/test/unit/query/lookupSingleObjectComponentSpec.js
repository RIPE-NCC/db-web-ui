/*global beforeEach,describe,expect,inject,it,spyOn*/
'use strict';

var mockResponse = {
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
                "managed": false
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
                "managed": false
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
                "managed": false
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
                "managed": false
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
                "managed": false
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
                "managed": false
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
                "managed": false
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    },
    singleResult: {
        "service": {
            "name": "search"
        },
        "parameters": {
            "inverse-lookup": {},
            "type-filters": {
                "type-filter": [{
                    "id": "mntner"
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
                    "value": "etchells-mnt"
                }]
            },
            "sources": {}
        },
        "objects": {
            "object": [{
                "type": "mntner",
                "link": {
                    "type": "locator",
                    "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/etchells-mnt"
                },
                "source": {
                    "id": "ripe"
                },
                "primary-key": {
                    "attribute": [{
                        "name": "mntner",
                        "value": "etchells-mnt"
                    }]
                },
                "attributes": {
                    "attribute": [{
                        "name": "mntner",
                        "value": "etchells-mnt"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/person/PE3012-RIPE"
                        },
                        "name": "admin-c",
                        "value": "PE3012-RIPE",
                        "referenced-type": "person"
                    }, {
                        "name": "upd-to",
                        "value": "petchells@ripe.net"
                    }, {
                        "name": "auth",
                        "value": "MD5-PW",
                        "comment": "Filtered"
                    }, {
                        "name": "auth",
                        "value": "SSO",
                        "comment": "Filtered"
                    }, {
                        "link": {
                            "type": "locator",
                            "href": "http://rest-prepdev.db.ripe.net/ripe/mntner/etchells-mnt"
                        },
                        "name": "mnt-by",
                        "value": "etchells-mnt",
                        "referenced-type": "mntner"
                    }, {
                        "name": "created",
                        "value": "2016-03-21T16:16:47Z"
                    }, {
                        "name": "last-modified",
                        "value": "2016-09-19T14:27:00Z"
                    }, {
                        "name": "source",
                        "value": "RIPE",
                        "comment": "Filtered"
                    }]
                },
                "managed": false
            }]
        },
        "terms-and-conditions": {
            "type": "locator",
            "href": "http://www.ripe.net/db/support/db-terms-conditions.pdf"
        }
    }
};

describe('LookupSingleObjectComponent', function () {

    var $componentController;
    var $state;
    var $log;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_, _$log_, _$state_) {
        $componentController = _$componentController_;
        $log = _$log_;
        $state = _$state_;
    }));

    describe('shows an object', function () {

        var response = {
            data: mockResponse.singleResult
        };

        var qSvc = function(resp) {
            return {
                lookupWhoisObject: function () {
                    return {
                        then: function (success) {
                            success(resp);
                        }
                    }
                }
            }
        };
        var qSvcWithException = function(resp) {
            return {
                lookupWhoisObject: function () {
                    return {
                        then: function (success) {
                            throw new TypeError("That just won't do.");
                        }
                    }
                }
            }
        };

        it('all lovely and that', function (done) {
            spyOn($state, "go");

            var $stateParams = {
                source: "useTheSource",
                type: "thetype",
                key: "thekey"
            };
            var ctrl = $componentController('lookupSingle', {
                $state: $state,
                $stateParams: $stateParams,
                LookupService: qSvc(response)
            });
            done();
            expect(ctrl.whoisResponse).toBeTruthy();

            ctrl.goToUpdate();
            expect($state.go).toHaveBeenCalledWith("webupdates.modify", {
                name: "thekey",
                objectType: "thetype",
                source: "useTheSource"
            });
        });

        it('but not when the params are empty', function (done) {
            spyOn($log, "warn");

            var ctrl = $componentController('lookupSingle', {
                $state: $state,
                $stateParams: {},
                LookupService: qSvcWithException(response)
            });
            done();
            expect(ctrl.whoisResponse).toBeFalsy();
            expect(ctrl.error).toBeTruthy();
        });

        it('but not when the response is empty', function(done) {
            spyOn($log, "warn");
            spyOn($state, "go");

            var $stateParams = {
                source: "useTheSource",
                type: "thetype",
                key: "thekey"
            };
            var ctrl = $componentController('lookupSingle', {
                $state: $state,
                $stateParams: $stateParams,
                LookupService: qSvc({})
            });
            done();
            expect($log.warn).toHaveBeenCalled();
            expect(ctrl.whoisResponse).toBeFalsy();
        });

        it('but not when there is more than one result', function(done) {
            spyOn($log, "warn");
            spyOn($state, "go");

            var $stateParams = {
                source: "useTheSource",
                type: "thetype",
                key: "thekey"
            };
            var ctrl = $componentController('lookupSingle', {
                $state: $state,
                $stateParams: $stateParams,
                LookupService: qSvc({ data: mockResponse.wakefield })
            });
            done();
            expect($log.warn).toHaveBeenCalled();
            expect(ctrl.whoisResponse).toBeFalsy();
        });

    });

});

