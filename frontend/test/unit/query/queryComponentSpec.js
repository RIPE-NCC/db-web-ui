/*global beforeEach,describe,expect,inject,it*/
'use strict';

describe('The QueryComponent', function () {

    var $componentController;
    var $location;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_, _$location_) {
        $componentController = _$componentController_;
        $location = _$location_;
    }));

    describe('with no query string', function () {

        it('should set up default options for querying', function () {
            var ctrl = $componentController('query', {$stateParams: {}});
            ctrl.doSearch();
            expect(ctrl.results.length).toEqual(0);
            expect(ctrl.numResultsToShow).toEqual(20);
            expect(ctrl.qp.showFullObjectDetails).toEqual(true);
            expect(ctrl.qp.reverseDomain).toEqual(false);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(ctrl.qp.source).toEqual("RIPE");
            expect(ctrl.qp.types).toEqual({});
            expect(ctrl.qp.inverse).toEqual({});
        });

    });

    describe('with a single search term', function () {

        var sp;

        var successResponse = {
            data: {
                objects: {
                    object: [{}, {}, {}, {}]
                }
            }
        };

        var queryService = {
            searchWhoisObjects: function () {
                return {
                    then: function (successFunc) {
                        successFunc(successResponse);
                    }
                };
            },
            buildQueryStringForLink: function () {
                return "?buildQueryStringForLink=true"
            },
            buildPermalink: function (qp) {
                return "http://localhost/PERMA-LINK"
            }
        };

        beforeEach(function () {
            sp = {
                searchtext: " 193.0.0.0 ",
                types: "inetnum;inet6num",
                inverse: "",
                hierarchyFlag: "exact",
                rflag: "false",
                dflag: "true",
                bflag: "",
                source: "TEST"
            };
        });

        it('should parse the options into the form', function () {
            var ctrl = $componentController('query', {
                $stateParams: sp,
                QueryService: queryService
            });
            expect(ctrl.numResultsToShow).toEqual(20);
            expect(ctrl.qp.queryText).toEqual("193.0.0.0");
            expect(ctrl.qp.showFullObjectDetails).toEqual(false);
            expect(ctrl.qp.reverseDomain).toEqual(true);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(ctrl.qp.types).toEqual({INETNUM: true, INET6NUM: true});
            expect(ctrl.qp.inverse).toEqual({});
            expect(ctrl.qp.source).toEqual("TEST");
            expect(ctrl.whoisCliQuery()).toEqual("-T inetnum,inet6num -xd 193.0.0.0");

            ctrl.doSearch();
            expect(ctrl.results.length).toEqual(4);
        });

        it('should handle an empty search string', function () {
            sp.searchtext = '';
            sp.dflag = "";
            var ctrl = $componentController('query', {
                $stateParams: sp,
                QueryService: queryService
            });
            expect(ctrl.numResultsToShow).toEqual(20);
            expect(ctrl.qp.queryText).toEqual("");
            expect(ctrl.qp.showFullObjectDetails).toEqual(false);
            expect(ctrl.qp.reverseDomain).toEqual(false);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(ctrl.qp.types).toEqual({INETNUM: true, INET6NUM: true});
            expect(ctrl.qp.inverse).toEqual({});
            expect(ctrl.qp.source).toEqual("TEST");
            expect(ctrl.whoisCliQuery().trim()).toEqual("");

            ctrl.doSearch();
            expect(ctrl.results.length).toEqual(0);
        });

        it('should handle empty params', function () {
            sp.types = '';
            sp.inverse = undefined;
            sp.hierarchyFlag = undefined;
            sp.bflag = 'true';
            sp.rflag = 'true';
            sp.dflag = 'false';
            sp.source = 'GRS';
            var ctrl = $componentController('query', {
                $stateParams: sp,
                QueryService: queryService
            });
            expect(ctrl.numResultsToShow).toEqual(20);
            expect(ctrl.qp.queryText).toEqual("193.0.0.0");
            expect(ctrl.qp.showFullObjectDetails).toEqual(true);
            expect(ctrl.qp.reverseDomain).toEqual(false);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(ctrl.qp.types).toEqual({});
            expect(ctrl.qp.inverse).toEqual({});
            expect(ctrl.qp.source).toEqual("GRS");
            expect(ctrl.whoisCliQuery().trim()).toEqual("-Br --resource 193.0.0.0");

            ctrl.doSearch();
            expect(ctrl.results.length).toEqual(4);
        });

        it('should handle empty flags', function () {
            sp.types = '';
            sp.inverse = undefined;
            sp.hierarchyFlag = undefined;
            sp.bflag = '';
            sp.rflag = '';
            sp.dflag = '';
            sp.source = 'GRS';

            var calledApply = 0;
            var scope = {
                $apply: function () {
                    calledApply++;
                }
            };
            var ctrl = $componentController('query', {
                $scope: scope,
                $stateParams: sp,
                QueryService: queryService
            });
            expect(ctrl.numResultsToShow).toEqual(20);
            expect(ctrl.qp.queryText).toEqual("193.0.0.0");
            expect(ctrl.qp.showFullObjectDetails).toEqual(false);
            expect(ctrl.qp.reverseDomain).toEqual(false);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(ctrl.qp.types).toEqual({});
            expect(ctrl.qp.inverse).toEqual({});
            expect(ctrl.qp.source).toEqual("GRS");
            expect(ctrl.whoisCliQuery().trim()).toEqual("--resource 193.0.0.0");

            ctrl.doSearch();
            expect(ctrl.results.length).toEqual(4);
            ctrl.lastResultOnScreen();
            expect(ctrl.numResultsToShow).toEqual(20);
            expect(calledApply).toEqual(1);
        });

    });

    describe('during scrolling', function () {

        var sp;
        var queryService;

        beforeEach(function () {
            sp = {
                searchtext: " 193.0.0.0 ",
                types: "inetnum;inet6num",
                inverse: "",
                hierarchyFlag: "exact",
                rflag: "false",
                dflag: "true",
                bflag: "",
                source: "TEST"
            };

            queryService = {
                searchWhoisObjects: function () {
                    return {
                        then: function (successFunc) {
                            successFunc({
                                data: mockResponse.wakefield
                            });
                        }
                    };
                },
                buildQueryStringForLink: function () {
                    return "";
                },
                buildPermalink: function () {
                    return "";
                }
            };
        });

        it('should react to scroll events', function () {
            var stateGo;
            var calledApply = 0;
            var scope = {
                $apply: function () {
                    calledApply++;
                }
            };
            var state = {
                go: function (args) {
                    stateGo = args;
                }
            };

            var ctrl = $componentController('query', {
                $location: $location,
                $scope: scope,
                $state: state,
                $stateParams: sp,
                QueryService: queryService
            });
            ctrl.numResultsToShow = 2;
            ctrl.submitSearchForm();
            expect(ctrl.$stateParams.hierarchyFlag).toEqual("exact");
            ctrl.doSearch();
            expect(ctrl.results.length).toEqual(21);
            ctrl.lastResultOnScreen();
            expect(ctrl.numResultsToShow).toEqual(22);
            expect(calledApply).toEqual(2);

            ctrl.updateClicked(mockResponse.wakefield.objects.object[0]);
            expect(stateGo).toEqual("webupdates.modify");
        });
    });

    describe('with a failed query', function () {

        var sp = {
            searchtext: " 193.0.0.0 ",
            types: "inetnum;inet6num",
            inverse: "mntner",
            hierarchyFlag: "one-less",
            rflag: "false",
            dflag: "true",
            bflag: "",
            source: "TEST"
        };

        var errorResponse = {
            data: {
                errormessages: {
                    errormessage: [
                        {
                            severity: "Error",
                            text: "%s,\nand thanks for all the %s",
                            args: [
                                {value: "Goodbye"},
                                {value: "fish"}
                            ]
                        },
                        {
                            severity: "Error",
                            text: "So %s, %s Road",
                            args: [
                                {value: "Goodbye"},
                                {value: "Yellow Brick"}
                            ]
                        },
                        {
                            severity: "Error",
                            text: "%s%s",
                            args: [
                                {value: "Goodbye"},
                                {value: ", cruel world!"}
                            ]
                        },
                        {
                            severity: "Error",
                            text: "Broken message",
                            args: [
                                {value: "Goodbye"}
                            ]
                        }
                    ]
                }
            }
        };

        var queryService = {
            searchWhoisObjects: function () {
                return {
                    then: function (successFunc, errorFunc) {
                        errorFunc(errorResponse);
                    }
                };
            },
            buildQueryStringForLink: function () {
                return "?buildQueryStringForLink=true"
            },
            buildPermalink: function () {
                return "http://localhost/PERMA-LINK"
            }
        };

        it('should show error messages', function () {
            var ctrl = $componentController('query', {
                $stateParams: sp,
                QueryService: queryService
            });
            expect(ctrl.numResultsToShow).toEqual(20);
            expect(ctrl.qp.queryText).toEqual("193.0.0.0");
            expect(ctrl.qp.showFullObjectDetails).toEqual(false);
            expect(ctrl.qp.reverseDomain).toEqual(true);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(ctrl.qp.types).toEqual({INETNUM: true, INET6NUM: true});
            expect(ctrl.qp.inverse).toEqual({MNTNER: true});
            expect(ctrl.qp.source).toEqual("TEST");
            expect(ctrl.whoisCliQuery()).toEqual("-i mntner -T inetnum,inet6num -ld 193.0.0.0");

            //ctrl.doSearch();
            expect(ctrl.errorMessages.length).toEqual(4);
            expect(ctrl.formatError(ctrl.errorMessages[0])).toEqual("Goodbye,<br>and thanks for all the fish");
            expect(ctrl.formatError(ctrl.errorMessages[1])).toEqual("So Goodbye, Yellow Brick Road");
            expect(ctrl.formatError(ctrl.errorMessages[2])).toEqual("Goodbye, cruel world!");
            expect(ctrl.formatError(ctrl.errorMessages[3])).toEqual("Broken message");
        });
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
