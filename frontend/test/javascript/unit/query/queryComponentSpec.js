/*global beforeEach,describe,inject,it*/
'use strict';

describe('The QueryComponent', function () {

    var $componentController;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_) {
        $componentController = _$componentController_;
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

    describe('with a valid query string', function () {

        var sp = {
            searchtext: " 193.0.0.0 ",
            types: "inetnum;inet6num",
            inverse: "",
            hierarchyFlag: "exact",
            rflag: "false",
            dflag: "true",
            bflag: "",
            source: "TEST"
        };

        var successResponse = {
            data: {
                objects: {
                    object: [{}, {}, {}, {}]
                }
            }
        };

        var queryService = {
            searchWhoisObjects: function (qp) {
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

        it('should parse the right options into the form', function () {
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
            expect(ctrl.whoisCliQuery()).toEqual("193.0.0.0 -t inetnum,inet6num -xd");

            ctrl.doSearch();
            expect(ctrl.results.length).toEqual(4);
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
                            args: [{value: "Goodbye"}, {value: "fish"}]
                        },
                        {
                            severity: "Error",
                            text: "So %s, %s Road",
                            args: [{value: "Goodbye"}, {value: "Yellow Brick"}]
                        },
                        {severity: "Error", text: "%s%s", args: [{value: "Goodbye"}, {value: ", cruel world!"}]}
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
            expect(ctrl.whoisCliQuery()).toEqual("193.0.0.0 -i mntner -t inetnum,inet6num -ld");

            //ctrl.doSearch();
            expect(ctrl.errorMessages.length).toEqual(3);
            expect(ctrl.formatError(ctrl.errorMessages[0])).toEqual("Goodbye,<br>and thanks for all the fish");
            expect(ctrl.formatError(ctrl.errorMessages[1])).toEqual("So Goodbye, Yellow Brick Road");
            expect(ctrl.formatError(ctrl.errorMessages[2])).toEqual("Goodbye, cruel world!");
        });

    });
});
