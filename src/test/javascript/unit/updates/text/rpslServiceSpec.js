'use strict';

describe('textUpdates: RpslService', function () {

    var $RpslService;

    beforeEach(module('textUpdates'));

    beforeEach(inject(function (RpslService) {
        $RpslService = RpslService;
    }));

    afterEach(function () {

    });


    it('should empty json-attributes into rpsl', function () {
        var obj = {
            attributes: [
                {name: 'person'},
                {name: 'phone'},
                {name: 'address'}
            ]
        };
        var rpsl = $RpslService.toRpsl(obj);

        // should we padded with spaces
        expect(rpsl).toEqual(
            'person:        \n'+
            'phone:         \n'+
            'address:       \n'
        );
    });

    it('should convert populated json-attributes into rpsl', function () {
        var obj = {
            attributes: [
                {name: 'person', value: '        Tester X'},
                {name: 'phone', value: '        +316'},
                {name: 'address', value: '        Singel', comment: 'My comment'}
            ],
            deleteReason: "because",
            passwords:['a','b','c'],
            override:'a,b,c'
        };
        var rpsl = $RpslService.toRpsl(obj);

        // should exta padding spaces should be added
        expect(rpsl).toEqual(
            'person:        Tester X\n' +
            'phone:        +316\n' +
            'address:        Singel # My comment\n' +
            'delete:because\n' +
            'password:a\n'+
            'password:b\n'+
            'password:c\n'+
            'override:a,b,c\n'
        );
    });

    it('should parse empty rpsls', function () {
        var rpsl = '';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs).toEqual([]);
    });

    it('should parse regular rpsl with comments into json-attributes', function () {
        var rpsl =
            'person:        \n' +
            'phone:         +316 # My comment\n' +
            'address:       Singel\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
            {
                attributes: [
                    {name: 'person', value: undefined, comment: undefined},
                    {name: 'phone', value: '         +316', comment: 'My comment'},
                    {name: 'address', value: '       Singel', comment: undefined}
                ],
                deleteReason: undefined,
                passwords:[],
                override:undefined,
            }
        ]);
    });

    it('should parse rpsl with spaces before colon', function () {
        var rpsl = 'person    :   Me     #hoi\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
            {
                attributes: [
                    {name: 'person', value: '   Me', comment: 'hoi'}
                ],
                deleteReason: undefined,
                passwords:[],
                override:undefined
            }
        ]);
    });

    it('should parse rpsl with colon in value', function () {
        var rpsl = 'inet6num: 2001:7F8:1::A500:3333:1\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            {name: 'inet6num', value: ' 2001:7F8:1::A500:3333:1', comment: undefined}
        ]);
    });

    it('should parse empty value', function () {
        var rpsl = 'person:  \n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            {name: 'person', value: undefined, comment: undefined}
        ]);
    });

    it('should parse value without terminating newline', function () {
        var rpsl = 'person: Peter Person';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            {name: 'person', value: ' Peter Person', comment: undefined}
        ]);
    });

    it('should parse empty value with comment', function () {
        // TODO: is this allowed?
        var rpsl = 'person: # A comment\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            {name: 'person', value: undefined, comment: 'A comment'}
        ]);
    });

    it('should ignore empty attribute without key', function () {
        var rpsl = ': value # comment\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([]);
    });

    it('should interpret empty-line as object separator', function () {
        var rpsl =
            'person:        #hoi\n' +
            'phone:         +316\n' +
            'password:a\n'+
            '\n' +
            'address:       Singel # My comment\n' +
            'password:\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs.length).toBe(2);

        expect(objs[0]).toEqual(
            {
                attributes: [
                    {name: 'person', value: undefined, comment: 'hoi'},
                    {name: 'phone', value: '         +316', comment: undefined}
                ],
                deleteReason: undefined,
                passwords: ['a'],
                override: undefined
            }
        );

        expect(objs[1]).toEqual(
            {
                attributes: [
                    {name: 'address', value: '       Singel', comment: 'My comment'}
                ],
                deleteReason: undefined,
                passwords: [],
                override: undefined
            }
        );
    });

    it('should parse value continuation with space', function () {
        var rpsl =
            'person: value  1# comment 1\n' +
            ' more value 2 # and more comment\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            {name: 'person', value: ' value  1 more value 2', comment: 'comment 1 and more comment'}
        ]);
    });

    it('should parse value continuation with tab', function () {
        var rpsl =
            'person: value  1\n' +
            '\tmore value 2 # more comment\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            {name: 'person', value: ' value  1\tmore value 2', comment: 'more comment'}
        ]);
    });

    it('should parse value continuation with plus', function () {
        // TODO: could collapse plusses into single space?
        var rpsl =
            'person: value  1\n' +
            '+more value 2 # second comment\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            {name: 'person', value: ' value  1+more value 2', comment: 'second comment'}
        ]);
    });

    it('should parse extraordinary multi-line rpsl with comments into json-attributes', function () {
        var rpsl =
            'person:        \n' +
            'address:       Singel # part 1\n' +
            '   Amsterdam # part 2\n' +
            '\tNederland\n' +
            '++  # part 4\n' +
            '++Europa\n' +
            'phone:         +316 #ok\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            {name: 'person',  value: undefined,                                            comment: undefined},
            {name: 'address', value: '       Singel   Amsterdam\tNederland++++Europa', comment: 'part 1 part 2 part 4'},
            {name: 'phone',   value: '         +316',                                      comment: 'ok'},
        ]);

    });


    it('should parse delete from rpsl', function () {
        var rpsl = 'person: Tester X\n' +
            'delete:  because\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
            {
                attributes: [
                    {name: 'person', value: ' Tester X', comment: undefined}
                ],
                deleteReason: 'because',
                passwords: [],
                override: undefined
            }
          ]
        );

    });

    it('should parse password from rpsl', function () {
        var rpsl = 'person: Tester X\n' +
            'password:  secret\n' +
            'password:  secret\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
                {
                    attributes: [
                        {name: 'person', value: ' Tester X', comment: undefined}
                    ],
                    deleteReason: undefined,
                    passwords: ['secret'],
                    override: undefined
                }
            ]
        );

    });

    it('should parse override from rpsl', function () {
        var rpsl =
            'override:admin.secret,because    \n'+
            'person: Tester X\n';

        var objs = $RpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
                {
                    attributes: [
                        {name: 'person', value: ' Tester X', comment: undefined}
                    ],
                    deleteReason: undefined,
                    passwords: [],
                    override: 'admin.secret,because'
                }
            ]
        );
    });
});

