'use strict';

describe('dbWebApp: WhoisResources', function () {

    var $whoisResources;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (WhoisResources) {
        $whoisResources = WhoisResources;
    }));

    afterEach(function () {

    });

    it('should embed attributes within a whoisressources-request', function () {

        expect($whoisResources.embedAttributes([
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

    it('should peel errors out of a whoisresources error response', function () {

        var errorResponse = $whoisResources.wrapWhoisResources({
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

        expect(errorResponse.readableError(errorResponse.errormessages.errormessage[0])).toEqual(
            'Unrecognized source: INVALID_SOURCE'
        );

        expect(errorResponse.readableError(errorResponse.errormessages.errormessage[1])).toEqual(
            'Not authenticated'
        );

        // has second %s withoutv second arg
        expect(errorResponse.readableError({
            severity: 'Error',
            text: 'Unrecognized source: %s %s',
            args: [{value: 'INVALID_SOURCE'}]
        })).toEqual(
            'Unrecognized source: INVALID_SOURCE %s'
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

    it('should interact with whoisresources success-response', function () {

        expect($whoisResources.wrapWhoisResources(null)).toEqual(undefined);

        var successResponse = $whoisResources.wrapWhoisResources({
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

    it('should read from attributes', function () {

        expect($whoisResources.wrapAttributes(null)).toEqual([]);

        var whoisAttributes = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a'},
            {name: 'mnt-by', value: null},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'd'}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName('source')).toEqual(
            {name: 'source', value: 'd'}
        );

        expect(whoisAttributes.getSingleAttributeOnName('non-existing')).toEqual(undefined);

        expect(whoisAttributes.getAllAttributesOnName('mnt-by')).toEqual([
            {name: 'mnt-by', value: null},
            {name: 'mnt-by', value: 'c'}
        ]);

        expect(whoisAttributes.getAllAttributesNotOnName('mnt-by')).toEqual([
            {name: 'as-block', value: 'a'},
            {name: 'source', value: 'd'}
        ]);

        expect(whoisAttributes.getAllAttributesOnName('non-existing')).toEqual([]);

        expect(whoisAttributes.getAllAttributesWithValueOnName('mnt-by')).toEqual([
            {name: 'mnt-by', value: 'c'}
        ]);

    });

    it('should adjust attributes', function () {

        var whoisAttributes = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a'},
            {name: 'mnt-by', value: null},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'd'}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName('as-block').value).toEqual('a' );
        expect(whoisAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName('mnt-by')[1].value).toEqual('c' );
        expect(whoisAttributes.getSingleAttributeOnName('source').value).toEqual('d' );

        // has side effects
        expect(whoisAttributes.setSingleAttributeOnName('source', 'RIPE')).toEqual([
            {name: 'as-block', value: 'a'},
            {name: 'mnt-by', value: null},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'RIPE'}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName('as-block').value).toEqual('a' );
        expect(whoisAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName('mnt-by')[1].value).toEqual('c' );
        expect(whoisAttributes.getSingleAttributeOnName('source').value).toEqual('RIPE' );

    });

    it('should adjust attributes', function () {

        var whoisAttributes = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a'},
            {name: 'mnt-by', value: null},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'd'}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName('as-block').value).toEqual('a' );
        expect(whoisAttributes.getSingleAttributeOnName('mnt-by').value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(null);
        expect(whoisAttributes.getAllAttributesOnName('mnt-by')[1].value).toEqual('c' );
        expect(whoisAttributes.getSingleAttributeOnName('source').value).toEqual('d' );

        // has side effects
        expect(whoisAttributes.setSingleAttributeOnName('mnt-by', 'TEST-MNT')).toEqual([
            {name: 'as-block', value:'a'},
            {name: 'mnt-by', value: 'TEST-MNT'},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'd'}
        ]);

        expect(whoisAttributes.getSingleAttributeOnName('as-block').value).toEqual('a' );
        expect(whoisAttributes.getSingleAttributeOnName('mnt-by').value).toEqual('TEST-MNT' );
        expect(whoisAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual('TEST-MNT');
        expect(whoisAttributes.getAllAttributesOnName('mnt-by')[1].value).toEqual('c' );
        expect(whoisAttributes.getSingleAttributeOnName('source').value).toEqual('d' );

    });

    it('should merge two attribute lists', function () {

        var whoisAttributesWithMeta = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0}},
            {name: 'mnt-by', value: null, $$meta: {$$idx: 1}},
            {name: 'mnt-by', value: 'c', $$meta: {$$idx: 1}},
            {name: 'source', value: 'd', $$meta: {$$idx: 2}},
        ]);

        // has side effectts
        expect(whoisAttributesWithMeta.mergeSortAttributes('mnt-by',
            [{name: 'mnt-by', value: 'e'}]
        )).toEqual([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0}},
            {name: 'mnt-by', value: 'c', $$meta: {$$idx: 1}},
            {name: 'mnt-by', value: 'e', $$meta: {$$idx: 1}},
            {name: 'source', value: 'd', $$meta: {$$idx: 2}}
        ]);
    });

    it('should accept a correct object', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: 'mnt-by',   value: 'c', $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'mnt-by',   value: 'e', $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'source',   value: 'd', $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validate()).toEqual(true);
        expect(attrs.getSingleAttributeOnName('as-block').$$error).toEqual(undefined);
        expect(attrs.getAllAttributesOnName('mnt-by')[0].$$error).toEqual(undefined);
        expect(attrs.getAllAttributesOnName('mnt-by')[1].$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName('source').$$error).toEqual(undefined);
    });

    it('should accept a correct object with second multiple null', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a',  $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: 'mnt-by',   value: 'c',  $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'mnt-by',   value: null, $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'source',   value: 'd',  $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validate()).toEqual(true);
        expect(attrs.getSingleAttributeOnName('as-block').$$error).toEqual(undefined);
        expect(attrs.getAllAttributesOnName('mnt-by')[0].$$error).toEqual(undefined);
        expect(attrs.getAllAttributesOnName('mnt-by')[1].$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName('source').$$error).toEqual(undefined);
    });

    it('should detect missing single mandatory attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: null, $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: 'mnt-by',   value: 'c',  $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'mnt-by',   value: null, $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'source',   value: 'd',  $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validate()).toEqual(false);
        expect(attrs.getSingleAttributeOnName('as-block').$$error).toEqual('Mandatory attribute not set');
        expect(attrs.getSingleAttributeOnName('mnt-by').$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName('source').$$error).toEqual(undefined);
    });

    it('should detect missing multiple mandatory attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a',  $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: 'mnt-by',   value: null, $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'source',   value: 'd',  $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validate()).toEqual(false);
        expect(attrs.getSingleAttributeOnName('as-block').$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName('mnt-by').$$error).toEqual('Mandatory attribute not set');
        expect(attrs.getSingleAttributeOnName('source').$$error).toEqual(undefined);
    });
    //
    //it('should detect multiple single attribute', function () {
    //    var attrs = $whoisResources.wrapAttributes([
    //        {name: 'as-block', value: 'a',  $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
    //        {name: 'mnt-by',   value: 'c',  $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
    //        {name: 'source',   value: 'd',  $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
    //        {name: 'source',   value: 'e',  $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
    //    ]);
    //
    //    expect(attrs.validate()).toEqual(false);
    //    console.log("attrs:"+ JSON.stringify(attrs));
    //    console.log("sources:"+ JSON.stringify(attrs.getAllAttributesNotOnName('source')));
    //    expect(attrs.getSingleAttributeOnName('as-block').$$error).toEqual(undefined);
    //    expect(attrs.getAllAttributesOnName('`source')[0].$$error).toEqual('Multiple attributes not allowed');
    //    expect(attrs.getAllAttributesOnName('`source')[1].$$error).toEqual('Multiple attributes not allowed');
    //});

    it('should detect missing multiple mandatory attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a',  $$error:'my error', $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: 'mnt-by',   value: null, $$error:'my error', $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'source',   value: 'd',  $$error:'my error', $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);
        expect(attrs.getSingleAttributeOnName('mnt-by').$$error).toEqual('my error');

        attrs.clearErrors();
        expect(attrs.getSingleAttributeOnName('as-block').$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName('mnt-by').$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName('source').$$error).toEqual(undefined);
    });

});
