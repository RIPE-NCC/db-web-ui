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
        // TODO: can this happen?
    });

    it('should parse regular rpsl with comments into json-attributes', function () {
        var rpsl =
            'person:        \n' +
            'phone:         +316\n' +
            'address:       Singel # My comment\n';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: undefined, comment: undefined},
            {name: 'phone', value: '+316', comment: undefined},
            {name: 'address', value: 'Singel', comment: 'My comment'}
        ]);
    });

    it('should parse rpsl with spaces before colon', function () {
        var rpsl = 'person    :   Me     #hoi\n';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: 'Me', comment: 'hoi'}
        ]);
    });

    it('should parse empty value', function () {
        var rpsl = 'person:  \n';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: undefined, comment: undefined}
        ]);
    });

    it('should parse empty value with comment', function () {
        // TODO: is this allowed?
        var rpsl = 'person: # A comment';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: undefined, comment: 'A comment'}
        ]);
    });


    it('should ignore empty attribute without keye', function () {
        var rpsl = ': value # comment';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([]);
    });

    it('should ignore empty lines in rpsl', function () {
        // TODO should we?
        var rpsl =
            'person:        #hoi\n' +
            'phone:         +316\n' +
            '\n' +
            'address:       Singel # My comment\n';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: undefined, comment: 'hoi'},
            {name: 'phone', value: '+316', comment: undefined},
            {name: 'address', value: 'Singel', comment: 'My comment'}
        ]);
    });

    it('should parse value continuation with space', function () {
        var rpsl =
            'person: value  1# comment 1\n' +
            ' more value 2 # and more comment';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: 'value  1 more value 2', comment: 'comment 1 and more comment'}
        ]);
    });

    it('should parse value continuation with tab', function () {
        var rpsl =
            'person: value  1\n' +
            '\tmore value 2 # more comment';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: 'value  1\tmore value 2', comment: 'more comment'}
        ]);
    });

    it('should parse value continuation with plus', function () {
        // TODO: is this ok?
        var rpsl =
            'person: value  1\n' +
            '+more value 2 # second comment';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: 'value  1+more value 2', comment: 'second comment'}
        ]);
    });

    it('should parse multi-line rpsl with comments into json-attributes', function () {
        var rpsl =
            'person:        \n' +
            'address:       Singel # part 1\n' +
            '   Amsterdam # part 2\n' +
            '\tNederland\n' +
            '++  # part 4\n' +
            '++Europa\n' +
            'phone:         +316 #ok\n';

        var attrs = $RpslService.fromRpsl(rpsl);

        expect(attrs).toEqual([
            {name: 'person', value: undefined, comment: undefined},
            {name: 'address', value: 'Singel    Amsterdam \tNederland++  ++Europa', comment: 'part 1 part 2 part 4'},
            {name: 'phone', value: '+316', comment: 'ok'},
        ]);
    });
});

