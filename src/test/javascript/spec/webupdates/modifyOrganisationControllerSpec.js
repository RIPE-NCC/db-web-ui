'use strict';

describe('webUpdates: ModifyController for organisation', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var OBJECT_TYPE = 'organisation';
    var SOURCE = 'RIPE';
    var NAME = 'ORG-UA300-RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            MntnerService = _MntnerService_;

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            _$controller_('CreateController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.whenGET('api/user/mntners').respond([
                {key:'TEST-MNT', type: 'mntner', auth:['SSO'], mine:true},
                {key:'TESTSSO-MNT', type: 'mntner', auth:['MD5-PW','SSO'], mine:true}
            ]);

            $httpBackend.whenGET('api/whois/RIPE/'+OBJECT_TYPE+'/'+NAME+'?unfiltered=true').respond(
                function(method,url) {
                    return [200,{"objects":{"object":[ {
                        "type" : "organisation",
                        "link" : {
                            "type" : "locator",
                            "href" : "http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-UA300-RIPE"
                        },
                        "source" : {
                            "id" : "ripe"
                        },
                        "primary-key" : {
                            "attribute" : [ {
                                "name" : "organisation",
                                "value" : "ORG-UA300-RIPE"
                            } ]
                        },
                        "attributes" : {
                            "attribute" : [ {
                                "name" : "organisation",
                                "value" : "ORG-UA300-RIPE"
                            }, {
                                "name" : "org-name",
                                "value" : "uhuuu"
                            }, {
                                "name" : "org-type",
                                "value" : "OTHER"
                            }, {
                                "name" : "address",
                                "value" : "Singel 258"
                            }, {
                                "name" : "e-mail",
                                "value" : "tdacruzper@ripe.net"
                            }, {
                                "link" : {
                                    "type" : "locator",
                                    "href" : "http://rest-prepdev.db.ripe.net/ripe/mntner/TEST-MNT"
                                },
                                "name" : "mnt-ref",
                                "value" : "IS-NET-MNT",
                                "referenced-type" : "mntner"
                            }, {
                                "link" : {
                                    "type" : "locator",
                                    "href" : "http://rest-prepdev.db.ripe.net/ripe/mntner/TEST-MNT"
                                },
                                "name" : "mnt-by",
                                "value" : "TEST-MNT",
                                "referenced-type" : "mntner"
                            }, {
                                "name" : "created",
                                "value" : "2015-12-02T14:01:06Z"
                            }, {
                                "name" : "last-modified",
                                "value" : "2015-12-02T14:01:06Z"
                            }, {
                                "name" : "source",
                                "value" : "RIPE"
                            } ]
                        }
                    } ]
                    },
                    "terms-and-conditions" : {
                        "type" : "locator",
                        "href" : "http://www.ripe.net/db/support/db-terms-conditions.pdf"
                    }
                    }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                function(method,url) {
                    return [200, [ {key:'TEST-MNT', type:'mntner', auth:['MD5-PW','SSO']} ], {}];
                });

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should inform if no abuse-c is available', function () {
        expect($scope.containsAbuseC()).toBe(false);
    });

    it('should inform if abuse-c is available', function () {
        $scope.attributes = $scope.attributes.addAttributeAfterType({name: 'abuse-c', value: 'some abuse-c'}, {name: 'e-mail'});
        expect($scope.containsAbuseC()).toBe(true);
    });

    it('should inform if abuse-c is available but with empty value', function () {
        $scope.attributes = $scope.attributes.addAttributeAfterType({name: 'abuse-c'}, {name: 'e-mail'});
        expect($scope.containsAbuseC()).toBe(false);
    });

    it('should inform if abuse-c is available but with empty string', function () {
        $scope.attributes = $scope.attributes.addAttributeAfterType({name: 'abuse-c', value:' '}, {name: 'e-mail'});
        expect($scope.containsAbuseC()).toBe(false);
    });

});


