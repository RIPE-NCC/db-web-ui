'use strict';

describe('webUpdates: CreateController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var createController;
    var MessageStore;
    var WhoisResources;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function ( $injector) {
            var $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();

            $httpBackend = $injector.get('$httpBackend');

            MessageStore = $injector.get('MessageStore');
            WhoisResources = $injector.get('WhoisResources');

            $state = $injector.get('$state');
            $stateParams = $injector.get('$stateParams');
            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;

            var $controller = $injector.get('$controller');
            createController = function() {
                return $controller('CreateController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams
                });
            };

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.whenGET('api/user/maintainers').respond(function(method,url) {
                    var whoisRsources = {
                        objects: {
                            object: [
                                {'primary-key': {attribute: [{name: 'mntner', value: 'TEST-MNT'}]}},
                                {'primary-key': {attribute: [{name: 'mntner', value: 'TESTSSO-MNT'}]}}
                            ]
                        }
                    };
                    return [200, whoisRsources, {}];
            });

        });

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get objectType from url', function () {
        createController();
        $httpBackend.flush();

        expect($scope.objectType).toBe(OBJECT_TYPE);
    });

    it('should get source from url', function () {
        createController();
        $httpBackend.flush();

        expect($scope.source).toBe(SOURCE);
    });

    it('should populate the ui based on object-tyoem meta model and source', function () {
        createController();
        $httpBackend.flush();

        var stateBefore = $state.current.name;

        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toBeUndefined();
        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBeUndefined();

        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].$$error).toBeUndefined();
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');

        expect($scope.attributes.getAllAttributesOnName('mnt-by')[1].$$error).toBeUndefined();
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[1].value).toEqual('TESTSSO-MNT');

        expect($scope.attributes.getAllAttributesOnName('mnt-by')[1].$$error).toBeUndefined();
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });


    it('should display field specific errors upon submit click on form with missing values', function () {
        createController();
        $httpBackend.flush();

        var stateBefore = $state.current.name;

        $scope.submit();
        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('Mandatory attribute not set');
        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBeUndefined();

        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].$$error).toBeUndefined();
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');

        expect($scope.attributes.getAllAttributesOnName('mnt-by')[1].$$error).toBeUndefined();
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[1].value).toEqual('TESTSSO-MNT');

        expect($scope.attributes.getAllAttributesOnName('mnt-by')[1].$$error).toBeUndefined();
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should handle success post upon submit click when form is complete', function () {
        createController();
        $httpBackend.flush();

        // api/whois/RIPE/as-block
        $httpBackend.whenPOST('api/whois/RIPE/as-block').respond(function(method,url) {
            var resp = {
                objects: {
                    object: [
                        {
                            'primary-key': {attribute: [{name: 'as-block', value: 'MY-AS-BLOCK'}]},
                             attributes: {
                                attribute: [
                                    {name: 'as-block', value: 'MY-AS-BLOCK'},
                                    {name: 'mnt-by', value: 'TEST-MNT'},
                                    {name: 'source', value: 'RIPE'}
                                ]
                            }
                        }
                    ]
                }
            };
            return [200, resp, {}];
        });
        $scope.attributes.setSingleAttributeOnName('as-block', "A");

        $scope.submit();
        $httpBackend.flush();

        var resp = MessageStore.get('MY-AS-BLOCK');
        expect(resp.getObjectUid()).toEqual('MY-AS-BLOCK');
        var attrs = WhoisResources.wrapAttributes(resp.getAttributes());
        expect(attrs.getSingleAttributeOnName('as-block').value).toEqual('MY-AS-BLOCK');
        expect(attrs.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');
        expect(attrs.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe('display');
        expect($stateParams.objectType).toBe('as-block');
        expect($stateParams.name).toBe('MY-AS-BLOCK');


    });


    it('should handle error post upon submit click when form is complete', function () {
        createController();
        $httpBackend.flush();

        var stateBefore = $state.current.name;

        // api/whois/RIPE/as-block
        $httpBackend.whenPOST('api/whois/RIPE/as-block').respond(function(method,url) {
            var resp = {
                errormessages: {
                    errormessage: [
                        {
                            severity: 'Error',
                            text: 'Unrecognized source: %s',
                            'args': [{value: 'INVALID_SOURCE'}]
                        },
                        {
                            severity: 'Warning',
                            text: 'Not authenticated'
                        }, {
                            severity: 'Error',
                            attribute: {
                                name: 'as-block',
                                value: 'INVALID'
                            },
                            text: '\'%s\' is not valid for this object type',
                            args: [{value: 'XYZ'}]
                        }
                    ]
                }
            };
            return [400, resp, {}];
        });
        $scope.attributes.setSingleAttributeOnName('as-block', "A");

        $scope.submit();
        $httpBackend.flush();

        expect($scope.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($scope.warnings[0].plainText).toEqual('Not authenticated');
        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('\'XYZ\' is not valid for this object type');

        expect($state.current.name).toBe(stateBefore);

    });

});

