import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RpslService } from '../../../src/app/updatestext/rpsl.service';

describe('RpslService', () => {
    let rpslService: RpslService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RpslService],
        });
        rpslService = TestBed.inject(RpslService);
    });

    it('should empty json-attributes into rpsl', () => {
        const obj = {
            attributes: [{ name: 'person' }, { name: 'phone' }, { name: 'address' }],
        };
        const rpsl = rpslService.toRpsl(obj);

        // should we padded with spaces
        expect(rpsl).toEqual('person:        \n' + 'phone:         \n' + 'address:       \n');
    });

    it('should convert populated json-attributes into rpsl', () => {
        const obj = {
            attributes: [
                { name: 'person', value: '        Tester X' },
                { name: 'phone', value: '        +316' },
                { name: 'address', value: '        Singel', comment: 'My comment' },
            ],
            deleteReason: 'because',
            passwords: ['a', 'b', 'c'],
            override: 'a,b,c',
        };
        const rpsl = rpslService.toRpsl(obj);

        // should exta padding spaces should be added
        expect(rpsl).toEqual(
            'person:        Tester X\n' +
                'phone:        +316\n' +
                'address:        Singel # My comment\n' +
                'delete:because\n' +
                'password:a\n' +
                'password:b\n' +
                'password:c\n' +
                'override:a,b,c\n',
        );
    });

    it('should parse empty rpsls', () => {
        const rpsl = '';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs).toEqual([]);
    });

    it('should parse regular rpsl with comments into json-attributes', () => {
        const rpsl = 'person:        \n' + 'phone:         +316 # My comment\n' + 'address:       Singel\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
            {
                attributes: [
                    { name: 'person', value: '', comment: undefined },
                    { name: 'phone', value: '         +316 # My comment', comment: undefined },
                    { name: 'address', value: '       Singel', comment: undefined },
                ],
                deleteReason: undefined,
                passwords: [],
                override: undefined,
            },
        ]);
    });

    it('should parse rpsl with spaces before colon', () => {
        const rpsl = 'person    :   Me     #hoi\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
            {
                attributes: [{ name: 'person', value: '   Me     #hoi', comment: undefined }],
                deleteReason: undefined,
                passwords: [],
                override: undefined,
            },
        ]);
    });

    it('should parse rpsl with colon in value', () => {
        const rpsl = 'inet6num: 2001:7F8:1::A500:3333:1\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([{ name: 'inet6num', value: ' 2001:7F8:1::A500:3333:1', comment: undefined }]);
    });

    it('should parse empty value', () => {
        const rpsl = 'person:  \n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([{ name: 'person', value: '', comment: undefined }]);
    });

    it('should parse value without terminating newline', () => {
        const rpsl = 'person: Peter Person';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([{ name: 'person', value: ' Peter Person', comment: undefined }]);
    });

    it('should parse empty value with comment', () => {
        // TODO: is this allowed?
        const rpsl = 'person: # A comment\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([{ name: 'person', value: ' # A comment', comment: undefined }]);
    });

    it('should ignore empty attribute without key', () => {
        const rpsl = ': value # comment\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([]);
    });

    it('should interpret empty-line as object separator', () => {
        const rpsl = 'person:        #hoi\n' + 'phone:         +316\n' + 'password:a\n' + '\n' + 'address:       Singel # My comment\n' + 'password:\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs.length).toBe(2);

        expect(objs[0]).toEqual({
            attributes: [
                { name: 'person', value: '        #hoi', comment: undefined },
                { name: 'phone', value: '         +316', comment: undefined },
            ],
            deleteReason: undefined,
            passwords: ['a'],
            override: undefined,
        });

        expect(objs[1]).toEqual({
            attributes: [{ name: 'address', value: '       Singel # My comment', comment: undefined }],
            deleteReason: undefined,
            passwords: [],
            override: undefined,
        });
    });

    it('should parse value continuation with space', () => {
        const rpsl = 'person: value  1# comment 1\n' + ' more value 2 # and more comment\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([{ name: 'person', value: ' value  1# comment 1 more value 2 # and more comment', comment: undefined }]);
    });

    it('should parse value continuation with tab', () => {
        const rpsl = 'person: value  1\n' + '\tmore value 2 # more comment\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([{ name: 'person', value: ' value  1\tmore value 2 # more comment', comment: undefined }]);
    });

    it('should parse value continuation with plus', () => {
        // TODO: could collapse plusses into single space?
        const rpsl = 'person: value  1\n' + '+more value 2 # second comment\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([{ name: 'person', value: ' value  1+more value 2 # second comment', comment: undefined }]);
    });

    it('should parse extraordinary multi-line rpsl with comments into json-attributes', () => {
        const rpsl =
            'person:        \n' +
            'address:       Singel # part 1\n' +
            '   Amsterdam # part 2\n' +
            '\tNederland\n' +
            '++  # part 4\n' +
            '++Europa\n' +
            'phone:         +316 #ok\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs[0].attributes).toEqual([
            { name: 'person', value: '', comment: undefined },
            { name: 'address', value: '       Singel # part 1   Amsterdam # part 2\tNederland++  # part 4++Europa', comment: undefined },
            { name: 'phone', value: '         +316 #ok', comment: undefined },
        ]);
    });

    it('should parse delete from rpsl', () => {
        const rpsl = 'person: Tester X\n' + 'delete:  because\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
            {
                attributes: [{ name: 'person', value: ' Tester X', comment: undefined }],
                deleteReason: 'because',
                passwords: [],
                override: undefined,
            },
        ]);
    });

    it('should parse password from rpsl', () => {
        const rpsl = 'person: Tester X\n' + 'password:  secret\n' + 'password:  secret\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
            {
                attributes: [{ name: 'person', value: ' Tester X', comment: undefined }],
                deleteReason: undefined,
                passwords: ['secret'],
                override: undefined,
            },
        ]);
    });

    it('should parse override from rpsl', () => {
        const rpsl = 'override:admin.secret,because    \n' + 'person: Tester X\n';

        const objs = rpslService.fromRpsl(rpsl);

        expect(objs).toEqual([
            {
                attributes: [{ name: 'person', value: ' Tester X', comment: undefined }],
                deleteReason: undefined,
                passwords: [],
                override: 'admin.secret,because',
            },
        ]);
    });
});
