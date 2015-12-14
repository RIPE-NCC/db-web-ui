'use strict';

describe('webUpdates: ReclaimController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var ModalService;
    var AlertService;
    var $rootScope;
    var $log;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _ModalService_, _WhoisResources_, _AlertService_) {

            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            ModalService = _ModalService_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;

            $log = {
                debug: function(msg) {
                    //console.log('info:'+msg);
                },
                info: function(msg) {
                    //console.log('info:'+msg);
                },
                error: function(msg) {
                    //console.log('error:'+msg);
                }
            };

            $httpBackend.whenGET(/.*.html/).respond(200);
            $httpBackend.flush();
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should just work'), function () {
        expect(true).toBe(true);
    };

});
