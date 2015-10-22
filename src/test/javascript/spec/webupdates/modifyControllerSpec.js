'use strict';

describe('webUpdates: ModifyController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var NAME = 'MY-AS-BLOCK';

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

            $httpBackend.whenGET('api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true').respond(
                function(method,url) {
                    return [200,
                        {
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

                        } , {}];
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

    it('should get objectType from url', function () {
        expect($scope.objectType).toBe(OBJECT_TYPE);
    });

    it('should get source from url', function () {
        expect($scope.source).toBe(SOURCE);
    });

    it('should get name from url', function () {
        expect($scope.name).toBe(NAME);
    });

    it('should populate mntner data', function () {
        expect($scope.maintainers.sso.length).toBe(2);
        expect($scope.maintainers.objectOriginal.length).toBe(1);
        expect($scope.maintainers.object.length).toBe(1);

        expect($scope.maintainers.sso[0].key).toEqual('TEST-MNT');
        expect($scope.maintainers.sso[0].type).toEqual('mntner');
        expect($scope.maintainers.object[0].auth).toEqual(['MD5-PW','SSO']);
        expect($scope.maintainers.object[0].mine).toEqual(true);

        expect($scope.maintainers.objectOriginal[0].key).toEqual('TEST-MNT');

        expect($scope.maintainers.object[0].key).toEqual('TEST-MNT');
        expect($scope.maintainers.object[0].type).toEqual('mntner');
        expect($scope.maintainers.object[0].mine).toEqual(true);
        expect($scope.maintainers.object[0].isNew).toEqual(false);
        expect($scope.maintainers.object[0].auth).toEqual(['MD5-PW','SSO']);

    });

    it('should populate the ui based on object-tyoem meta model and source', function () {
        var stateBefore = $state.current.name;

        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toBeUndefined();
        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toEqual(NAME);

        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].$$error).toBeUndefined();
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');

        expect($scope.attributes.getAllAttributesOnName('source')[0].$$error).toBeUndefined();
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });


    it('should display field specific errors upon submit click on form with missing values', function () {
        var stateBefore = $state.current.name;

        $scope.attributes.setSingleAttributeOnName('as-block', null);

        $scope.submit();
        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('Mandatory attribute not set');
        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBeNull();

        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].$$error).toBeUndefined();
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');

        expect($scope.attributes.getSingleAttributeOnName('source').$$error).toBeUndefined();
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should handle success put upon submit click when form is complete', function () {

        $httpBackend.expectPUT('api/whois/RIPE/as-block/MY-AS-BLOCK').respond({
            objects: {
                object: [
                    {
                        'primary-key': {attribute: [{name: 'as-block', value: 'MY-AS-BLOCK'}]},
                        attributes: {
                            attribute: [
                                {name: 'as-block', value: 'MY-AS-BLOCK'},
                                {name: 'mnt-by', value: 'TEST-MNT'},
                                {name: 'changed', value: 'test@ripe.net'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            }
        });

        $scope.attributes.setSingleAttributeOnName('changed', "dummy@ripe.net");

        $scope.submit();
        $httpBackend.flush();

        var resp = MessageStore.get('MY-AS-BLOCK');
        expect(resp.getPrimaryKey()).toEqual('MY-AS-BLOCK');
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
        $httpBackend.expectPUT('api/whois/RIPE/as-block/MY-AS-BLOCK').respond(400, {
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

        $scope.attributes.setSingleAttributeOnName('as-block', "A");

        $scope.submit();
        $httpBackend.flush();

        expect($scope.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($scope.warnings[0].plainText).toEqual('Not authenticated');
        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('\'MY-AS-BLOCK\' is not valid for this object type');

        expect($state.current.name).toBe(stateBefore);

    });

    it('duplicate attribute', function() {
        expect($scope.attributes.length).toEqual(3);

        $scope.duplicateAttribute($scope.attributes[1]);

        expect($scope.attributes.length).toEqual(4);
        expect($scope.attributes[2].name).toEqual($scope.attributes[1].name);
        expect($scope.attributes[2].value).toBeUndefined();
    });

    it('remove attribute', function() {
        expect($scope.attributes.length).toEqual(3);

        $scope.removeAttribute($scope.attributes[1]);

        expect($scope.attributes.length).toEqual(2);
        expect($scope.attributes[1].name).toEqual('source');
        expect($scope.attributes[1].value).toEqual('RIPE');

    });

});


describe('webUpdates: ModifyController init with failures', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var NAME = 'MY-AS-BLOCK';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
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

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should report error when fetching sso maintainers fails', function () {

        failToGetSsoMaintainers();
        getObject();

        $httpBackend.flush();

        expect($scope.hasErrors()).toBe(true);
        expect($scope.errors[0].plainText).toEqual('Error fetching maintainers associated with this SSO account');
    });

    it('should report error when fetching object fails', function () {

        getSsoMaintainers();
        getObjectWithError();

        $httpBackend.flush();

        expect($scope.hasWarnings()).toBe(true);
        expect($scope.warnings[0].plainText).toEqual('Not authenticated');
    });

    it('should report error when fetching maintainer details fails', function () {

        getSsoMaintainers();
        getObject();

        failToGetMaintainerDetails();

        $httpBackend.flush();

        expect($scope.hasErrors()).toBe(true);
        expect($scope.errors[0].plainText).toEqual('Error fetching maintainer details');

    });

    it('should report unmodifiable object error', function () {

        getSsoMaintainers();
        getObject();

        getPgpMaintainerDetails();

        $httpBackend.flush();

        expect($scope.hasErrors()).toBe(true);
        expect($scope.errors[0].plainText).toEqual('You cannot modify this object through web updates because your SSO account is not associated with any of the maintainers on this object, and none of the maintainers have password');

    });


    function getSsoMaintainers() {
        $httpBackend.whenGET('api/user/mntners').respond([
            {key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true},
            {key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW'], mine: true}
        ]);
    }


    function failToGetSsoMaintainers() {
        $httpBackend.whenGET('api/user/mntners').respond(404);
    }


    function getObject() {
        $httpBackend.whenGET('api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true').respond(
            function (method, url) {
                return [200,
                    {
                        objects: {
                            object: [
                                {
                                    'primary-key': {attribute: [{name: 'as-block', value: 'MY-AS-BLOCK'}]},
                                    attributes: {
                                        attribute: [
                                            {name: 'as-block', value: 'MY-AS-BLOCK'},
                                            {name: 'mnt-by', value: 'TEST3-MNT'},
                                            {name: 'source', value: 'RIPE'}
                                        ]
                                    }
                                }
                            ]
                        }

                    }, {}];
            });
    }

    function getObjectWithError() {

        $httpBackend.whenGET('api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true').respond(
            function (method, url) {
                return [404,
                    {
                        errormessages: {
                            errormessage: [
                                {
                                    severity: 'Warning',
                                    text: 'Not authenticated'
                                }
                            ]
                        }
                    }, {}];
            });

    }

    function getPgpMaintainerDetails() {
        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST3-MNT').respond(
            function (method, url) {
                return [200, [{key: 'TEST3-MNT', type: 'mntner', auth: ['PGP']}], {}];
            });

    }

    function failToGetMaintainerDetails() {
        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST3-MNT').respond(404);
    }

});

describe('webUpdates: ModifyController ask for password before modify object with non-sso maintainer with password', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var ModalService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var NAME = 'MY-AS-BLOCK';
    var $q;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _ModalService_, _$q_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            MntnerService = _MntnerService_;
            ModalService = _ModalService_;
            $q = _$q_;

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            $httpBackend.whenGET('api/user/mntners').respond([
                {key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true}
            ]);


            $httpBackend.whenGET('api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true').respond(
                function (method, url) {
                    return [200,
                        {
                            objects: {
                                object: [
                                    {
                                        'primary-key': {attribute: [{name: 'as-block', value: 'MY-AS-BLOCK'}]},
                                        attributes: {
                                            attribute: [
                                                {name: 'as-block', value: 'MY-AS-BLOCK'},
                                                {name: 'mnt-by', value: 'TEST3-MNT'},
                                                {name: 'source', value: 'RIPE'}
                                            ]
                                        }
                                    }
                                ]
                            }

                        }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST3-MNT').respond(
                function (method, url) {
                    return [200, [{key: 'TEST3-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
                });

            _$controller_('CreateController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should ask for password before modify object with non-sso maintainer with password.', function() {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        $httpBackend.flush();

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();

    });

});

describe('webUpdates: ModifyController should be able to handle escape objected with slash', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var ModalService;
    var SOURCE = 'RIPE';
    var OBJECT_TYPE = 'route';
    var NAME = '12.235.32.0%2f19AS1680';
    var $q;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _$q_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            MntnerService = _MntnerService_;
            $q = _$q_;

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            $httpBackend.whenGET('api/user/mntners').respond([
                {key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true}
            ]);

            $httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true').respond(
                function (method, url) {
                    return [200,
                        {
                            objects: {
                                object: [
                                    {
                                        'primary-key': {attribute: [{name: 'route', value: '12.235.32.0/19AS1680'}]},
                                        attributes: {
                                            attribute: [
                                                {name: 'route', value: '12.235.32.0/19AS1680'},
                                                {name: 'mnt-by', value: 'TEST-MNT'},
                                                {name: 'source', value: 'RIPE'}
                                            ]
                                        }
                                    }
                                ]
                            }

                        }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                function (method, url) {
                    return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
                });

            _$controller_('CreateController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('Call rest backend with slash-escaped url', function() {
        $httpBackend.flush();
    });

});