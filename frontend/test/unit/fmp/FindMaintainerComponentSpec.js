'use strict';

describe('FindMaintainer', function () {

    var $componentController;
    var $location;
    var $window;
    var $httpBackend;
    var $state;

    beforeEach(module('fmp'));
    beforeEach(inject(function (_$componentController_, _$location_, _$window_, _$httpBackend_, _$state_, _FindMaintainerService_) {
        $componentController = _$componentController_;
        $location = _$location_;
        $window = _$window_;
        $httpBackend = _$httpBackend_;
        $state = _$state_;
        FindMaintainerService: _FindMaintainerService_;

        $httpBackend.when('GET', /.*\.html/).respond(200);
        $httpBackend.flush();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Testing logged in user', function () {
        beforeEach(function() {
            loggedIn();
        });

        it('should retrieve maintainer data', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.selectMaintainer(maintainerKey);

            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT').respond({
                objects: {
                    object: [{
                        'name': 'world',
                        attributes: {
                            attribute: [{name: 'mntner', value: 'I-AM-MNT'}, {
                                name: 'upd-to',
                                value: 'test@ripe.net'
                            }]
                        }
                    }]
                }
            });
            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate').respond({
                expired: true
            });
            $httpBackend.flush();

            expect(ctrl.foundMaintainer.mntnerFound).toBe(true);
            expect(ctrl.foundMaintainer.selectedMaintainer.name).toBe('world');
            expect(ctrl.foundMaintainer.email).toBe('test@ripe.net');

            expect(ctrl.errors.length).toBe(0);
            expect(ctrl.warnings.length).toBe(0);

        });

        it('should choose first upd-to address if multiple found', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.selectMaintainer(maintainerKey);

            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT').respond({
                objects: {
                    object: [{
                        'name': 'world',
                        attributes: {
                            attribute: [
                                {name: 'mntner', value: 'I-AM-MNT'},
                                {name: 'upd-to', value: 'first@ripe.net'},
                                {name: 'upd-to', value: 'second@ripe.net'}
                            ]
                        }
                    }]
                }
            });
            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate').respond({
                expired: true
            });
            $httpBackend.flush();

            expect(ctrl.foundMaintainer.mntnerFound).toBe(true);
            expect(ctrl.foundMaintainer.selectedMaintainer.name).toBe('world');
            expect(ctrl.foundMaintainer.email).toBe('first@ripe.net');

            expect(ctrl.errors.length).toBe(0);
            expect(ctrl.warnings.length).toBe(0);
        });

        it('Validation result expired', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.selectMaintainer(maintainerKey);

            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT').respond({
                objects: {
                    object: [{
                        'name': 'world',
                        attributes: {
                            attribute: [
                                {name: 'mntner', value: 'I-AM-MNT'},
                                {name: 'upd-to', value: 'first@ripe.net'},
                                {name: 'upd-to', value: 'second@ripe.net'}
                            ]
                        }
                    }]
                }
            });
            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate').respond({
                expired: false
            });
            $httpBackend.flush();

            expect(ctrl.foundMaintainer.mntnerFound).toBe(true);
            expect(ctrl.foundMaintainer.selectedMaintainer.name).toBe('world');
            expect(ctrl.foundMaintainer.email).toBe('first@ripe.net');

            expect(ctrl.errors.length).toBe(0);
            expect(ctrl.warnings.length).toBe(1);
            expect(ctrl.warnings[0]).toBe('There is already an open request to reset the password of this maintainer. Proceeding now will cancel the earlier request.');

        });

        it('should not set a maintainer on not found', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-NO-MNT';
            ctrl.selectMaintainer(maintainerKey);

            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-NO-MNT').respond(404);
            $httpBackend.flush();

            expect(ctrl.foundMaintainer).toBeUndefined();
            expect(ctrl.errors.length).toBe(1);
            expect(ctrl.errors[0]).toBe('The maintainer could not be found.');
            expect(ctrl.warnings.length).toBe(0);
        });

        it('should not set a maintainer Error fetching maintainer', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-NO-MNT';
            ctrl.selectMaintainer(maintainerKey);

            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-NO-MNT').respond(500);
            $httpBackend.flush();

            expect(ctrl.foundMaintainer).toBeUndefined();

            expect(ctrl.errors.length).toBe(1);
            expect(ctrl.errors[0]).toBe('Error fetching maintainer');
            expect(ctrl.warnings.length).toBe(0);
        });

        it('should go to legacy when error validating email', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.selectMaintainer(maintainerKey);

            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT').respond({
                objects: {
                    object: [{
                        'name': 'world',
                        attributes: {
                            attribute: [{name: 'mntner', value: 'I-AM-MNT'}, {
                                name: 'upd-to',
                                value: 'test@ripe.net'
                            }]
                        }
                    }]
                }
            });
            $httpBackend.whenGET('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/validate').respond(400);
            $httpBackend.flush();

            expect(ctrl.foundMaintainer).toBeUndefined();

            expect(ctrl.errors.length).toBe(0);
            expect(ctrl.warnings.length).toBe(0);

            expect($state.current.name).toBe('fmp.forgotMaintainerPassword');

        });

        it('should go to mailSent-page when email is successfully sent', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.foundMaintainer = { email:"a@b.c", maintainerKey:maintainerKey };
            ctrl.validateEmail();

            $httpBackend.whenPOST('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json').respond({
                mntner: 'WORLD',
                email: 'a@b.c'
            });
            $httpBackend.flush();

            expect(ctrl.errors.length).toBe(0);
            expect($state.current.name).toBe('fmp.mailSent');
        });

        it('should report error validating mail', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.foundMaintainer = { email:"a@b.c", maintainerKey:maintainerKey };
            ctrl.validateEmail();

            $httpBackend.whenPOST('api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json').respond(500);
            $httpBackend.flush();

            expect(ctrl.errors.length).toBe(1);
            expect(ctrl.errors[0]).toBe('Error sending email');

            expect($state.current.name).toBe('fmp.forgotMaintainerPassword');

        });

        it('should report error validating mail', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.foundMaintainer = { email:"a@b.c", maintainerKey:maintainerKey };
            ctrl.validateEmail();

            $httpBackend
                .when('POST', 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json')
                .respond(404, 'unable to send email');
            $httpBackend.flush();

            expect(ctrl.errors.length).toBe(1);
            expect(ctrl.errors[0]).toBe('unable to send email');

            expect($state.current.name).toBe('fmp.forgotMaintainerPassword');

        });

        it('should report error validating mail', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.foundMaintainer = { email:"a@b.c", maintainerKey:maintainerKey };
            ctrl.validateEmail();

            $httpBackend
                .when('POST', 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json')
                .respond(404, 'not found');
            $httpBackend.flush();

            expect(ctrl.errors.length).toBe(0);

            expect($state.current.name).toBe('fmp.forgotMaintainerPassword');

        });

        it('valid email Unauthorized', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.foundMaintainer = { email:"a@b.c", maintainerKey:maintainerKey };
            ctrl.validateEmail();

            $httpBackend
                .when('POST', 'api/whois-internal/api/fmp-pub/mntner/I-AM-MNT/emaillink.json')
                .respond(401, 'Unauthorized');
            $httpBackend.flush();

            expect(ctrl.errors.length).toBe(0);

        });

        it('on cancel Window history back must be clicked', function () {
            $window.history = { back: jasmine.createSpy('back') };
            var ctrl = $componentController('findMaintainer');
            ctrl.cancel();
            $httpBackend.flush();
            expect($window.history.back).toHaveBeenCalled();
        });

        it('should switchToManualResetProcess', function () {
            var ctrl = $componentController('findMaintainer');
            var maintainerKey = 'I-AM-MNT';
            ctrl.foundMaintainer = { maintainerKey:maintainerKey };
            ctrl.switchToManualResetProcess();
            $httpBackend.flush();
            expect($state.current.name).toBe('fmp.forgotMaintainerPassword');

        });

    });

    describe('Testing Not logged in user', function () {
        it('Not logged in user', function () {
            $httpBackend.when('GET', 'api/user/info').respond(403);
            $componentController('findMaintainer');
            $httpBackend.flush();
            expect($state.current.name).toBe('fmp.requireLogin');
        });
    });

    function loggedIn(){
        $httpBackend.when('GET', 'api/user/info').respond(200);
    }

});
