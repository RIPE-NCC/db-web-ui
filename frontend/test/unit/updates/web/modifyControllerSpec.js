/*global afterEach, beforeEach, describe, expect, inject, it, spyOn*/
'use strict';

var logger = {
    debug: function () {
        //console.log('info:'+msg);
    },
    info: function () {
        //console.log('info:'+msg);
    },
    error: function () {
        //console.log('error:'+msg);
    }
};

var orgMock = {
    'type': 'organisation',
    'link': {
        'type': 'locator',
        'href': 'http://rest-prepdev.db.ripe.net/ripe/organisation/ORG-UA300-RIPE'
    },
    'source': {
        'id': 'ripe'
    },
    'primary-key': {
        'attribute': [{
            'name': 'organisation',
            'value': 'ORG-UA300-RIPE'
        }]
    },
    'attributes': {
        'attribute': [{
            'name': 'organisation',
            'value': 'ORG-UA300-RIPE'
        }, {
            'name': 'org-name',
            'value': 'uhuuu'
        }, {
            'name': 'org-type',
            'value': 'OTHER'
        }, {
            'name': 'address',
            'value': 'Singel 258'
        }, {
            'name': 'e-mail',
            'value': 'tdacruzper@ripe.net'
        }, {
            'link': {
                'type': 'locator',
                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/TEST-MNT'
            },
            'name': 'mnt-ref',
            'value': 'IS-NET-MNT',
            'referenced-type': 'mntner'
        }, {
            'link': {
                'type': 'locator',
                'href': 'http://rest-prepdev.db.ripe.net/ripe/mntner/TEST-MNT'
            },
            'name': 'mnt-by',
            'value': 'TEST-MNT',
            'referenced-type': 'mntner'
        }, {
            'name': 'created',
            'value': '2015-12-02T14:01:06Z'
        }, {
            'name': 'last-modified',
            'value': '2015-12-02T14:01:06Z'
        }, {
            'name': 'source',
            'value': 'RIPE'
        }]
    }
};

var ROLE_OBJ = [{
    'name': 'role',
    'value': 'some role'
}, {
    'name': 'address',
    'value': 'Singel 258'
}, {
    'name': 'e-mail',
    'value': 'fdsd@sdfsd.com'
}, {
    'name': 'abuse-mailbox',
    'value': 'fdsd@sdfsd.com'
}, {
    'name': 'nic-hdl',
    'value': 'SR11027-RIPE'
}, {
    'link': {
        'type': 'locator',
        'href': 'http://rest-dev.db.ripe.net/ripe/mntner/MNT-THINK'
    },
    'name': 'mnt-by',
    'value': 'MNT-THINK',
    'referenced-type': 'mntner'
}, {
    'name': 'created',
    'value': '2015-12-04T15:12:10Z'
}, {
    'name': 'last-modified',
    'value': '2015-12-04T15:12:10Z'
}, {
    'name': 'source',
    'value': 'RIPE'
}];

