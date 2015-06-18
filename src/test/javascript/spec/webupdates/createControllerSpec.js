'use strict';

describe('webUpdates: CreateController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var userMaintainers;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;

            userMaintainers = [{ key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}];

            $httpBackend.whenGET('api/user/mntners').respond(userMaintainers);

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            _$controller_('CreateController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams
            });



            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get objectType from url', function () {
        expect($scope.objectType).toBe(OBJECT_TYPE);
    });

    it('should get source from url', function () {
        expect($scope.source).toBe(SOURCE);
    });

    it('should populate the ui based on object-tyoem meta model and source', function () {
        var stateBefore = $state.current.name;

        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toBeUndefined();
        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBeUndefined();

        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });


    it('should display field specific errors upon submit click on form with missing values', function () {
        var stateBefore = $state.current.name;

        $scope.submit();
        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('Mandatory attribute not set');
        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBeUndefined();

        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should handle success post upon submit click when form is complete', function () {

        // api/whois/RIPE/as-block
        $httpBackend.expectPOST('api/whois/RIPE/as-block').respond({
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
        });

        $scope.attributes.setSingleAttributeOnName('as-block', 'A');

        $scope.submit();
        $httpBackend.flush();

        var resp = MessageStore.get('MY-AS-BLOCK');
        expect(resp.getObjectUid()).toEqual('MY-AS-BLOCK');
        var attrs = WhoisResources.wrapAttributes(resp.getAttributes());
        expect(attrs.getSingleAttributeOnName('as-block').value).toEqual('MY-AS-BLOCK');
        expect(attrs.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');
        expect(attrs.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe('display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('as-block');
        expect($stateParams.name).toBe('MY-AS-BLOCK');
    });


    it('should handle error post upon submit click when form is complete', function () {
        var stateBefore = $state.current.name;

        // api/whois/RIPE/as-block
        $httpBackend.expectPOST('api/whois/RIPE/as-block').respond(400, {
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
            },
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
                            value: 'MY-AS-BLOCK'
                        },
                        text: '\'%s\' is not valid for this object type',
                        args: [{value: 'MY-AS-BLOCK'}]
                    }
                ]
            }
        });

        $scope.attributes.setSingleAttributeOnName('as-block', 'A');

        $scope.submit();
        $httpBackend.flush();

        expect($scope.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($scope.warnings[0].plainText).toEqual('Not authenticated');
        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('\'MY-AS-BLOCK\' is not valid for this object type');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should duplicate attribute', function() {
        expect($scope.attributes.length).toEqual(3);

        $scope.duplicateAttribute($scope.attributes[1]);

        expect($scope.attributes.length).toEqual(4);
        expect($scope.attributes[2].name).toEqual($scope.attributes[1].name);
        expect($scope.attributes[2].value).toBeUndefined();
    });

    it('should remove attribute', function() {
        expect($scope.attributes.length).toEqual(3);

        $scope.removeAttribute($scope.attributes[1]);

        expect($scope.attributes.length).toEqual(2);
        expect($scope.attributes[1].name).toEqual('source');
        expect($scope.attributes[1].value).toEqual('RIPE');
    });


    it('should fetch maintainers already associated to the user in the session', function() {
        expect($scope.userMaintainers[0].key).toEqual(userMaintainers[0].key);
        expect($scope.userMaintainers[0].type).toEqual(userMaintainers[0].type);
        expect($scope.userMaintainers[0].auth).toEqual(userMaintainers[0].auth);
    });

    it('should add the selected maintainers to the object before post it.', function() {

        $httpBackend.expectPOST('api/whois/RIPE/as-block', {
            objects: {
                object: [
                    {
                        attributes: {
                            attribute: [
                                {name: 'as-block', value: 'MY-AS-BLOCK'},
                                {name: 'source', value: 'RIPE'},
                                {name: 'mnt-by', value: 'TEST-MNT-0'},
                                {name: 'mnt-by', value: 'TEST-MNT-1'}
                            ]
                        }
                    }
                ]
            }
        }).respond(500);

        $scope.attributes.setSingleAttributeOnName('as-block', 'MY-AS-BLOCK');
        $scope.selectedMaintainers = ['TEST-MNT-0', 'TEST-MNT-1'];

        $scope.submit();
        $httpBackend.flush();

    });

});

