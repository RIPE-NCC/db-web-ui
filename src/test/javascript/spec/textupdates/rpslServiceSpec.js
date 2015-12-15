'use strict';

describe('textUpdates: RpslService', function () {

    var $RpslService;

    beforeEach(module('textUpdates'));

    beforeEach(inject(function (RpslService) {
        $RpslService = RpslService;
    }));

    afterEach(function () {

    });

    it('should convert regular json-attributes into rpsl', function () {
        // TODO
    });

    it('should convert json-attributes with comments into rpsl', function () {
        // TODO
    });


    it('should parse regular rpsl into json-attributes', function () {
        // TODO
    });

    it('should parse multi-line rpsl into json-attributes', function () {
        // TODO
    });

    it('should parse rpsl with comments into json-attributes', function () {
        // TODO
    });

});
