'use strict';

describe('textUpdates: AutoKeyLogicService', function () {

    var subject;

    beforeEach(module('textUpdates'));

    beforeEach(inject(function (AutoKeyLogicService) {
        subject = AutoKeyLogicService;
    }));

    afterEach(function () {
    });

    it('should identify no auto keys in attributes', function () {
        subject.identifyAutoKeys( 'person',
            [
                {name: 'person', value: '        Tester X'},
                {name: 'phone', value: '        +316'},
                {name: 'nic-hdl', value: '      TX123-RIPE'},
                {name: 'source', value: '        RIPE'}
            ]);

        expect(subject.get()).toEqual({});

    });

    it('should identify auto key in attributes', function () {
        subject.identifyAutoKeys( 'person',
            [
                {name: 'person', value: '        Tester X'},
                {name: 'phone', value: '        +316'},
                {name: 'nic-hdl', value: '      AUTO-1', comment: 'To be replaced after creation'},
                {name: 'source', value: '        RIPE'}
            ]);

        expect(subject.get()).toEqual(
            {
                'AUTO-1':{ provider:"person.nic-hdl", consumers:[], value:undefined}
            }
        );
    });

    it('should identify multiple auto keys in attributes', function () {
        _usePerson( '        Tester X', '      AUTO-1');
        _usePerson( '        Tester Y', '      AUTO-2');

        expect(subject.get()).toEqual(
            {
                'AUTO-1':{ provider:"person.nic-hdl", consumers:[], value:undefined},
                'AUTO-2':{ provider:"person.nic-hdl", consumers:[], value:undefined}
            }
        );

    });

    it('should register auto keys values', function () {
        _usePerson( '        Tester X', '      AUTO-1');
        _usePerson( '        Tester Y', '      AUTO-2');

        subject.registerAutoKeyValue( { name: 'nic-hdl', value: 'AUTO-1'},
            [
                {name: 'person', value: '        Tester X'},
                {name: 'phone', value: '        +316'},
                {name: 'nic-hdl', value: '      TX1-RIPE'},
                {name: 'source', value: '        RIPE'}
            ]);

        subject.registerAutoKeyValue( { name: 'nic-hdl', value: 'AUTO-2'},
            [
                {name: 'person', value: '        Tester X'},
                {name: 'phone', value: '        +316'},
                {name: 'nic-hdl', value: '      TY1-RIPE'},
                {name: 'source', value: '        RIPE'}
            ]);

        subject.registerAutoKeyValue( { name: 'nic-hdl', value: 'AUTO-3'},
            [
                {name: 'person', value: '        Tester Z'},
                {name: 'phone', value: '        +316'},
                {name: 'nic-hdl', value: '      TZ1-RIPE'},
                {name: 'source', value: '        RIPE'}
            ]);

        expect(subject.get()).toEqual(
            {
                'AUTO-1':{ provider:"person.nic-hdl", consumers:[], value:'      TX1-RIPE'},
                'AUTO-2':{ provider:"person.nic-hdl", consumers:[], value:'      TY1-RIPE'}
            }
        );
    });

    it('should substitute auto keys values', function () {
        _usePerson( '        Tester X', '      AUTO-1');

        subject.registerAutoKeyValue( { name: 'nic-hdl', value: 'AUTO-1'},
            [
                {name: 'person', value: '        Tester X'},
                {name: 'phone', value: '        +316'},
                {name: 'nic-hdl', value: '      TX1-RIPE'},
                {name: 'source', value: '        RIPE'}
            ]);

        var attrs =  [
            {name: 'person', value: '        Tester X'},
            {name: 'phone', value: '        +316'},
            {name: 'nic-hdl', value: '      AUTO-1'},
            {name: 'source', value: '        RIPE'}
        ];
        ;

        expect(subject.substituteAutoKeys(attrs)).toEqual(
            [
                {name: 'person', value: '        Tester X'},
                {name: 'phone', value: '        +316'},
                {name: 'nic-hdl', value: '      TX1-RIPE'},
                {name: 'source', value: '        RIPE'}
            ]
        );
    });

    it('should find auto attrs', function () {
        expect(subject.getAutoKeys( [
            {name: 'person', value: '        Tester X'},
            {name: 'phone', value: '        +316'},
            {name: 'nic-hdl', value: '      AUTO-1'},
            {name: 'source', value: '        RIPE'}
        ])).toEqual(
            [
                {name: 'nic-hdl', value: '      AUTO-1'},
            ]
        );
    });

    function _usePerson(name, key) {
        subject.identifyAutoKeys( 'person',
            [
                {name: 'person', value: name},
                {name: 'phone', value: '        +316'},
                {name: 'nic-hdl', value: key, comment: 'To be replaced after creation'},
                {name: 'source', value: '        RIPE'}
            ]);
    }

});

