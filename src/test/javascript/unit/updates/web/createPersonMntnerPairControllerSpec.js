'use strict';

describe('webUpdates: CreatePersonMntnerPairController', function () {

    var $scope, $rootScope, $state, $stateParams, $httpBackend, $log;
    var MessageStore;
    var WhoisResources;
    var AlertService;
    var RestService;
    var UserInfoService;

    var SOURCE = 'TEST';
    var PERSON_NAME = 'Titus Tester';
    var PERSON_UID = 'tt-ripe';
    var MNTNER_NAME = 'aardvark-mnt';
    var SSO_EMAIL = 'tester@ripe.net';
    var personMntnerPair;
    var userInfoData;
    var createController;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$log_, _$state_, _$stateParams_, _$httpBackend_, _UserInfoService_, _MessageStore_, _WhoisResources_, _AlertService_,_RestService_) {

            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $log = _$log_;
            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            RestService = _RestService_;
            UserInfoService = _UserInfoService_;

            personMntnerPair = WhoisResources.wrapWhoisResources({
               objects: {
                   object: [
                       {
                           'primary-key': {attribute: [{name: 'person', value: PERSON_UID}]},
                           attributes: {
                               attribute: [
                                   {name: 'person', value: PERSON_NAME},
                                   {name: 'mnt-by', value: MNTNER_NAME},
                                   {name: 'nic-hdl', value: PERSON_UID},
                                   {name: 'source', value: SOURCE}
                               ]
                           }
                       },
                        {
                            'primary-key': {attribute: [{name: 'mntner', value: MNTNER_NAME}]},
                            attributes: {
                                attribute: [
                                    {name: 'mntner', value: MNTNER_NAME},
                                    {name: 'admin-c', value: PERSON_UID},
                                    {name: 'mnt-by', value: MNTNER_NAME},
                                    {name: 'source', value: SOURCE}
                                ]
                            }
                        }
                    ]
                }
            });

            userInfoData = {
                "username":SSO_EMAIL,
                "displayName":"Tester X",
                "expiryDate":[2015,8,27,18,2,35,606],
                "uuid":"93efb5ac-81f7-40b1-aac7-f2ff497b00e7",
                "active":true
            };

            UserInfoService.clear();

            createController = function() {

                $stateParams.source = SOURCE;

                _$controller_('CreatePersonMntnerPairController', {
                    $scope: $scope, $state: $state, $log:$log, $stateParams: $stateParams,
                    WhoisResources:WhoisResources, AlertService:AlertService, UserInfoService:UserInfoService,
                    RestService:RestService,MessageStore:MessageStore
                });
            };

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should extract data from url', function () {
        createController();

        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [200, userInfoData, {}];
        });
        $httpBackend.flush();

        expect($scope.source).toBe(SOURCE);
    });

    it('should be able to handle failing user-info-service', function () {
        var stateBefore = $state.current.name;

        createController();

        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [403, whoisObjectWithErrors, {}];
        });
        $httpBackend.flush();

        $scope.submit();

        expect($scope.errors[0].plainText).toEqual('Error fetching SSO information');

        expect($state.current.name).toBe(stateBefore);

    });


    it('should validate before submitting', function () {
        var stateBefore = $state.current.name;

        createController();

        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [200, userInfoData, {}];
        });
        $httpBackend.flush();

        $scope.submit();

        expect($scope.personAttributes.getSingleAttributeOnName('person').$$error).toEqual('Mandatory attribute not set');
        expect($scope.personAttributes.getSingleAttributeOnName('address').$$error).toEqual('Mandatory attribute not set');
        expect($scope.personAttributes.getSingleAttributeOnName('phone').$$error).toEqual('Mandatory attribute not set');
        expect($scope.mntnerAttributes.getSingleAttributeOnName('mntner').$$error).toEqual('Mandatory attribute not set');

        expect($state.current.name).toBe(stateBefore);
        expect($stateParams.source).toBe(SOURCE);
    });

    it('should pre-populate and submit ok', function () {
        var stateBefore = $state.current.name;

        createController();

        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [200, userInfoData, {}];
        });
        $httpBackend.flush();

        $scope.personAttributes.setSingleAttributeOnName('person', PERSON_NAME);
        $scope.personAttributes.setSingleAttributeOnName('phone', '+316');
        $scope.personAttributes.setSingleAttributeOnName('address', 'home');
        $scope.mntnerAttributes.setSingleAttributeOnName('mntner', MNTNER_NAME);

        $scope.submit();

        expect($scope.personAttributes.getSingleAttributeOnName('person').value).toBe(PERSON_NAME);
        expect($scope.personAttributes.getSingleAttributeOnName('phone').value).toBe('+316');
        expect($scope.personAttributes.getSingleAttributeOnName('address').value).toBe('home');
        expect($scope.personAttributes.getSingleAttributeOnName('nic-hdl').value).toEqual('AUTO-1');
        expect($scope.personAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(MNTNER_NAME);
        expect($scope.personAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($scope.mntnerAttributes.getSingleAttributeOnName('mntner').value).toEqual(MNTNER_NAME);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('admin-c').value).toEqual('AUTO-1');
        expect($scope.mntnerAttributes.getSingleAttributeOnName('auth').value).toEqual('SSO '+ SSO_EMAIL);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('upd-to').value).toEqual(SSO_EMAIL);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(MNTNER_NAME);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        $httpBackend.expectPOST('api/references/TEST').respond(function(method,url) {
            return [200, personMntnerPair, {}];
        });
        $httpBackend.flush();

        var cachedPerson = WhoisResources.wrapWhoisResources(MessageStore.get(PERSON_UID));
        var personAttrs = WhoisResources.wrapAttributes(cachedPerson.getAttributes());
        expect(personAttrs.getSingleAttributeOnName('person').value).toEqual(PERSON_NAME);
        expect(personAttrs.getSingleAttributeOnName('nic-hdl').value).toEqual(PERSON_UID);

        var cachedMntner =  WhoisResources.wrapWhoisResources(MessageStore.get(MNTNER_NAME));
        var mntnerAttrs = WhoisResources.wrapAttributes(cachedMntner.getAttributes());
        expect(mntnerAttrs.getSingleAttributeOnName('mntner').value).toEqual(MNTNER_NAME);

        expect($state.current.name).toBe('webupdates.displayPersonMntnerPair');
        expect($stateParams.person).toBe(PERSON_UID);
        expect($stateParams.mntner).toBe(MNTNER_NAME);

    });

    it('should handle submit failure', function () {
        var stateBefore = $state.current.name;

        createController();

        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [200, userInfoData, {}];
        });
        $httpBackend.flush();

        $scope.personAttributes.setSingleAttributeOnName('person', 'Titus Tester');
        $scope.personAttributes.setSingleAttributeOnName('phone', '+316');
        $scope.personAttributes.setSingleAttributeOnName('address', 'home');
        $scope.mntnerAttributes.setSingleAttributeOnName('mntner', MNTNER_NAME);

        $scope.submit();

        expect($scope.personAttributes.getSingleAttributeOnName('person').value).toBe(PERSON_NAME);
        expect($scope.personAttributes.getSingleAttributeOnName('nic-hdl').value).toEqual('AUTO-1');
        expect($scope.personAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(MNTNER_NAME);
        expect($scope.personAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($scope.mntnerAttributes.getSingleAttributeOnName('mntner').value).toEqual(MNTNER_NAME);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('auth').value).toEqual('SSO '+ SSO_EMAIL);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('admin-c').value).toEqual('AUTO-1');
        expect($scope.mntnerAttributes.getSingleAttributeOnName('upd-to').value).toEqual(SSO_EMAIL);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(MNTNER_NAME);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        $httpBackend.expectPOST('api/references/TEST').respond(function(method,url) {
            return [400, whoisObjectWithErrors, {}];
        });
        $httpBackend.flush();

        expect($scope.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($scope.warnings[0].plainText).toEqual('Not authenticated');
        expect($scope.mntnerAttributes.getSingleAttributeOnName('mntner').$$error).toEqual("\'" + MNTNER_NAME + "\' is not valid for this object type");

        expect($state.current.name).toBe(stateBefore);

    });

    var whoisObjectWithErrors = {
        objects: {
            object: [
                {
                    attributes: {
                        attribute: [
                            {name: 'person', value: PERSON_NAME},
                            {name: 'mnt-by', value: MNTNER_NAME},
                            {name: 'source', value: SOURCE}
                        ]
                    }
                },
                {
                    attributes: {
                        attribute: [
                            {name: 'mntner', value: MNTNER_NAME},
                            {name: 'admin-c', value: PERSON_UID},
                            {name: 'mnt-by', value: MNTNER_NAME},
                            {name: 'source', value: SOURCE}
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
                        name: 'mntner',
                        value: MNTNER_NAME
                    },
                    text: '\'%s\' is not valid for this object type',
                    args: [{value: MNTNER_NAME}]
                }
            ]
        }
    };



});
