/*global afterEach, beforeEach, describe, expect, inject, it, module, spyOn*/
'use strict';

describe('webUpdates: CreateController', function () {

    var $ctrl, $state, $stateParams, $httpBackend, $window;
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

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _$window_,_MessageStore_, _WhoisResources_, _CredentialsService_,_MntnerService_, _ModalService_, _$q_, _PreferenceService_) {

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window = { confirm: function() { return true; } };
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            CredentialsService = _CredentialsService_;
            MntnerService = _MntnerService_;
            ModalService = _ModalService_;
            _PreferenceService_.isTextMode = function() {return false;};
            $q = _$q_;

            userMaintainers = [
	            {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'}
            ];

            $httpBackend.whenGET('api/user/mntners').respond(userMaintainers);

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, $window:$window
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
        expect($ctrl.objectType).toBe(OBJECT_TYPE);
    });

    it('should get source from url', function () {
        expect($ctrl.source).toBe(SOURCE);
    });

    it('should populate mntner data', function () {
        expect($ctrl.maintainers.sso.length).toBe(1);
        expect($ctrl.maintainers.objectOriginal.length).toBe(0);
        expect($ctrl.maintainers.object.length).toBe(1);

        expect($ctrl.maintainers.sso[0].key).toEqual('TEST-MNT');
        expect($ctrl.maintainers.sso[0].type).toEqual('mntner');
        expect($ctrl.maintainers.sso[0].auth).toEqual(['SSO']);
        expect($ctrl.maintainers.sso[0].mine).toEqual(true);

        expect($ctrl.maintainers.object[0].key).toEqual('TEST-MNT');
        expect($ctrl.maintainers.object[0].type).toEqual('mntner');
        expect($ctrl.maintainers.object[0].auth).toEqual(['SSO']);
        expect($ctrl.maintainers.object[0].mine).toEqual(true);

        expect($ctrl.attributes.length).toBe(4);
        // there is is an attribute with a null value in the set
        expect($ctrl.attributes[2].name).toEqual('mnt-by');
        expect($ctrl.attributes[2].value).toEqual('TEST-MNT');

    });

    it('should populate the ui based on object-type meta model and source', function () {
        var stateBefore = $state.current.name;

        expect($ctrl.attributes.getSingleAttributeOnName('as-block').$$error).toBeUndefined();
        expect($ctrl.attributes.getAllAttributesWithValueOnName('mnt-by')[0].value).toEqual('TEST-MNT');
        expect($ctrl.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);
    });


    it('should display field specific errors upon submit click on form with missing values', function () {
        var stateBefore = $state.current.name;

        $ctrl.submit();
        expect($ctrl.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('Mandatory attribute not set');
        expect($ctrl.attributes.getSingleAttributeOnName('as-block').value).toEqual('');

        expect($ctrl.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should handle success post upon submit click when form is complete', function () {

        // api/whois/RIPE/as-block
        $httpBackend.expectPOST('api/whois/RIPE/as-block?password=@123').respond({
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

        CredentialsService.setCredentials('TEST-MNT', '@123');

        $ctrl.attributes.setSingleAttributeOnName('as-block', 'A');

        $ctrl.submit();
        $httpBackend.flush();

        var resp = MessageStore.get('MY-AS-BLOCK');
        expect(resp.getPrimaryKey()).toEqual('MY-AS-BLOCK');
        var attrs = WhoisResources.wrapAttributes(resp.getAttributes());
        expect(attrs.getSingleAttributeOnName('as-block').value).toEqual('MY-AS-BLOCK');
        expect(attrs.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');
        expect(attrs.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('as-block');
        expect($stateParams.name).toBe('MY-AS-BLOCK');
    });


    it('should handle error post upon submit click when form is complete', function () {
        var stateBefore = $state.current.name;

        // api/whois/RIPE/as-block
        $httpBackend.expectPOST('api/whois/RIPE/as-block').respond(400, whoisObjectWithErrors);

        $ctrl.attributes.setSingleAttributeOnName('as-block', 'A');

        $ctrl.submit();
        $httpBackend.flush();

        // FIXME [IS] Messages are now in AlerService
        // expect($ctrl.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        // expect($ctrl.warnings[0].plainText).toEqual('Not authenticated');
        expect($ctrl.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('\'MY-AS-BLOCK\' is not valid for this object type');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should reload defaults after error', function () {
        // api/whois/RIPE/as-block
        $httpBackend.expectPOST('api/whois/RIPE/as-block').respond(400, whoisObjectWithErrors);
        $ctrl.attributes.setSingleAttributeOnName('as-block', 'A');
        $ctrl.submit();
        $httpBackend.flush();
        expect($ctrl.attributes.getSingleAttributeOnName('source').$$meta.$$disable).toEqual(true);
    });


    it('should duplicate attribute', function() {
        var lengthBefore = $ctrl.attributes.length;

        $ctrl.duplicateAttribute($ctrl.attributes[1]);
        expect($ctrl.attributes.length).toEqual(lengthBefore + 1);
        expect($ctrl.attributes[2].name).toEqual($ctrl.attributes[1].name);
        expect($ctrl.attributes[2].value).toEqual('');

        // and again, just 2b sure.
        $ctrl.duplicateAttribute($ctrl.attributes[1]);
        expect($ctrl.attributes.length).toEqual(lengthBefore + 2);
        expect($ctrl.attributes[2].name).toEqual($ctrl.attributes[1].name);
        expect($ctrl.attributes[2].value).toEqual('');
    });

    it('should remove attribute', function() {
        var lengthBefore = $ctrl.attributes.length;
        var currentThird = $ctrl.attributes[2];

        $ctrl.removeAttribute($ctrl.attributes[1]);

        expect($ctrl.attributes.length).toEqual(lengthBefore-1);
        expect($ctrl.attributes[1].name).toEqual(currentThird.name);
        expect($ctrl.attributes[1].value).toEqual(currentThird.value);
    });


    it('should fetch maintainers already associated to the user in the session', function() {
        expect($ctrl.maintainers.sso[0].key).toEqual(userMaintainers[0].key);
        expect($ctrl.maintainers.sso[0].type).toEqual(userMaintainers[0].type);
        expect($ctrl.maintainers.sso[0].auth).toEqual(userMaintainers[0].auth);
        expect($ctrl.maintainers.sso[0].mine).toEqual(true);

        expect($ctrl.maintainers.sso.length).toBe(1);

        expect($ctrl.maintainers.objectOriginal.length).toBe(0);

        expect($ctrl.maintainers.object[0].key).toEqual(userMaintainers[0].key);
        expect($ctrl.maintainers.object[0].type).toEqual(userMaintainers[0].type);
        expect($ctrl.maintainers.object[0].auth).toEqual(userMaintainers[0].auth);
        expect($ctrl.maintainers.object[0].mine).toEqual(true);

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

        $ctrl.attributes.setSingleAttributeOnName('as-block', 'MY-AS-BLOCK');

        $ctrl.maintainers.object = [
            {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'},
            {'mine':false,'type':'mntner','auth':['SSO'],'key':'TEST-MNT-1'}
        ];

        $ctrl.onMntnerAdded($ctrl.maintainers.object[1]);

        $ctrl.submit();
        $httpBackend.flush();

    });

    it('should ask for password after add non-sso maintainer with password.', function() {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });


        // simulate manual removal of the last and only mntner
        $ctrl.maintainers.object = [];
        $ctrl.onMntnerRemoved({'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'});

        // simulate manual addition of a new mntner with only md5
        $ctrl.maintainers.object = [{'mine':false,'type':'mntner','auth':['MD5'],'key':'TEST-MNT-1'}];
        $ctrl.onMntnerAdded({'mine':false,'type':'mntner','auth':['MD5'],'key':'TEST-MNT-1'});

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();

    });

    it('should ask for password after upon submit.', function() {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function() { return $q.defer().promise; });

        // simulate manual addition of a new mntner with only md5
        $ctrl.maintainers.object = [{'mine':false,'type':'mntner','auth':['MD5'],'key':'TEST-MNT-1'}];
        $ctrl.onMntnerAdded({'mine':false,'type':'mntner','auth':['MD5'],'key':'TEST-MNT-1'});

        // simulate manual removal of the last and only mntner
        $ctrl.maintainers.object = [];
        $ctrl.onMntnerRemoved({'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'});

        $ctrl.submit();

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

        $ctrl.attributes.setSingleAttributeOnName('as-block', 'MY-AS-BLOCK');
        $ctrl.attributes.addAttrsSorted('mnt-by', ['TEST-MNT-1']);

        $ctrl.maintainers.object = [
            {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'},
            {'mine':false,'type':'mntner','auth':['SSO'],'key':'TEST-MNT-1'}
        ];

        $ctrl.onMntnerRemoved($ctrl.maintainers.object[1]);

        $ctrl.submit();
        $httpBackend.flush();

    });

    it('should add a null when removing the last maintainer.', function() {

        $ctrl.maintainers.object = [
            {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'}
        ];

        $ctrl.onMntnerRemoved($ctrl.maintainers.object[0]);

        expect($ctrl.attributes.getSingleAttributeOnName('mnt-by').value).toEqual('');

    });


    it('should add a new user defined attribute', function() {
        $ctrl.addSelectedAttribute({name:'remarks', value: null}, $ctrl.attributes[0]);

        expect($ctrl.attributes[1].name).toEqual('remarks');
        expect($ctrl.attributes[1].value).toBeNull();
    });

    it('should go to delete controler on delete', function() {
        $ctrl.source = 'RIPE';
        $ctrl.objectType = 'MNT';
        $ctrl.name = 'TEST-MNT';

        $ctrl.deleteObject();
        // FIXME [IS]
        // $httpBackend.flush();
        //
        // expect($state.current.name).toBe('webupdates.delete');
        // expect($stateParams.onCancel).toBe('webupdates.modify');
    });

    it('should transition to select state if cancel is pressed during create', function() {
        spyOn($state, 'transitionTo');
        $ctrl.cancel();
        expect($state.transitionTo).toHaveBeenCalledWith('webupdates.select');
    });
});

describe('webUpdates: CreateController', function () {

    var $ctrl, $rootScope, $state, $stateParams, $httpBackend, $window;
    var MessageStore;
    var WhoisResources;
    var CredentialsService;
    var MntnerService;
    var ModalService;
    var OBJECT_TYPE = 'route';
    var SOURCE = 'RIPE';
    var userMaintainers;
    var PreferenceService;
    var $q;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _$window_,
                         _MessageStore_, _WhoisResources_, _CredentialsService_, _MntnerService_, _ModalService_, _$q_, _PreferenceService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            CredentialsService = _CredentialsService_;
            MntnerService = _MntnerService_;
            ModalService = _ModalService_;
            PreferenceService = _PreferenceService_;
            PreferenceService.isTextMode = function() {return false;};

            $q = _$q_;

            userMaintainers = [
                {'mine': true, 'type': 'mntner', 'auth': ['SSO'], 'key': 'RIPE-NCC-MNT'}
            ];

            $httpBackend.whenGET('api/user/mntners').respond(userMaintainers);

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, $window: $window
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not be possible to create route objects with RIPE-NCC-RPSL-MNT for out-of-region objects', function() {
        $ctrl.objectType = 'route';
        // for creation and modification of route, route6 and aut-num, password for RIPE-NCC-RPSL-MNT is added to
        // the rest-call to allow creation of 'out-of-region'-objects without knowing the details of RPSL-mntner
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
                        severity: 'Error',
                        text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                        args: [
                            {value: 'aut-num'}, {value: 'AS1299'}, {value: 'mnt-by'}, {value: 'TELIANET-RR, RIPE-NCC-END-MNT'}
                        ]
                    },
                    {
                        severity: 'Warning',
                        text: 'This update has only passed one of the two required hierarchical authorisations'
                    },
                    {
                        severity: 'Info',
                        text: 'The %s object %s will be saved for one week pending the second authorisation',
                        args: [
                            {value: 'route'},
                            {value: '193.0.7.231/32AS1299'}
                        ]
                    }
                ]
            }
        });

        $ctrl.attributes.setSingleAttributeOnName('route', '193.0.7.231/32');
        $ctrl.attributes.setSingleAttributeOnName('descr', 'My descr');
        $ctrl.attributes.setSingleAttributeOnName('origin', 'AS1299');
        $ctrl.attributes.setSingleAttributeOnName('mnt-by', 'RIPE-NCC-MNT');
        $ctrl.attributes.setSingleAttributeOnName('source', 'RIPE');

        $ctrl.submit();
        $httpBackend.flush();
        var resp = $ctrl.MessageStore.get('193.0.7.231/32AS1299');
        expect(resp.getPrimaryKey()).toEqual('193.0.7.231/32AS1299');
        var attrs = WhoisResources.wrapAttributes(resp.getAttributes());
        expect(attrs.getSingleAttributeOnName('route').value).toEqual('193.0.7.231/32');
        expect(attrs.getSingleAttributeOnName('origin').value).toEqual('AS1299');
        expect(attrs.getSingleAttributeOnName('descr').value).toEqual('My descr');
        expect(attrs.getAllAttributesOnName('mnt-by')[0].value).toEqual('RIPE-NCC-MNT');
        expect(attrs.getSingleAttributeOnName('source').value).toEqual('RIPE');
        expect(resp.errormessages.errormessage[0].severity).toEqual('Info');
        expect(resp.errormessages.errormessage[0].text).toEqual(
            'Your object is still pending authorisation by a maintainer of the <strong>aut-num</strong> object ' +
            '<a target="_blank" href="#/webupdates/display/RIPE/aut-num/AS1299">AS1299</a>. ' +
            'Please ask them to confirm, by submitting the same object as outlined below using syncupdates or mail updates, ' +
            'and authenticate it using the maintainer ' +
            '<a target="_blank" href="#/webupdates/display/RIPE/mntner/TELIANET-RR">TELIANET-RR</a>. ' +
            '<a target="_blank" href="https://www.ripe.net/manage-ips-and-asns/db/support/managing-route-objects-in-the-irr#2--creating-route-objects-referring-to-resources-you-do-not-manage">' +
            'Click here for more information</a>.');

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('route');
        expect($stateParams.name).toBe('193.0.7.231%2F32AS1299');
    });
});

