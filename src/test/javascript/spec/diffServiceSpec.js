'use strict';

describe('dbWebApp: DiffService', function () {

    var diffService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_DiffService_) {
        diffService = _DiffService_;
    }));

    afterEach(function() {});

    it('test',function() {
        diffService.diff('before', 'after');
    });

});