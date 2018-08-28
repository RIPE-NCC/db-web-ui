'use strict';

describe('MailSentComponent', function() {
    var $stateParams, $componentControler, $ctrl;

    beforeEach(module('fmp'));

    beforeEach(inject(function (_$componentController_, _$stateParams_) {
        $stateParams = _$stateParams_;
        $componentControler = _$componentController_;
    }));

    it('should extract email from url params', function() {

        $stateParams.email = 'test@work.net';

        $ctrl = $componentControler('mailSent', {
            $stateParams: $stateParams
        });

        expect($ctrl.email).toBe('test@work.net');

    });
});
