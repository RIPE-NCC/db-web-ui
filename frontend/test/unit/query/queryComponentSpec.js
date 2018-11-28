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
            expect(ctrl.offset).toEqual(0);
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
        var calledApply = 0;
        var successResponse = {
            data: {
                objects: {
                    object: [{}, {}, {}, {}]
                }
            }
        };

        var queryService = {
            searchWhoisObjects: function () {
                calledApply++;
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
            expect(ctrl.offset).toEqual(0);
            expect(ctrl.qp.queryText).toEqual("193.0.0.0");
            expect(ctrl.qp.showFullObjectDetails).toEqual(false);
            expect(ctrl.qp.reverseDomain).toEqual(true);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(ctrl.qp.types).toEqual({INETNUM: true, INET6NUM: true});
            expect(ctrl.qp.inverse).toEqual({});
            expect(ctrl.qp.source).toEqual("TEST");
            expect(ctrl.whoisCliQuery()).toEqual("-T inetnum,inet6num -xd 193.0.0.0");
            // ctrl.doSearch();
            expect(ctrl.results.length).toEqual(4);
        });

        it('should handle an empty search string', function () {
            sp.searchtext = '';
            sp.dflag = "";
            var ctrl = $componentController('query', {
                $stateParams: sp,
                QueryService: queryService
            });
            expect(ctrl.offset).toEqual(0);
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
            expect(ctrl.offset).toEqual(0);
            expect(ctrl.qp.queryText).toEqual("193.0.0.0");
            expect(ctrl.qp.showFullObjectDetails).toEqual(true);
            expect(ctrl.qp.reverseDomain).toEqual(false);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(true);
            expect(ctrl.qp.types).toEqual({});
            expect(ctrl.qp.inverse).toEqual({});
            expect(ctrl.qp.source).toEqual("GRS");
            expect(ctrl.whoisCliQuery().trim()).toEqual("-Br --resource 193.0.0.0");

            // ctrl.doSearch();
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

            calledApply = 0;

            var ctrl = $componentController('query', {
                $stateParams: sp,
                QueryService: queryService
            });
            expect(ctrl.offset).toEqual(0);
            expect(ctrl.qp.queryText).toEqual("193.0.0.0");
            expect(ctrl.qp.showFullObjectDetails).toEqual(false);
            expect(ctrl.qp.reverseDomain).toEqual(false);
            expect(ctrl.qp.doNotRetrieveRelatedObjects).toEqual(false);
            expect(ctrl.qp.types).toEqual({});
            expect(ctrl.qp.inverse).toEqual({});
            expect(ctrl.qp.source).toEqual("GRS");
            expect(ctrl.whoisCliQuery().trim()).toEqual("--resource 193.0.0.0");

            expect(ctrl.results.length).toEqual(4);
            ctrl.lastResultOnScreen();
            expect(ctrl.offset).toEqual(0);
            expect(calledApply).toEqual(1);
        });

    });

    describe('during scrolling', function () {

        var sp;
        var queryService;
        var calledApply = 0;

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
                    calledApply++;
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
            calledApply = 0;
            var state = {
                go: function (args) {
                    stateGo = args;
                }
            };

            var ctrl = $componentController('query', {
                $location: $location,
                $state: state,
                $stateParams: sp,
                QueryService: queryService
            });
            ctrl.offset = 0;
            expect(ctrl.$stateParams.hierarchyFlag).toEqual("exact");
            expect(ctrl.results.length).toEqual(20);
            ctrl.lastResultOnScreen();
            expect(ctrl.offset).toEqual(20);
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
            expect(ctrl.offset).toEqual(0);
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
