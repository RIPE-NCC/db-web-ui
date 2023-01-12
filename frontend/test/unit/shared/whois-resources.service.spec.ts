import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { PropertiesService } from '../../../src/app/properties.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';

describe('WhoisResourcesService', () => {
    let whoisResourcesService: WhoisResourcesService;
    const propertiesService: PropertiesService = new PropertiesService(null);
    propertiesService.RIPE_NCC_MNTNERS = [
        'RIPE-NCC-HM-MNT',
        'RIPE-NCC-END-MNT',
        'RIPE-NCC-HM-PI-MNT',
        'RIPE-GII-MNT',
        'RIPE-DBM-MNT',
        'RIPE-NCC-LOCKED-MNT',
        'RIPE-ERX-MNT',
        'RIPE-NCC-LEGACY-MNT',
        'RIPE-NCC-MNT',
    ];
    propertiesService.TOP_RIPE_NCC_MNTNERS = ['RIPE-NCC-HM-MNT', 'RIPE-NCC-END-MNT', 'RIPE-NCC-LEGACY-MNT'];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, HttpClientTestingModule],
            providers: [WhoisResourcesService, WhoisMetaService, { provide: PropertiesService, useFactory: () => propertiesService }],
        });
        whoisResourcesService = TestBed.inject(WhoisResourcesService);
    });

    it('should wrap a success response', () => {
        const resp = {
            link: {
                type: 'locator',
                href: 'http://rest-prepdev.db.ripe.net/ripe/route/80.99.0.0/16AS6830?dry-run=false&reason=I+don%27t+need+this+object',
            },
            objects: {
                object: [
                    {
                        type: 'route',
                        link: {
                            type: 'locator',
                            href: 'http://rest-prepdev.db.ripe.net/ripe/route/80.99.0.0/16AS6830',
                        },
                        source: {
                            id: 'ripe',
                        },
                        'primary-key': {
                            attribute: [
                                {
                                    name: 'route',
                                    value: '80.99.0.0/16',
                                },
                                {
                                    name: 'origin',
                                    value: 'AS6830',
                                },
                            ],
                        },
                        attributes: {
                            attribute: [
                                {
                                    name: 'route',
                                    value: '80.99.0.0/16',
                                },
                                {
                                    name: 'descr',
                                    value: 'UPC',
                                },
                                {
                                    name: 'descr',
                                    value: 'UPC Magyarorszag Kft.',
                                },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/aut-num/AS6830',
                                    },
                                    name: 'origin',
                                    value: 'AS6830',
                                    'referenced-type': 'aut-num',
                                },
                                {
                                    name: 'notify',
                                    value: '***@broadband.hu',
                                },
                                {
                                    link: {
                                        type: 'locator',
                                        href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/SZABINET-MNT',
                                    },
                                    name: 'mnt-by',
                                    value: 'SZABINET-MNT',
                                    'referenced-type': 'mntner',
                                },
                                {
                                    name: 'changed',
                                    value: '***@broadband.hu 20040702',
                                },
                                {
                                    name: 'changed',
                                    value: '***@chello.at 20100125',
                                },
                                {
                                    name: 'created',
                                    value: '2010-01-25T10:18:10Z',
                                },
                                {
                                    name: 'last-modified',
                                    value: '2010-01-25T10:18:10Z',
                                },
                                {
                                    name: 'source',
                                    value: 'RIPE',
                                },
                            ],
                        },
                    },
                ],
            },
            'terms-and-conditions': {
                type: 'locator',
                href: '/docs/22.Terms-And-Conditions.html#introduction',
            },
        };

        whoisResourcesService.wrapSuccess(resp);
    });

    it('should detect invalid whoisressources', () => {
        expect(whoisResourcesService.validateWhoisResources(null)).toBeUndefined();
        expect(whoisResourcesService.validateWhoisResources('garbage')).toBeUndefined();
        expect(whoisResourcesService.validateWhoisResources({ otherField: 'hi', otherRef: { number: 4 } })).toBeUndefined();

        expect(whoisResourcesService.validateWhoisResources({ objects: { object: [] } })).toBeDefined();
        expect(
            whoisResourcesService.validateWhoisResources({
                errormessages: {
                    errormessage: [
                        {
                            severity: 'Warning',
                            text: 'Not authenticated',
                        },
                    ],
                },
            }),
        ).toBeDefined();
    });

    it('should embed attributes within a whoisressources-request', () => {
        expect(whoisResourcesService.turnAttrsIntoWhoisObject([{ name: 'mnt-by', value: 'b' }, { name: 'source' }])).toEqual({
            objects: {
                object: [
                    {
                        attributes: {
                            attribute: [{ name: 'mnt-by', value: 'b' }, { name: 'source' }],
                        },
                    },
                ],
            },
        });
    });

    it('should produce a list of filterable attributes', () => {
        let attrs = whoisResourcesService.getFilterableAttrsForObjectTypes(['role']);
        expect(attrs).toEqual(['role', 'nic-hdl', 'abuse-mailbox']);

        attrs = whoisResourcesService.getFilterableAttrsForObjectTypes(['person']);
        expect(attrs).toEqual(['person', 'nic-hdl']);

        attrs = whoisResourcesService.getFilterableAttrsForObjectTypes(['organisation']);
        expect(attrs).toEqual(['organisation', 'org-name']);

        attrs = whoisResourcesService.getFilterableAttrsForObjectTypes(['person', 'role', 'organisation']);
        expect(attrs).toEqual(['person', 'nic-hdl', 'role', 'abuse-mailbox', 'organisation', 'org-name']);
    });

    it('should produce a list of viewable attributes', () => {});

    it('should embed multiple objects within a whoisressources-request', () => {
        expect(
            whoisResourcesService.turnAttrsIntoWhoisObjects([
                [
                    { name: 'person', value: 'p' },
                    { name: 'source', value: 'ripe' },
                ],
                [
                    { name: 'mntner', value: 'm' },
                    { name: 'auth', value: 'SSO a@b' },
                ],
            ]),
        ).toEqual({
            objects: {
                object: [
                    {
                        type: 'person',
                        attributes: {
                            attribute: [
                                { name: 'person', value: 'p' },
                                { name: 'source', value: 'ripe' },
                            ],
                        },
                    },
                    {
                        type: 'mntner',
                        attributes: {
                            attribute: [
                                { name: 'mntner', value: 'm' },
                                { name: 'auth', value: 'SSO a@b' },
                            ],
                        },
                    },
                ],
            },
        });
    });

    it('should peel errors out of a whoisresources error response', () => {
        const errorResponse = whoisResourcesService.validateWhoisResources({
            errormessages: {
                objects: {
                    object: [
                        {
                            attributes: {
                                attribute: [{ name: 'admin-c', value: 'XYZ' }],
                            },
                        },
                    ],
                },
                errormessage: [
                    {
                        severity: 'Error',
                        text: 'Unrecognized source: %s',
                        args: [{ value: 'INVALID_SOURCE' }],
                    },
                    {
                        severity: 'Warning',
                        text: 'Not authenticated',
                    },
                    {
                        severity: 'Error',
                        attribute: {
                            name: 'admin-c',
                            value: 'XYZ',
                        },
                        text: '"%s" is not valid for this object type',
                        args: [{ value: 'XYZ' }],
                    },
                    {
                        severity: 'Error',
                        text: 'Cannot use reserved AS number %d',
                        args: [
                            {
                                value: '65530',
                            },
                        ],
                    },
                ],
            },
        });
        expect(errorResponse).toBeDefined();

        expect(whoisResourcesService.getGlobalErrors(errorResponse)).toEqual([
            {
                severity: 'Error',
                text: 'Unrecognized source: %s',
                args: [{ value: 'INVALID_SOURCE' }],
                plainText: 'Unrecognized source: INVALID_SOURCE',
            },
            {
                severity: 'Error',
                text: 'Cannot use reserved AS number %d',
                args: [{ value: '65530' }],
                plainText: 'Cannot use reserved AS number 65530',
            },
        ]);

        expect(whoisResourcesService.getGlobalWarnings(errorResponse)).toEqual([
            { severity: 'Warning', text: 'Not authenticated', plainText: 'Not authenticated' },
        ]);

        expect(WhoisResourcesService.readableError(errorResponse.errormessages.errormessage[0])).toEqual('Unrecognized source: INVALID_SOURCE');

        expect(WhoisResourcesService.readableError(errorResponse.errormessages.errormessage[1])).toEqual('Not authenticated');

        expect(WhoisResourcesService.readableError(errorResponse.errormessages.errormessage[3])).toEqual('Cannot use reserved AS number 65530');

        // has second %s withoutv second arg
        expect(
            WhoisResourcesService.readableError({
                severity: 'Error',
                text: 'Unrecognized source: %s %s',
                args: [{ value: 'INVALID_SOURCE' }],
            }),
        ).toEqual('Unrecognized source: INVALID_SOURCE %s');

        expect(whoisResourcesService.getErrorsOnAttribute(errorResponse, 'admin-c', 'XYZ')).toEqual([
            {
                severity: 'Error',
                attribute: {
                    name: 'admin-c',
                    value: 'XYZ',
                },
                text: '"%s" is not valid for this object type',
                args: [{ value: 'XYZ' }],
                plainText: '"XYZ" is not valid for this object type',
            },
        ]);

        expect(whoisResourcesService.getAttributes(errorResponse)).toEqual([]);

        expect(whoisResourcesService.getPrimaryKey(errorResponse)).toEqual(undefined);
    });

    it('should extract authentication candidates from error resp', () => {
        const errorResponse = whoisResourcesService.validateWhoisResources({
            errormessages: {
                errormessage: [
                    {
                        severity: 'Error',
                        text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                        args: [{ value: 'inetnum' }, { value: '194.219.52.240 - 194.219.52.243' }, { value: 'mnt-by' }, { value: 'TPOLYCHNIA4-MNT' }],
                    },
                    {
                        severity: 'Error',
                        text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                        args: [{ value: 'inetnum' }, { value: '194.219.0.0 - 194.219.255.255' }, { value: 'mnt-lower' }, { value: 'FORTHNETGR-MNT' }],
                    },
                    {
                        severity: 'Error',
                        text: 'Authorisation for [%s] %s failed\nusing "%s:"\nnot authenticated by: %s',
                        args: [
                            { value: 'inetnum' },
                            { value: '194.219.0.0 - 194.219.255.255' },
                            { value: 'mnt-by' },
                            { value: 'RIPE-NCC-HM-MNT, AARDVARK-MNT' },
                        ],
                    },
                    {
                        severity: 'Info',
                        text: 'Dry-run performed, no changes to the database have been made',
                    },
                ],
            },
        });
        expect(errorResponse).toBeDefined();

        expect(whoisResourcesService.getAuthenticationCandidatesFromError(errorResponse)).toEqual([
            'TPOLYCHNIA4-MNT',
            'FORTHNETGR-MNT',
            'RIPE-NCC-HM-MNT',
            ' AARDVARK-MNT',
        ]);
    });

    it('should interact with whoisresources success-response', () => {
        const successResponse = whoisResourcesService.validateWhoisResources({
            link: {
                type: 'locator',
                href: 'http://localhost.dev.ripe.net:8443/RIPE/person',
            },
            objects: {
                object: [
                    {
                        type: 'person',
                        link: {
                            type: 'locator',
                            href: 'http://rest-dev.db.ripe.net/ripe/person/MG20276-RIPE',
                        },
                        source: {
                            id: 'ripe',
                        },
                        'primary-key': {
                            attribute: [
                                {
                                    name: 'nic-hdl',
                                    value: 'MG20276-RIPE',
                                },
                                {
                                    name: 'imaginary',
                                    value: 'XYZ',
                                },
                            ],
                        },
                        attributes: {
                            attribute: [
                                {
                                    name: 'as-block',
                                    value: 'a',
                                },
                                {
                                    name: 'mnt-by',
                                    value: 'b',
                                },
                                {
                                    name: 'source',
                                    value: 'c',
                                },
                            ],
                        },
                    },
                ],
            },
            'terms-and-conditions': {
                type: 'locator',
                href: '/docs/22.Terms-And-Conditions.html#introduction',
            },
        });

        expect(successResponse).toBeDefined();

        expect(whoisResourcesService.getGlobalErrors(successResponse)).toEqual([]);

        expect(whoisResourcesService.getGlobalWarnings(successResponse)).toEqual([]);

        expect(whoisResourcesService.getAttributes(successResponse)).toEqual([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: 'b' },
            { name: 'source', value: 'c' },
        ]);

        expect(whoisResourcesService.getPrimaryKey(successResponse)).toEqual('MG20276-RIPEXYZ');
    });

    it('should read from attributes', () => {
        expect(whoisResourcesService.validateAttributes(null)).toEqual([]);

        const whoisAttributes = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: null },
            { name: 'mnt-by', value: 'c' },
            { name: 'source', value: 'd' },
        ]);

        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'source')).toEqual({ name: 'source', value: 'd' });

        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'non-existing')).toEqual(undefined);

        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')).toEqual([
            { name: 'mnt-by', value: null },
            { name: 'mnt-by', value: 'c' },
        ]);

        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'non-existing')).toEqual([]);

        expect(whoisResourcesService.getAllAttributesWithValueOnName(whoisAttributes, 'mnt-by')).toEqual([{ name: 'mnt-by', value: 'c' }]);
    });

    it('should adjust attributes', () => {
        const whoisAttributes = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: null },
            { name: 'mnt-by', value: 'c' },
            { name: 'source', value: 'd' },
        ]);

        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'as-block').value).toEqual('a');
        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'mnt-by').value).toEqual(null);
        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')[0].value).toEqual(null);
        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')[1].value).toEqual('c');
        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'source').value).toEqual('d');

        // has side effects
        expect(whoisResourcesService.setSingleAttributeOnName(whoisAttributes, 'source', 'RIPE')).toEqual([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: null },
            { name: 'mnt-by', value: 'c' },
            { name: 'source', value: 'RIPE' },
        ]);

        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'as-block').value).toEqual('a');
        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'mnt-by').value).toEqual(null);
        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')[0].value).toEqual(null);
        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')[1].value).toEqual('c');
        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'source').value).toEqual('RIPE');
    });

    it('should adjust attributes', () => {
        const whoisAttributes = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: null },
            { name: 'mnt-by', value: 'c' },
            { name: 'source', value: 'd' },
        ]);

        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'as-block').value).toEqual('a');
        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'mnt-by').value).toEqual(null);
        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')[0].value).toEqual(null);
        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')[1].value).toEqual('c');
        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'source').value).toEqual('d');

        // has side effects
        expect(whoisResourcesService.setSingleAttributeOnName(whoisAttributes, 'mnt-by', 'TEST-MNT')).toEqual([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: 'TEST-MNT' },
            { name: 'mnt-by', value: 'c' },
            { name: 'source', value: 'd' },
        ]);

        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'as-block').value).toEqual('a');
        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'mnt-by').value).toEqual('TEST-MNT');
        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')[0].value).toEqual('TEST-MNT');
        expect(WhoisResourcesService.getAllAttributesOnName(whoisAttributes, 'mnt-by')[1].value).toEqual('c');
        expect(whoisResourcesService.getSingleAttributeOnName(whoisAttributes, 'source').value).toEqual('d');
    });

    it('should merge two attribute lists', () => {
        const whoisAttributesWithMeta = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a', $$meta: { $$idx: 0 } },
            { name: 'mnt-by', value: 'b', $$meta: { $$idx: 1 } },
            { name: 'source', value: 'd', $$meta: { $$idx: 2 } },
        ]);

        // has side effectts
        expect(whoisResourcesService.addAttrsSorted(whoisAttributesWithMeta, 'mnt-by', [{ name: 'mnt-by', value: 'c' }])).toEqual([
            { name: 'as-block', value: 'a', $$meta: { $$idx: 0 } },
            { name: 'mnt-by', value: 'b', $$meta: { $$idx: 1 } },
            { name: 'mnt-by', value: 'c', $$meta: { $$idx: 1 } },
            { name: 'source', value: 'd', $$meta: { $$idx: 2 } },
        ]);
    });

    it('should add an attribute after', () => {
        const whoisAttributes = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: 'c' },
            { name: 'source', value: 'd' },
        ]);
        const after = whoisResourcesService.addAttributeAfter(whoisAttributes, { name: 'remarks' }, whoisAttributes[0]);
        expect(after[1].name).toEqual('remarks');
    });

    it('should merge two attribute lists: no existing field', () => {
        const whoisAttributesWithMeta = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a', $$meta: { $$idx: 0 } },
            { name: 'source', value: 'd', $$meta: { $$idx: 2 } },
        ]);

        // has side effectts
        expect(whoisResourcesService.addAttrsSorted(whoisAttributesWithMeta, 'mnt-by', [{ name: 'mnt-by', value: 'c' }])).toEqual([
            { name: 'as-block', value: 'a', $$meta: { $$idx: 0 } },
            { name: 'source', value: 'd', $$meta: { $$idx: 2 } },
            { name: 'mnt-by', value: 'c' },
        ]);
    });

    it('should detect missing mandatory attribute', () => {
        const attrs = whoisResourcesService.validateAttributes([{ name: 'as-block', value: 'a', $$meta: { $$idx: 0, $$mandatory: true, $$multiple: false } }]);

        const missingMandatories = whoisResourcesService.getMissingMandatoryAttributes(attrs, 'as-block');
        expect(missingMandatories.length).toEqual(2);
        expect(missingMandatories[0].name).toEqual('mnt-by');
        expect(missingMandatories[1].name).toEqual('source');
    });

    it('should add missing mandatory attribute', () => {
        let attrs = whoisResourcesService.validateAttributes([{ name: 'as-block', value: 'a', $$meta: { $$idx: 0, $$mandatory: true, $$multiple: false } }]);

        _.each(whoisResourcesService.getMissingMandatoryAttributes(attrs, 'as-block'), (item) => {
            const allAttributes = whoisResourcesService.addMissingMandatoryAttribute(attrs, 'as-block', item);
            attrs = whoisResourcesService.validateAttributes(allAttributes);
        });

        expect(attrs.length).toEqual(3);
        expect(attrs[0].name).toEqual('as-block');
        expect(attrs[0].value).toEqual('a');

        expect(attrs[1].name).toEqual('mnt-by');
        expect(attrs[1].value).toEqual('');

        expect(attrs[2].name).toEqual('source');
        expect(attrs[2].value).toEqual('');
    });

    it('should accept a correct object', () => {
        let attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a', $$meta: { $$idx: 0, $$mandatory: true, $$multiple: false } },
            { name: 'mnt-by', value: 'c', $$meta: { $$idx: 1, $$mandatory: true, $$multiple: true } },
            { name: 'mnt-by', value: 'e', $$meta: { $$idx: 1, $$mandatory: true, $$multiple: true } },
            { name: 'source', value: 'd', $$meta: { $$idx: 2, $$mandatory: true, $$multiple: false } },
        ]);

        expect(whoisResourcesService.validateWithoutSettingErrors(attrs)).toEqual(true);

        expect(whoisResourcesService.validate(attrs)).toEqual(true);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'as-block').$$error).toEqual(undefined);
        expect(WhoisResourcesService.getAllAttributesOnName(attrs, 'mnt-by')[0].$$error).toEqual(undefined);
        expect(WhoisResourcesService.getAllAttributesOnName(attrs, 'mnt-by')[1].$$error).toEqual(undefined);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'source').$$error).toEqual(undefined);
    });

    it('should accept a correct object with second multiple null', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a', $$meta: { $$idx: 0, $$mandatory: true, $$multiple: false } },
            { name: 'mnt-by', value: 'c', $$meta: { $$idx: 1, $$mandatory: true, $$multiple: true } },
            { name: 'mnt-by', value: null, $$meta: { $$idx: 1, $$mandatory: true, $$multiple: true } },
            { name: 'source', value: 'd', $$meta: { $$idx: 2, $$mandatory: true, $$multiple: false } },
        ]);

        expect(whoisResourcesService.validateWithoutSettingErrors(attrs)).toEqual(true);

        expect(whoisResourcesService.validate(attrs)).toEqual(true);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'as-block').$$error).toEqual(undefined);
        expect(WhoisResourcesService.getAllAttributesOnName(attrs, 'mnt-by')[0].$$error).toEqual(undefined);
        expect(WhoisResourcesService.getAllAttributesOnName(attrs, 'mnt-by')[1].$$error).toEqual(undefined);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'source').$$error).toEqual(undefined);
    });

    it('should detect missing single mandatory attribute', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: null, $$meta: { $$idx: 0, $$mandatory: true, $$multiple: false } },
            { name: 'mnt-by', value: 'c', $$meta: { $$idx: 1, $$mandatory: true, $$multiple: true } },
            { name: 'mnt-by', value: null, $$meta: { $$idx: 1, $$mandatory: true, $$multiple: true } },
            { name: 'source', value: 'd', $$meta: { $$idx: 2, $$mandatory: true, $$multiple: false } },
        ]);

        expect(whoisResourcesService.validateWithoutSettingErrors(attrs)).toEqual(false);

        expect(whoisResourcesService.validate(attrs)).toEqual(false);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'as-block').$$error).toEqual('Mandatory attribute not set');
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'mnt-by').$$error).toEqual(undefined);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'source').$$error).toEqual(undefined);
    });

    it('should detect missing multiple mandatory attribute', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a', $$meta: { $$idx: 0, $$mandatory: true, $$multiple: false } },
            { name: 'mnt-by', value: null, $$meta: { $$idx: 1, $$mandatory: true, $$multiple: true } },
            { name: 'source', value: 'd', $$meta: { $$idx: 2, $$mandatory: true, $$multiple: false } },
        ]);

        expect(whoisResourcesService.validateWithoutSettingErrors(attrs)).toEqual(false);

        expect(whoisResourcesService.validate(attrs)).toEqual(false);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'as-block').$$error).toEqual(undefined);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'mnt-by').$$error).toEqual('Mandatory attribute not set');
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'source').$$error).toEqual(undefined);
    });

    it('should detect missing multiple mandatory attribute', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a', $$error: 'my error', $$meta: { $$idx: 0, $$mandatory: true, $$multiple: false } },
            { name: 'mnt-by', value: null, $$error: 'my error', $$meta: { $$idx: 1, $$mandatory: true, $$multiple: true } },
            { name: 'source', value: 'd', $$error: 'my error', $$meta: { $$idx: 2, $$mandatory: true, $$multiple: false } },
        ]);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'mnt-by').$$error).toEqual('my error');

        whoisResourcesService.clearErrors(attrs);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'as-block').$$error).toEqual(undefined);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'mnt-by').$$error).toEqual(undefined);
        expect(whoisResourcesService.getSingleAttributeOnName(attrs, 'source').$$error).toEqual(undefined);
    });

    it('should detact if an attribute can be added', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'person', value: 'a', $$meta: { $$mandatory: true, $$multiple: false } },
            { name: 'address', value: 'b', $$meta: { $$mandatory: true, $$multiple: true } },
            { name: 'address', value: 'c', $$meta: { $$mandatory: true, $$multiple: true } },
            { name: 'phone', value: 'd', $$meta: { $$mandatory: true, $$multiple: true } },
            { name: 'nic-hdl', value: 'e', $$meta: { $$mandatory: true, $$multiple: false } },
            { name: 'source', value: 'g', $$meta: { $$mandatory: true, $$multiple: false } },
        ]);

        const addableAttrs = whoisResourcesService.getAddableAttributes(attrs, 'person', attrs);
        expect(addableAttrs[0].name).toBe('address');
        expect(addableAttrs[1].name).toBe('phone');
        expect(addableAttrs[2].name).toBe('fax-no');
        expect(addableAttrs[3].name).toBe('e-mail');
        expect(addableAttrs[4].name).toBe('org');
        expect(addableAttrs[5].name).toBe('remarks');
        expect(addableAttrs[6].name).toBe('notify');
        expect(addableAttrs[7].name).toBe('mnt-by');
        expect(addableAttrs.length).toBe(8);
    });

    it('should detact if an attribute can be removed', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'person', value: 'a', $$meta: { $$mandatory: true, $$multiple: false } },
            { name: 'address', value: 'a', $$meta: { $$mandatory: true, $$multiple: true } },
            { name: 'address', value: 'a', $$meta: { $$mandatory: true, $$multiple: true } },
            { name: 'phone', value: 'a', $$meta: { $$mandatory: true, $$multiple: true } },
            { name: 'nic-hdl', value: 'a', $$meta: { $$mandatory: true, $$multiple: false } },
            { name: 'last-modified', value: 'f', $$meta: { $$mandatory: false, $$multiple: false } },
            { name: 'source', value: 'g', $$meta: { $$mandatory: true, $$multiple: false } },
        ]);

        expect(whoisResourcesService.canAttributeBeRemoved(attrs, whoisResourcesService.getSingleAttributeOnName(attrs, 'person'))).toBeFalse();

        expect(whoisResourcesService.canAttributeBeRemoved(attrs, WhoisResourcesService.getAllAttributesOnName(attrs, 'address')[0])).toBeTruthy();
        expect(whoisResourcesService.canAttributeBeRemoved(attrs, WhoisResourcesService.getAllAttributesOnName(attrs, 'address')[1])).toBeTruthy();

        expect(whoisResourcesService.canAttributeBeRemoved(attrs, WhoisResourcesService.getAllAttributesOnName(attrs, 'phone')[0])).toBeFalse();
        expect(whoisResourcesService.canAttributeBeRemoved(attrs, whoisResourcesService.getSingleAttributeOnName(attrs, 'nic-hdl'))).toBeFalse();

        expect(whoisResourcesService.canAttributeBeRemoved(attrs, whoisResourcesService.getSingleAttributeOnName(attrs, 'last-modified'))).toBeTruthy();

        expect(whoisResourcesService.canAttributeBeRemoved(attrs, whoisResourcesService.getSingleAttributeOnName(attrs, 'source'))).toBeFalse();
    });

    it('should allow certain attrs to be empty but remove all others', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a' },
            { name: 'address', value: 'c' },
            { name: 'address', value: null },
            { name: 'remarks', value: '' },
            { name: 'mnt-by', value: '' },
            { name: 'source', value: 'd' },
        ]);

        const result = whoisResourcesService.removeNullAttributes(attrs);

        expect(result.length).toEqual(5);
        expect(result[0].value).toEqual('a');
        expect(result[1].value).toEqual('c');
        expect(result[2].value).toBeNull();
        expect(result[3].value).toEqual('');
        expect(result[4].value).toEqual('d');
    });

    it('should remove an attribute', () => {
        let attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: 'b' },
            { name: 'source', value: 'c' },
        ]);

        attrs = whoisResourcesService.removeAttribute(attrs, attrs[1]);

        expect(attrs.length).toEqual(2);
        expect(attrs[0].value).toEqual('a');
        expect(attrs[1].value).toEqual('c');
    });

    it('should remove null attributes', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: null },
            { name: 'source', value: 'c' },
        ]);

        const result = whoisResourcesService.removeNullAttributes(attrs);

        expect(result.length).toEqual(2);
        expect(result[0].value).toEqual('a');
        expect(result[1].value).toEqual('c');
    });

    it('should remove a null valued attribute', () => {
        let attrs = whoisResourcesService.validateAttributes([
            { name: 'mnt-by', value: null },
            { name: 'source', value: 'c' },
        ]);

        attrs = whoisResourcesService.removeAttribute(attrs, attrs[0]);

        expect(attrs.length).toEqual(1);
    });

    it('should remove an undefined valued attribute', () => {
        let attrs = whoisResourcesService.validateAttributes([{ name: 'mnt-by' }, { name: 'source', value: 'c' }]);

        attrs = whoisResourcesService.removeAttribute(attrs, attrs[0]);

        expect(attrs.length).toEqual(1);
    });

    it('should duplicate an attribute', () => {
        let attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a', $$meta: { $$mandatory: true, $$multiple: false } },
            { name: 'mnt-by', value: 'b', $$meta: { $$mandatory: true, $$multiple: true } },
            { name: 'source', value: 'c', $$meta: { $$mandatory: true, $$multiple: false } },
        ]);

        attrs = whoisResourcesService.duplicateAttribute(attrs, attrs[1]);

        expect(attrs.length).toEqual(4);
        expect(attrs[0].value).toEqual('a');
        expect(attrs[1].value).toEqual('b');
        expect(attrs[2].name).toEqual('mnt-by');
        expect(attrs[2].value).toEqual('');
        expect(attrs[3].value).toEqual('c');
    });

    it('should plaintext version of attributes', () => {
        const attrs = whoisResourcesService.validateAttributes([
            { name: 'as-block', value: 'a', $$meta: { $$mandatory: true, $$multiple: false } },
            { name: 'mnt-by', value: 'b', $$meta: { $$mandatory: true, $$multiple: true } },
            { name: 'source', value: 'c', $$meta: { $$mandatory: true, $$multiple: false } },
        ]);

        expect(whoisResourcesService.toPlaintext(attrs)).toEqual('as-block:            a\n' + 'mnt-by:              b\n' + 'source:              c\n');
    });

    it('should plaintext version of object', () => {
        const resources = whoisResourcesService.validateWhoisResources({
            objects: {
                object: [
                    {
                        type: 'person',
                        link: {
                            type: 'locator',
                            href: 'http://rest-dev.db.ripe.net/ripe/person/MG20276-RIPE',
                        },
                        source: {
                            id: 'ripe',
                        },
                        'primary-key': {
                            attribute: [
                                {
                                    name: 'nic-hdl',
                                    value: 'MG20276-RIPE',
                                },
                            ],
                        },
                        attributes: {
                            attribute: [
                                {
                                    name: 'person',
                                    value: 'Test Person',
                                },
                                {
                                    name: 'nic-hdl',
                                    value: 'MG20276-RIPE',
                                },
                                {
                                    name: 'source',
                                    value: 'RIPE',
                                },
                            ],
                        },
                    },
                ],
            },
        });

        const validatedAttributes = whoisResourcesService.validateAttributes(whoisResourcesService.getAttributes(resources));
        expect(whoisResourcesService.toPlaintext(validatedAttributes)).toEqual(
            'person:              Test Person\n' + 'nic-hdl:             MG20276-RIPE\n' + 'source:              RIPE\n',
        );
    });

    it('should extract object from a response', () => {
        const personAttrs = [
            { name: 'person', value: 'Test Person' },
            { name: 'nic-hdl', value: 'MG20276-RIPE' },
            { name: 'mnt-by', value: 'TEST-MNT' },
            { name: 'source', value: 'RIPE' },
        ];
        const mntnerAttrs = [
            { name: 'mntner', value: 'TEST-MNT' },
            { name: 'admin-c', value: 'MG20276-RIPE' },
            { name: 'mnt-by', value: 'TEST-MNT' },
            { name: 'source', value: 'RIPE' },
        ];
        const resources = whoisResourcesService.validateWhoisResources({
            objects: {
                object: [{ attributes: { attribute: personAttrs } }, { attributes: { attribute: mntnerAttrs } }],
            },
        });

        expect(whoisResourcesService.getAttributesForObjectOfType(resources, 'person')).toEqual(personAttrs);
        expect(whoisResourcesService.getAttributesForObjectOfType(resources, 'mntner')).toEqual(mntnerAttrs);
        expect(whoisResourcesService.getAttributesForObjectOfType(resources, 'inetnum')).toEqual([]);
    });

    it('should detect if object is comaintained', () => {
        const attributes = [{ name: 'mnt-by', value: 'RIPE-NCC-LEGACY-MNT' }];
        expect(whoisResourcesService.isComaintained(attributes)).toBeTruthy();
    });

    it('should detect if object is comaintained with multiple mnts', () => {
        const attributes = [
            { name: 'mnt-by', value: 'RIPE-NCC-LEGACY-MNT' },
            { name: 'mnt-by', value: 'SOME-MNT' },
        ];
        expect(whoisResourcesService.isComaintained(attributes)).toBeTruthy();
    });

    it('should detect if object is NOT comaintained', () => {
        const attributes = [{ name: 'mnt-by', value: 'SOME-MNT' }];
        expect(whoisResourcesService.isComaintained(attributes)).toBeFalse();
        expect(whoisResourcesService.isComaintained([])).toBeFalse();
    });
});