describe('webUpdates: ModifyController', function () {

    var $ctrl, $state, $stateParams, $httpBackend;
    var MessageStore;
    var CredentialsService;
    var WhoisResources;
    var MntnerService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var NAME = 'MY-AS-BLOCK';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, $window, _MessageStore_, _CredentialsService_, _WhoisResources_, _MntnerService_, _PreferenceService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window = {
                confirm: function () {
                    return true;
                }
            };
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            MntnerService = _MntnerService_;
            CredentialsService = _CredentialsService_;
            _PreferenceService_.isTextMode = function () {
                return false;
            };

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            CredentialsService.setCredentials('TEST-MNT', '@123');

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, $window: $window, $log: logger
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.whenGET('api/user/mntners').respond([
                {key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true},
                {key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO'], mine: true}
            ]);

            $httpBackend.whenGET('api/whois/RIPE/as-block/MY-AS-BLOCK?password=@123&unfiltered=true').respond(
                function () {
                    return [200, {
                        objects: {
                            object: [{
                                'primary-key': {attribute: [{name: 'as-block', value: 'MY-AS-BLOCK'}]},
                                attributes: {
                                    attribute: [
                                        {name: 'as-block', value: 'MY-AS-BLOCK'},
                                        {name: 'mnt-by', value: 'TEST-MNT'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }]
                        }
                    }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                function () {
                    return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO']}], {}];
                });

            $httpBackend.flush();

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get objectType from url', function () {
        expect($ctrl.objectType).toBe(OBJECT_TYPE);
    });

    it('should get source from url', function () {
        expect($ctrl.source).toBe(SOURCE);
    });

    it('should get name from url', function () {
        expect($ctrl.name).toBe(NAME);
    });

    it('should populate mntner data', function () {
        expect($ctrl.maintainers.sso.length).toBe(2);
        expect($ctrl.maintainers.objectOriginal.length).toBe(1);
        expect($ctrl.maintainers.object.length).toBe(1);

        expect($ctrl.maintainers.sso[0].key).toEqual('TEST-MNT');
        expect($ctrl.maintainers.sso[0].type).toEqual('mntner');
        expect($ctrl.maintainers.object[0].auth).toEqual(['MD5-PW', 'SSO']);
        expect($ctrl.maintainers.object[0].mine).toEqual(true);

        expect($ctrl.maintainers.objectOriginal[0].key).toEqual('TEST-MNT');

        expect($ctrl.maintainers.object[0].key).toEqual('TEST-MNT');
        expect($ctrl.maintainers.object[0].type).toEqual('mntner');
        expect($ctrl.maintainers.object[0].mine).toEqual(true);
        expect($ctrl.maintainers.object[0].isNew).toEqual(false);
        expect($ctrl.maintainers.object[0].auth).toEqual(['MD5-PW', 'SSO']);

    });

    it('should populate the ui based on object-type meta model and source', function () {
        var stateBefore = $state.current.name;

        expect($ctrl.attributes.getSingleAttributeOnName('as-block').$$error).toBeUndefined();
        expect($ctrl.attributes.getSingleAttributeOnName('as-block').value).toEqual(NAME);

        expect($ctrl.attributes.getAllAttributesOnName('mnt-by')[0].$$error).toBeUndefined();
        expect($ctrl.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');

        expect($ctrl.attributes.getAllAttributesOnName('source')[0].$$error).toBeUndefined();
        expect($ctrl.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });


    it('should display field specific errors upon submit click on form with missing values', function () {
        var stateBefore = $state.current.name;

        $ctrl.attributes.setSingleAttributeOnName('as-block', null);

        $ctrl.submit();
        expect($ctrl.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('Mandatory attribute not set');
        expect($ctrl.attributes.getSingleAttributeOnName('as-block').value).toBeNull();

        expect($ctrl.attributes.getAllAttributesOnName('mnt-by')[0].$$error).toBeUndefined();
        expect($ctrl.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');

        expect($ctrl.attributes.getSingleAttributeOnName('source').$$error).toBeUndefined();
        expect($ctrl.attributes.getSingleAttributeOnName('source').value).toEqual('RIPE');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should handle success put upon submit click when form is complete', function () {

        $httpBackend.expectPUT('api/whois/RIPE/as-block/MY-AS-BLOCK?password=@123').respond({
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

        $ctrl.attributes.setSingleAttributeOnName('changed', 'dummy@ripe.net');

        $ctrl.submit();
        $httpBackend.flush();

        var resp = $ctrl.MessageStore.get('MY-AS-BLOCK');
        expect(resp.getPrimaryKey()).toEqual('MY-AS-BLOCK');
        var attrs = $ctrl.WhoisResources.wrapAttributes(resp.getAttributes());
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
        $httpBackend.expectPUT('api/whois/RIPE/as-block/MY-AS-BLOCK?password=@123').respond(400, {
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

        $ctrl.attributes.setSingleAttributeOnName('as-block', 'A');

        $ctrl.submit();
        $httpBackend.flush();

        // FIXME [IS] error warning and etc are now in AlertService not on scope
        // expect($ctrl.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        // expect($ctrl.warnings[0].plainText).toEqual('Not authenticated');
        expect($ctrl.attributes.getSingleAttributeOnName('as-block').$$error).toEqual('\'MY-AS-BLOCK\' is not valid for this object type');

        expect($state.current.name).toBe(stateBefore);

    });

    it('duplicate attribute', function () {
        expect($ctrl.attributes.length).toEqual(3);

        $ctrl.duplicateAttribute($ctrl.attributes[1]);

        expect($ctrl.attributes.length).toEqual(4);
        expect($ctrl.attributes[2].name).toEqual($ctrl.attributes[1].name);
        expect($ctrl.attributes[2].value).toEqual('');
    });

    it('remove attribute', function () {
        expect($ctrl.attributes.length).toEqual(3);

        $ctrl.removeAttribute($ctrl.attributes[1]);

        expect($ctrl.attributes.length).toEqual(2);
        expect($ctrl.attributes[1].name).toEqual('source');
        expect($ctrl.attributes[1].value).toEqual('RIPE');

    });

    it('should transition to display state if cancel is pressed', function () {
        spyOn($state, 'transitionTo');
        $ctrl.cancel();
        expect($state.transitionTo).toHaveBeenCalledWith('webupdates.display', {
            source: SOURCE,
            objectType: 'as-block',
            name: 'MY-AS-BLOCK',
            method: undefined
        });
    });
});


describe('webUpdates: ModifyController init with failures', function () {

    var $ctrl, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var NAME = 'MY-AS-BLOCK';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _PreferenceService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            MntnerService = _MntnerService_;
            _PreferenceService_.isTextMode = function () {
                return false;
            };

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, $log: logger
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should report error when fetching sso maintainers fails', function () {

        getObject();
        failToGetSsoMaintainers();

        $httpBackend.flush();
// FIXME [IS] error warning and etc are now in AlertService not on scope
//         expect($ctrl.hasErrors()).toBe(true);
//         expect($ctrl.errors[0].plainText).toEqual('Error fetching maintainers associated with this SSO account');
    });

    it('should report error when fetching object fails', function () {

        getSsoMaintainers();
        getObjectWithError();

        $httpBackend.flush();
// FIXME [IS] error warning and etc are now in AlertService not on scope
//         expect($ctrl.hasWarnings()).toBe(true);
//         expect($ctrl.warnings[0].plainText).toEqual('Not authenticated');
    });

    it('should report error when fetching maintainer details fails', function () {

        getSsoMaintainers();
        getObject();
        failToGetMaintainerDetails();

        $httpBackend.flush();
        // expect($ctrl.hasErrors()).toBe(true);
        // expect($ctrl.errors[0].plainText).toEqual('Error fetching maintainer details');
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
            function () {
                return [200, {
                    objects: {
                        object: [{
                            'primary-key': {attribute: [{name: 'as-block', value: 'MY-AS-BLOCK'}]},
                            attributes: {
                                attribute: [
                                    {name: 'as-block', value: 'MY-AS-BLOCK'},
                                    {name: 'mnt-by', value: 'TEST3-MNT'},
                                    {name: 'source', value: 'RIPE'}
                                ]
                            }
                        }]
                    }
                }, {}];
            });
    }

    function getObjectWithError() {

        $httpBackend.whenGET('api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true').respond(
            function () {
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

    function failToGetMaintainerDetails() {
        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST3-MNT').respond(404);
    }

});

describe('webUpdates: ModifyController ask for password before modify object with non-sso maintainer with password', function () {

    var $ctrl, $state, $stateParams, $httpBackend;
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

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _ModalService_, _$q_, _PreferenceService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            MntnerService = _MntnerService_;
            ModalService = _ModalService_;
            $q = _$q_;
            _PreferenceService_.isTextMode = function () {
                return false;
            };

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            $httpBackend.whenGET('api/user/mntners').respond([
                {key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true}
            ]);


            $httpBackend.whenGET('api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true').respond(
                function () {
                    return [200, {
                        objects: {
                            object: [{
                                'primary-key': {attribute: [{name: 'as-block', value: 'MY-AS-BLOCK'}]},
                                attributes: {
                                    attribute: [
                                        {name: 'as-block', value: 'MY-AS-BLOCK'},
                                        {name: 'mnt-by', value: 'TEST3-MNT'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }]
                        }
                    }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST3-MNT').respond(
                function () {
                    return [200, [{key: 'TEST3-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
                });

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, $log: logger
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should ask for password before modify object with non-sso maintainer with password.', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function () {
            return $q.defer().promise;
        });
        $httpBackend.flush();
        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();
    });

});

describe('webUpdates: ModifyController should be able to handle escape objected with slash', function () {

    var $ctrl, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var SOURCE = 'RIPE';
    var OBJECT_TYPE = 'route';
    var NAME = '12.235.32.0%2f19AS1680';
    var $q;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _$q_) {

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
                function () {
                    return [200, {
                        objects: {
                            object: [{
                                'primary-key': {attribute: [{name: 'route', value: '12.235.32.0/19AS1680'}]},
                                attributes: {
                                    attribute: [
                                        {name: 'route', value: '12.235.32.0/19AS1680'},
                                        {name: 'mnt-by', value: 'TEST-MNT'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }]
                        }
                    }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                function () {
                    return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
                });

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, $log: logger
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

});

describe('webUpdates: ModifyController for organisation', function () {

    var $ctrl, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var OrganisationHelperService;
    var ModalService;
    var OBJECT_TYPE = 'organisation';
    var SOURCE = 'RIPE';
    var NAME = 'ORG-UA300-RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _OrganisationHelperService_, _PreferenceService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            OrganisationHelperService = _OrganisationHelperService_;
            MntnerService = _MntnerService_;
            ModalService = {
                openCreateRoleForAbuseCAttribute: function () {
                    return {
                        then: function (s) {
                            s(ROLE_OBJ);
                        }
                    };
                }
            };
            _PreferenceService_.isTextMode = function () {
                return false;
            };

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, ModalService: ModalService, $log: logger
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.whenGET('api/user/mntners').respond([
                {key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true},
                {key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO'], mine: true}
            ]);

            $httpBackend.whenGET('api/whois/RIPE/' + OBJECT_TYPE + '/' + NAME + '?unfiltered=true').respond(
                function () {
                    return [200, {
                        'objects': {
                            'object': [orgMock]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                function () {
                    return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO']}], {}];
                });

            $httpBackend.flush();

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should populate abuse-c with new role\'s nic-hdl', function () {
        $ctrl.attributes = OrganisationHelperService.addAbuseC($ctrl.objectType, $ctrl.attributes);
        $ctrl.createRoleForAbuseCAttribute();

        expect($ctrl.attributes.getSingleAttributeOnName('abuse-c').value).toBe('SR11027-RIPE');
    });

    it('should populate $ctrl.roleForAbuseC', function () {
        $ctrl.attributes = OrganisationHelperService.addAbuseC($ctrl.objectType, $ctrl.attributes);
        $ctrl.createRoleForAbuseCAttribute();

        expect($ctrl.roleForAbuseC).toBeDefined();
    });

    it('should show LIR orgs with certain attributes disabled', function () {
        expect();
    });

});

describe('webUpdates: ModifyController for LIR organisation', function () {

    var $ctrl, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var MntnerService;
    var OrganisationHelperService;
    var ModalService;
    var OBJECT_TYPE = 'organisation';
    var SOURCE = 'RIPE';
    var NAME = 'ORG-UA300-RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _OrganisationHelperService_) {

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            OrganisationHelperService = _OrganisationHelperService_;
            MntnerService = _MntnerService_;
            ModalService = {
                openCreateRoleForAbuseCAttribute: function () {
                    return {
                        then: function (s) {
                            s(ROLE_OBJ);
                        }
                    };
                }
            };

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            $ctrl = _$componentController_('createModify', {
                $state: $state, $stateParams: $stateParams, ModalService: ModalService, $log: logger
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.whenGET('api/user/mntners').respond([
                {key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true},
                {key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO'], mine: true}
            ]);

            $httpBackend.whenGET('api/whois/RIPE/' + OBJECT_TYPE + '/' + NAME + '?unfiltered=true').respond(
                function () {
                    // Modify the mock so it looks like an LIR
                    if (orgMock.attributes.attribute[2].name === 'org-type') {
                        orgMock.attributes.attribute[2].value = 'LIR';
                    }
                    return [200, {
                        'objects': {
                            'object': [orgMock]
                        },
                        'terms-and-conditions': {
                            'type': 'locator',
                            'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
                        }
                    }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                function () {
                    return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO']}], {}];
                });
            $httpBackend.flush();
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

});


