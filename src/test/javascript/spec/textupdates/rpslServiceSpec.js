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
        var attrs = [
            {name: 'person'},
            {name: 'phone', value: '+316'},
            {name: 'address', value: 'Singel', comment: 'My comment'}

        ];
        var rpsl = $RpslService.toRpsl(attrs);

        expect(rpsl).toEqual(
            'person:        \n' +
            'phone:         +316\n' +
            'address:       Singel # My comment\n'
        );
    });

    it('should convert multi-line json-attributes with comments into rpsl', function () {
        // TODO
    });

    it('should parse regular rpsl into json-attributes', function () {
        var rpsl = 'person:        \n' +
            'phone:         +316\n' +
            'address:       Singel # My comment\n';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual( [
            {name: 'person',  value: undefined, comment: undefined},
            {name: 'phone',   value: '+316',    comment: undefined},
            {name: 'address', value: 'Singel',  comment: 'My comment' }
        ]);
    });

    it('should parse multi-line rpsl into json-attributes', function () {
        // TODO
    });

});