describe('webUpdates: CreateModifyComponent init with failures', function () {

    var $ctrl, $state, $stateParams, $httpBackend, $window;
    var MessageStore;
    var WhoisResources;
    var CredentialsService;
    var MntnerService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _$window_, _MessageStore_, _WhoisResources_, _CredentialsService_, _MntnerService_, _PreferenceService_) {

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            CredentialsService = _CredentialsService_;
            MntnerService = _MntnerService_;
            $window = _$window_;
            var PreferenceService = _PreferenceService_;
            PreferenceService.isTextMode = function() {return false;};

            $httpBackend.whenGET('api/user/mntners').respond(404);

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, $window:$window
            });


            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    // FIXME [IS]
    // it('should report error when fetching sso maintainers fails', function() {
    //     expect($ctrl.hasErrors()).toBe(true);
    //     expect($ctrl.errors[0].plainText).toEqual('Error fetching maintainers associated with this SSO account');
    // });

});

describe('webUpdates: CreateController init with nonexistent obj type', function () {

    var $ctrl, $state, $httpBackend, $window;
    var OBJECT_TYPE = 'blablabla';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$httpBackend_, _$window_, _PreferenceService_) {

            $state =  _$state_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;
            var PreferenceService = _PreferenceService_;
            PreferenceService.isTextMode = function() {return false;};

            var userMaintainers = [
                {'mine':true,'type':'mntner','auth':['SSO'],'key':'TEST-MNT'}
            ];

            $httpBackend.whenGET('api/user/mntners').respond(userMaintainers);

            var $stateParams = {};
            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = undefined;

            spyOn($state, 'transitionTo');

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, $window:$window
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

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
