'use strict';

describe('webUpdates: CreateController', function () {

    var $scope, $state, $stateParams, $httpBackend, $window;
    var MessageStore;
    var WhoisResources;
    var CredentialsService;
    var MntnerService;
    var ModalService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var userMaintainers;
    var $q;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_,_MessageStore_, _WhoisResources_, _CredentialsService_,_MntnerService_, _ModalService_, _$q_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window =_$window_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            CredentialsService = _CredentialsService_;
            MntnerService = _MntnerService_;
            ModalService = _ModalService_;
            $q = _$q_;

            userMaintainers = [
	            {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'}
            ];

            $httpBackend.whenGET('api/user/mntners').respond(userMaintainers);

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            _$controller_('CreateController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams, $window:$window
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

    it('should populate mntner data', function () {
        expect($scope.maintainers.sso.length).toBe(1);
        expect($scope.maintainers.objectOriginal.length).toBe(0);
        expect($scope.maintainers.object.length).toBe(1);

        expect($scope.maintainers.sso[0].key).toEqual('TEST-MNT');
        expect($scope.maintainers.sso[0].type).toEqual('mntner');
        expect($scope.maintainers.sso[0].auth).toEqual(['SSO']);
        expect($scope.maintainers.sso[0].mine).toEqual(true);

        expect($scope.maintainers.object[0].key).toEqual('TEST-MNT');
        expect($scope.maintainers.object[0].type).toEqual('mntner');
        expect($scope.maintainers.object[0].auth).toEqual(['SSO']);
        expect($scope.maintainers.object[0].mine).toEqual(true);

        expect($scope.attributes.length).toBe(4);
        // there is is an attribute with a null value in the set
        expect($scope.attributes[2].name).toEqual('mnt-by');
        expect($scope.attributes[2].value).toEqual('TEST-MNT');

    });

    it('should populate the ui based on object-type meta model and source', function () {
        var stateBefore = $state.current.name;

        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toBeUndefined();
        expect($scope.attributes.getAllAttributesWithValueOnName('mnt-by')[0].value).toEqual('TEST-MNT');
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
        $httpBackend.expectPOST('api/whois/RIPE/as-block').respond(400, whoisObjectWithErrors);

        $scope.attributes.setSingleAttributeOnName('as-block', 'A');

        $scope.submit();
        $httpBackend.flush();

        expect($scope.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($scope.warnings[0].plainText).toEqual('Not authenticated');
        expect($scope.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('\'MY-AS-BLOCK\' is not valid for this object type');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should duplicate attribute', function() {
        var lengthBefore = $scope.attributes.length;

        $scope.duplicateAttribute($scope.attributes[1]);

        expect($scope.attributes.length).toEqual(lengthBefore+1);
        expect($scope.attributes[2].name).toEqual($scope.attributes[1].name);
        expect($scope.attributes[2].value).toBeUndefined();
    });

    it('should remove attribute', function() {
        var lengthBefore = $scope.attributes.length;
        var currentThird = $scope.attributes[2]

        $scope.removeAttribute($scope.attributes[1]);

        expect($scope.attributes.length).toEqual(lengthBefore-1);
        expect($scope.attributes[1].name).toEqual(currentThird.name);
        expect($scope.attributes[1].value).toEqual(currentThird.value);
    });


    it('should fetch maintainers already associated to the user in the session', function() {
        expect($scope.maintainers.sso[0].key).toEqual(userMaintainers[0].key);
        expect($scope.maintainers.sso[0].type).toEqual(userMaintainers[0].type);
        expect($scope.maintainers.sso[0].auth).toEqual(userMaintainers[0].auth);
        expect($scope.maintainers.sso[0].mine).toEqual(true);

        expect($scope.maintainers.sso.length).toBe(1);

        expect($scope.maintainers.objectOriginal.length).toBe(0);

        expect($scope.maintainers.object[0].key).toEqual(userMaintainers[0].key);
        expect($scope.maintainers.object[0].type).toEqual(userMaintainers[0].type);
        expect($scope.maintainers.object[0].auth).toEqual(userMaintainers[0].auth);
        expect($scope.maintainers.object[0].mine).toEqual(true);

    });

    it('should add the selected maintainers to the object before post it.', function() {

        $httpBackend.expectPOST('api/whois/RIPE/as-block', {
            objects: {
                object: [
                    {
                        attributes: {
                            attribute: [
                                {name: 'as-block', value: 'MY-AS-BLOCK'},
                                {name: 'mnt-by', value: 'TEST-MNT'},
                                {name: 'mnt-by', value: 'TEST-MNT-1'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            }
        }).respond(500);

        $scope.attributes.setSingleAttributeOnName('as-block', 'MY-AS-BLOCK');

        $scope.maintainers.object = [
            {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'},
            {'mine':false,'type':'mntner','auth':['SSO'],'key':'TEST-MNT-1'}
        ];

        $scope.onMntnerAdded($scope.maintainers.object[1]);

        $scope.submit();
        $httpBackend.flush();

    });

    it('should ask for password after add non-sso maintainer with password.', function() {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });


        // simulate manual removal of the last and only mntner
        $scope.maintainers.object = [];
        $scope.onMntnerRemoved({'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'});

        // simulate manual addition of a new mntner with only md5
        $scope.maintainers.object = [{'mine':false,'type':'mntner','auth':['MD5'],'key':'TEST-MNT-1'}];
        $scope.onMntnerAdded({'mine':false,'type':'mntner','auth':['MD5'],'key':'TEST-MNT-1'});

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();

    });

    it('should ask for password after upon submit.', function() {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        // simulate manual addition of a new mntner with only md5
        $scope.maintainers.object = [{'mine':false,'type':'mntner','auth':['MD5'],'key':'TEST-MNT-1'}];
        $scope.onMntnerAdded({'mine':false,'type':'mntner','auth':['MD5'],'key':'TEST-MNT-1'});

        // simulate manual removal of the last and only mntner
        $scope.maintainers.object = [];
        $scope.onMntnerRemoved({'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'});

        $scope.submit();

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();

    });

    it('should remove the selected maintainers to the object before post it.', function() {

        $httpBackend.expectPOST('api/whois/RIPE/as-block', {
            objects: {
                object: [
                    {
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
        }).respond(500);

        $scope.attributes.setSingleAttributeOnName('as-block', 'MY-AS-BLOCK');
        $scope.attributes.addAttrsSorted('mnt-by', ['TEST-MNT-1']);

        $scope.maintainers.object = [
            {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'},
            {'mine':false,'type':'mntner','auth':['SSO'],'key':'TEST-MNT-1'}
        ];

        $scope.onMntnerRemoved($scope.maintainers.object[1]);

        $scope.submit();
        $httpBackend.flush();

    });

    it('should add a null when removing the last maintainer.', function() {

        $scope.maintainers.object = [
            {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'}
        ];

        $scope.onMntnerRemoved($scope.maintainers.object[0]);


        expect($scope.attributes.getSingleAttributeOnName('mnt-by').value).toBeUndefined();

    });


    it('should add a new user defined attribute', function() {
        $scope.addSelectedAttribute({name:'remarks', value: null}, $scope.attributes[0]);

        expect($scope.attributes[1].name).toEqual('remarks');
        expect($scope.attributes[1].value).toBeNull();
    });

    it('should display delete object modal', function() {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then:function(a,b){}});

        $scope.source = 'RIPE';
        $scope.objectType = 'MNT';
        $scope.name = 'TEST-MNT';

        $scope.deleteObject();

        expect(ModalService.openDeleteObjectModal).toHaveBeenCalledWith($scope.source, $scope.objectType, $scope.name);
    });

    it('should display errors if delete object fail', function() {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { b(whoisObjectWithErrors); }});

        $scope.deleteObject();

        expect($scope.errors).toEqual( [ { severity: 'Error', text: 'Unrecognized source: %s', args: [ { value: 'INVALID_SOURCE' } ], plainText: 'Unrecognized source: INVALID_SOURCE' } ]);
    });


    it('should display generic errors if delete object fail without returning a whois object', function() {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { b('just text'); }});

        $scope.deleteObject();

        expect($scope.errors).toEqual([{ plainText:'Error deleting object. Please reload and try again.'}]);
    });
});

describe('webUpdates: CreateController', function () {

    var $scope, $rootScope, $state, $stateParams, $httpBackend, $window;
    var MessageStore;
    var WhoisResources;
    var CredentialsService;
    var MntnerService;
    var ModalService;
    var OBJECT_TYPE = 'route';
    var SOURCE = 'RIPE';
    var userMaintainers;
    var $q;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_, _MessageStore_, _WhoisResources_, _CredentialsService_, _MntnerService_, _ModalService_, _$q_) {

            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            CredentialsService = _CredentialsService_;
            MntnerService = _MntnerService_;
            ModalService = _ModalService_;
            $q = _$q_;

            userMaintainers = [
                {'mine': true, 'type': 'mntner', 'auth': ['SSO'], 'key': 'RIPE-NCC-MNT'}
            ];

            $httpBackend.whenGET('api/user/mntners').respond(userMaintainers);

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            _$controller_('CreateController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams, $window: $window
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be posible to create route objects', function() {
        // api/whois/RIPE/as-block
        $scope.objectType = 'route';
        $httpBackend.expectPOST('api/whois/RIPE/route').respond(400, {
            objects: {
                object: [
                    {
                        'primary-key': {
                            'attribute': [
                                {name: 'route', value: '193.0.7.231/32'},
                                {name: 'origin', value: 'AS1299'}
                            ]
                        },
                        attributes: {
                            attribute: [
                                {name: 'route', value: '193.0.7.231/32'},
                                {name: 'descr', value: 'My descr'},
                                {name: 'origin', value: 'AS1299'},
                                {name: 'mnt-by', value: 'RIPE-NCC-MNT'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            },
            errormessages: {
                errormessage: [
                    {
                        severity: "Error",
                        text: "Authorisation for [%s] %s failed\nusing \"%s:\"\nnot authenticated by: %s",
                        args: [
                            {value: 'aut-num'}, {value: 'AS1299'}, {value: 'mnt-by'}, {value: 'TELIANET-RR, RIPE-NCC-END-MNT'}
                        ]
                    },
                    {
                        severity: "Warning",
                        text: "This update has only passed one of the two required hierarchical authorisations"
                    },
                    {
                        severity: "Info",
                        text: "The %s object %s will be saved for one week pending the second authorisation",
                        args: [
                            {value: "route"},
                            {value: "193.0.7.231/32AS1299"}
                        ]
                    }
                ]
            },
        });

        $scope.attributes.setSingleAttributeOnName('route', '193.0.7.231/32');
        $scope.attributes.setSingleAttributeOnName('descr', 'My descr');
        $scope.attributes.setSingleAttributeOnName('origin', 'AS1299');
        $scope.attributes.setSingleAttributeOnName('mnt-by', 'RIPE-NCC-MNT');
        $scope.attributes.setSingleAttributeOnName('source', 'RIPE');

        $scope.submit();
        $httpBackend.flush();

        var resp = MessageStore.get('193.0.7.231/32AS1299');
        expect(resp.getPrimaryKey()).toEqual('193.0.7.231/32AS1299');
        var attrs = WhoisResources.wrapAttributes(resp.getAttributes());
        expect(attrs.getSingleAttributeOnName('route').value).toEqual('193.0.7.231/32');
        expect(attrs.getSingleAttributeOnName('origin').value).toEqual('AS1299');
        expect(attrs.getSingleAttributeOnName('descr').value).toEqual('My descr');
        expect(attrs.getAllAttributesOnName('mnt-by')[0].value).toEqual('RIPE-NCC-MNT');
        expect(attrs.getSingleAttributeOnName('source').value).toEqual('RIPE');
        expect(resp.errormessages.errormessage[0].severity).toEqual('Info');
        expect(resp.errormessages.errormessage[0].text).toEqual('Your object is still pending authorisation by the aut-num holder. Please ask the holder of AS1299 to confirm, by submitting the same object as outlined below using syncupdates or mail updates, and authenticate it using the maintainer(s) TELIANET-RR. See here for more details on this: <a target="_blank" href=\"https://www.ripe.net/manage-ips-and-asns/db/support/managing-route-objects-in-the-irr#2--creating-route-objects-referring-to-resources-you-do-not-manage\">https://www.ripe.net/manage-ips-and-asns/db/support/managing-route-objects-in-the-irr#2--creating-route-objects-referring-to-resources-you-do-not-manage</a>');

        expect($state.current.name).toBe('display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('route');
        expect($stateParams.name).toBe('193.0.7.231%2F32AS1299');
    });

});

describe('webUpdates: CreateController init with failures', function () {

    var $scope, $state, $stateParams, $httpBackend, $window;
    var MessageStore;
    var WhoisResources;
    var CredentialsService;
    var MntnerService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_, _MessageStore_, _WhoisResources_, _CredentialsService_,_MntnerService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            CredentialsService = _CredentialsService_;
            MntnerService = _MntnerService_;
            $window = _$window_;

            $httpBackend.whenGET('api/user/mntners').respond(404);

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            _$controller_('CreateController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams, $window:$window
            });


            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should report error when fetching sso maintainers fails', function() {
        expect($scope.hasErrors()).toBe(true);
        expect($scope.errors[0].plainText).toEqual('Error fetching maintainers associated with this SSO account');
    });

});

describe('webUpdates: CreateController init with nonexistent obj type', function () {

    var $scope, $state, $httpBackend, $window;
    var OBJECT_TYPE = 'blablabla';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$httpBackend_, _$window_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $state =  _$state_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;

            var userMaintainers = [
                {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'}
            ];

            $httpBackend.whenGET('api/user/mntners').respond(userMaintainers);

            var $stateParams = {};
            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            spyOn($state, 'transitionTo');

            _$controller_('CreateController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams, $window:$window
            });


            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should redirect to 404 page', function() {
        expect($state.transitionTo).toHaveBeenCalledWith('notFound');
    });

});

var whoisObjectWithErrors = {
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
};
