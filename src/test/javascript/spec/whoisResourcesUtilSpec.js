'use strict';

describe('dbWebApp: WhoisResourcesUtil', function () {

    var $whoisResourcesUtil;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (WhoisResourcesUtil) {
        $whoisResourcesUtil = WhoisResourcesUtil;
    }));

    afterEach(function () {

    });

    it('should work with a request', function () {
        expect($whoisResourcesUtil.embedAttributes([
            {name: 'mnt-by', value: 'b'},
            {name: 'source'}
        ])).toEqual({
            objects: {
                object: [
                    {
                        attributes: {
                            attribute: [
                                {name: 'mnt-by', value: 'b'},
                                {name: 'source'}]
                        }
                    }
                ]
            }
        });
    });

    it('should work with error response', function () {

        var errorResponse = $whoisResourcesUtil.wrapWhoisResources({
            errormessages: {
                errormessage: [
                    {
                        severity: 'Error',
                        text: 'Unrecognized source: %s',
                        'args': [{value: 'INVALID_SOURCE'}]
                    },
                    {
                        severity: 'Warning',
                        text: 'Not authenticated'
                    }, {
                        severity: 'Error',
                        attribute: {
                            name: 'admin-c',
                            value: 'INVALID'
                        },
                        text: '\'%s\' is not valid for this object type',
                        args: [{value: 'admin-c'}]
                    }
                ]
            }
        });

        expect(errorResponse.readableError({
            severity: 'Error',
            text: 'Unrecognized source: %s %s',
            args: [{value: 'INVALID_SOURCE'}]
        })).toEqual(
            'Unrecognized source: INVALID_SOURCE %s'
        );

        expect(errorResponse.readableError(errorResponse.errormessages.errormessage[0])).toEqual(
            'Unrecognized source: INVALID_SOURCE'
        );

        expect(errorResponse.readableError(errorResponse.errormessages.errormessage[1])).toEqual(
            'Not authenticated'
        );

        expect(errorResponse.getGlobalErrors(errorResponse)).toEqual([
            {
                severity: 'Error',
                text: 'Unrecognized source: %s',
                args: [{value: 'INVALID_SOURCE'}],
                plainText: 'Unrecognized source: INVALID_SOURCE'
            }
        ]);

        expect(errorResponse.getGlobalWarnings()).toEqual([
            {severity: 'Warning', text: 'Not authenticated', plainText: 'Not authenticated'}
        ]);

        expect(errorResponse.getErrorsOnAttribute('admin-c')).toEqual([
            {
                severity: 'Error',
                attribute: {
                    name: 'admin-c',
                    value: 'INVALID'
                },
                text: '\'%s\' is not valid for this object type',
                args: [{value: 'admin-c'}],
                plainText: '\'admin-c\' is not valid for this object type'
            }
        ]);

        expect(errorResponse.getAttributes()).toEqual([])

        expect(errorResponse.getObjectUid()).toEqual(undefined);


    });

    it('should work with success response', function () {

        expect($whoisResourcesUtil.wrapWhoisResources(null)).toEqual(undefined);

        var successResponse = $whoisResourcesUtil.wrapWhoisResources({
            link: {
                type: 'locator',
                href: 'http://localhost.dev.ripe.net:8443/RIPE/person'
            },
            objects: {
                object: [
                    {
                        type: 'person',
                        link: {
                            type: 'locator',
                            href: 'http://rest-dev.db.ripe.net/ripe/person/MG20276-RIPE'
                        },
                        source: {
                            id: 'ripe'
                        },
                        'primary-key': {
                            attribute: [
                                {
                                    name: 'nic-hdl',
                                    value: 'MG20276-RIPE'
                                }
                            ]
                        },
                        attributes: {
                            attribute: [
                                {
                                    name: 'as-block',
                                    value: 'a'
                                },
                                {
                                    name: 'mnt-by',
                                    value: 'b'
                                },
                                {
                                    name: 'source',
                                    value: 'c'
                                }
                            ]
                        }
                    }
                ]
            },
            'terms-and-conditions': {
                type: 'locator',
                href: 'http://www.ripe.net/db/support/db-terms-conditions.pdf'
            }
        });

        expect(successResponse.getGlobalErrors()).toEqual([]);

        expect(successResponse.getGlobalWarnings()).toEqual([]);

        expect(successResponse.getAttributes()).toEqual([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: 'b' },
            { name: 'source', value: 'c' }
        ]);

        expect(successResponse.getObjectUid()).toEqual('MG20276-RIPE');

    });

    it('should work with attributes', function () {

        expect($whoisResourcesUtil.wrapAttributes(null)).toEqual([]);

        var whoisAttributes = $whoisResourcesUtil.wrapAttributes([
            {name: 'as-block', value:'a'},
            {name: 'mnt-by', value: 'b'},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'd'}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName('source')).toEqual(
            { name: 'source', value: 'd' }
        );

        expect(whoisAttributes.getSingleAttributeOnName('non-existing')).toEqual(undefined);

        expect(whoisAttributes.getAllAttributesOnName('mnt-by')).toEqual([
            {name: 'mnt-by', value: 'b'},
            {name: 'mnt-by', value: 'c'}
        ]);

        expect(whoisAttributes.getAllAttributesOnName('non-existing')).toEqual([]);

        expect(whoisAttributes.setSingleAttributeOnName('source', 'RIPE')).toEqual([
            {name: 'as-block', value:'a'},
            {name: 'mnt-by', value: 'b'},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'RIPE'}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName('source')).toEqual(
            { name: 'source', value: 'RIPE' }
        );

        expect(whoisAttributes.setSingleAttributeOnName('mnt-by', 'TEST-MNT')).toEqual([
            {name: 'as-block', value:'a'},
            {name: 'mnt-by', value: 'TEST-MNT'},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'RIPE'}
        ]);


    });
});
