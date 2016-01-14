'use strict';

describe('dbWebApp: WhoisResources', function () {

    var $whoisResources;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (WhoisResources) {
        $whoisResources = WhoisResources;
    }));

    afterEach(function () {

    });

    it('should detect invalid whoisressources', function () {
        expect($whoisResources.wrapWhoisResources(null)).toBeUndefined();
        expect($whoisResources.wrapWhoisResources('garbage')).toBeUndefined();
        expect($whoisResources.wrapWhoisResources({otherField:"hi", otherRef:{number:4}})).toBeUndefined();

        expect($whoisResources.wrapWhoisResources({objects:{object:[]}})).toBeDefined();
        expect($whoisResources.wrapWhoisResources({errormessages:{errormessage:[  {
            severity: 'Warning',
            text: 'Not authenticated'
        }]}})).toBeDefined();

    });

    it('should embed attributes within a whoisressources-request', function () {

        expect($whoisResources.turnAttrsIntoWhoisObject([
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

    it('should embed multiple objects within a whoisressources-request', function () {

        expect($whoisResources.turnAttrsIntoWhoisObjects(
            [
                [  {name: 'person', value: 'p'}, {name: 'source', value:'ripe'} ],
                [  {name: 'mntner', value: 'm'}, {name: 'auth', value:'SSO a@b'} ]
            ]
        )).toEqual({
            objects: {
                object: [
                    {
                        type:'person',
                        attributes: { attribute: [ {name: 'person', value: 'p'}, {name: 'source', value:'ripe'} ] }
                    },
                    {
                        type:'mntner',
                        attributes: { attribute: [ {name: 'mntner', value: 'm'}, {name: 'auth', value:'SSO a@b'} ]}
                    }
                ]
            }
        });
    });

    it('should peel errors out of a whoisresources error response', function () {

        var errorResponse = $whoisResources.wrapWhoisResources({
            errormessages: {
                objects: {
                    object: [
                        {
                            attributes: {
                                attribute: [
                                    {name: 'admin-c', value: 'XYZ'}
                                ]
                            }
                        }
                    ]
                },
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
                            value: 'XYZ'
                        },
                        text: '\'%s\' is not valid for this object type',
                        args: [{value: 'XYZ'}]
                    }
                ]
            }
        });
        expect(errorResponse).toBeDefined();

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

        expect(errorResponse.getErrorsOnAttribute('admin-c', 'XYZ')).toEqual([
            {
                severity: 'Error',
                attribute: {
                    name: 'admin-c',
                    value: 'XYZ'
                },
                text: '\'%s\' is not valid for this object type',
                args: [{value: 'XYZ'}],
                plainText: '\'XYZ\' is not valid for this object type'
            }
        ]);

        expect(errorResponse.getAttributes()).toEqual([])

        expect(errorResponse.getPrimaryKey()).toEqual(undefined);

    });

    it('should extract authentication candidates from error resp', function() {
        var errorResponse = $whoisResources.wrapWhoisResources({
            errormessages: {
                errormessage: [
                    { severity: "Error",
                        text: "Authorisation for [%s] %s failed\nusing \"%s:\"\nnot authenticated by: %s",
                        args: [
                            {value: "inetnum"  }, {value: "194.219.52.240 - 194.219.52.243"},
                            {value: "mnt-by" },{value: "TPOLYCHNIA4-MNT"}
                        ]
                    },
                    {  severity: "Error",
                        text: "Authorisation for [%s] %s failed\nusing \"%s:\"\nnot authenticated by: %s",
                        args: [
                            { value: "inetnum" }, {  value: "194.219.0.0 - 194.219.255.255" },
                            { value: "mnt-lower" }, { value: "FORTHNETGR-MNT" }
                        ]
                    },
                    {  severity: "Error",
                        text: "Authorisation for [%s] %s failed\nusing \"%s:\"\nnot authenticated by: %s",
                        args: [  { value: "inetnum"  }, {  value: "194.219.0.0 - 194.219.255.255" },
                            { value: "mnt-by"  }, { value: "RIPE-NCC-HM-MNT, AARDVARK-MNT"  }
                        ]
                    },
                    { severity: "Info",
                        text: "Dry-run performed, no changes to the database have been made" }
                ]
            }
        });

        expect(errorResponse.getAuthenticationCandidatesFromError()).toEqual(
            ['TPOLYCHNIA4-MNT', 'FORTHNETGR-MNT', 'RIPE-NCC-HM-MNT', ' AARDVARK-MNT']
        );

    });
    it('should interact with whoisresources success-response', function () {

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
                                },
                                {
                                    name: 'imaginary',
                                    value: 'XYZ'
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

        expect(successResponse).toBeDefined();

        expect(successResponse.getGlobalErrors()).toEqual([]);

        expect(successResponse.getGlobalWarnings()).toEqual([]);

        expect(successResponse.getAttributes()).toEqual([
            { name: 'as-block', value: 'a' },
            { name: 'mnt-by', value: 'b' },
            { name: 'source', value: 'c' }
        ]);

        expect(successResponse.getPrimaryKey()).toEqual('MG20276-RIPEXYZ');

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
            {name: 'mnt-by',   value: 'b', $$meta: {$$idx: 1}},
            {name: 'source',   value: 'd', $$meta: {$$idx: 2}},
        ]);

        // has side effectts
        expect(whoisAttributesWithMeta.addAttrsSorted('mnt-by',
            [{name: 'mnt-by', value: 'c'}]
        )).toEqual([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0}},
            {name: 'mnt-by',   value: 'b', $$meta: {$$idx: 1}},
            {name: 'mnt-by',   value: 'c', $$meta: {$$idx: 1}},
            {name: 'source',   value: 'd', $$meta: {$$idx: 2}}
        ]);
    });

    it('should add an attribute after', function() {
        var whoisAttributes = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a'},
            {name: 'mnt-by', value: 'c'},
            {name: 'source', value: 'd'}
        ]);
        var after = whoisAttributes.addAttributeAfter({name:'remarks'}, whoisAttributes[0]);
        expect(after[1].name).toEqual('remarks');
    });

    it('should merge two attribute lists: no existing field', function () {

        var whoisAttributesWithMeta = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0}},
            {name: 'source',   value: 'd', $$meta: {$$idx: 2}},
        ]);

        // has side effectts
        expect(whoisAttributesWithMeta.addAttrsSorted('mnt-by',
            [{name: 'mnt-by', value: 'c'}]
        )).toEqual([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0}},
            {name: 'source',   value: 'd', $$meta: {$$idx: 2}},
            {name: 'mnt-by',   value: 'c'}
        ]);
    });

    it('should detect missing mandatory attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
        ]);

        var missingMandatories = attrs.getMissingMandatoryAttributes('as-block');
        expect(missingMandatories.length).toEqual(2);
        expect(missingMandatories[0].name).toEqual('mnt-by');
        expect(missingMandatories[1].name).toEqual('source');
    });

    it('should add missing mandatory attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
        ]);

        _.each( attrs.getMissingMandatoryAttributes('as-block'), function(item) {
            attrs = $whoisResources.wrapAttributes(attrs.addMissingMandatoryAttribute('as-block', item));
        });

        expect(attrs.length).toEqual(3);
        expect(attrs[0].name).toEqual('as-block');
        expect(attrs[0].value).toEqual('a');

        expect(attrs[1].name).toEqual('mnt-by');
        expect(attrs[1].value).toBeUndefined();

        expect(attrs[2].name).toEqual('source');
        expect(attrs[2].value).toBeUndefined();
    });

    it('should accept a correct object', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a', $$meta: {$$idx: 0, $$mandatory: true, $$multiple: false}},
            {name: 'mnt-by',   value: 'c', $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'mnt-by',   value: 'e', $$meta: {$$idx: 1, $$mandatory: true, $$multiple: true}},
            {name: 'source',   value: 'd', $$meta: {$$idx: 2, $$mandatory: true, $$multiple: false}},
        ]);

        expect(attrs.validateWithoutSettingErrors()).toEqual(true);

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

        expect(attrs.validateWithoutSettingErrors()).toEqual(true);

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

        expect(attrs.validateWithoutSettingErrors()).toEqual(false);

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

        expect(attrs.validateWithoutSettingErrors()).toEqual(false);

        expect(attrs.validate()).toEqual(false);
        expect(attrs.getSingleAttributeOnName('as-block').$$error).toEqual(undefined);
        expect(attrs.getSingleAttributeOnName('mnt-by').$$error).toEqual('Mandatory attribute not set');
        expect(attrs.getSingleAttributeOnName('source').$$error).toEqual(undefined);
    });

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

    it('should convert mntnrs to mnt-by attrs', function () {
        var mntnerForSsoResponse = $whoisResources.wrapWhoisResources({
            objects: {
                object: [
                    { 'primary-key': { attribute: [ { name: 'mntner', value: 'TEST-MNT'    } ] }  },
                    { 'primary-key': { attribute: [ { name: 'mntner', value: 'TESTSSO-MNT' } ]  } }
                ]
            }
        });

        expect(mntnerForSsoResponse).toBeDefined();

        expect(mntnerForSsoResponse.objectNamesAsAttributes('mnt-by')).toEqual(
            [
                {name:'mnt-by', value:'TEST-MNT'},
                {name:'mnt-by', value:'TESTSSO-MNT'}
            ]
        );

    });

    it('detact if an attribute can be added', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'person',        value: 'a', $$meta:{$$mandatory:true,  $$multiple:false}},
            {name: 'address',       value: 'b', $$meta:{$$mandatory:true,  $$multiple:true}},
            {name: 'address',       value: 'c', $$meta:{$$mandatory:true,  $$multiple:true}},
            {name: 'phone',         value: 'd', $$meta:{$$mandatory:true,  $$multiple:true}},
            {name: 'nic-hdl',       value: 'e', $$meta:{$$mandatory:true,  $$multiple:false}},
            {name: 'source',        value: 'g', $$meta:{$$mandatory:true,  $$multiple:false}},
        ]);

        var addableAttrs = attrs.getAddableAttributes('person', attrs );
        expect(addableAttrs[0].name).toBe('address');
        expect(addableAttrs[1].name).toBe('phone');
        expect(addableAttrs[2].name).toBe('fax-no');
        expect(addableAttrs[3].name).toBe('e-mail');
        expect(addableAttrs[4].name).toBe('org');
        expect(addableAttrs[5].name).toBe('remarks');
        expect(addableAttrs[6].name).toBe('notify');
        expect(addableAttrs[7].name).toBe('abuse-mailbox');
        expect(addableAttrs[8].name).toBe('mnt-by');
        expect(addableAttrs[9].name).toBe('created');
        expect(addableAttrs.length).toBe(10);
    });

    it('detact if an attribute can be removed', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'person',        value: 'a', $$meta:{$$mandatory:true,  $$multiple:false}},
            {name: 'address',       value: 'a', $$meta:{$$mandatory:true,  $$multiple:true}},
            {name: 'address',       value: 'a', $$meta:{$$mandatory:true,  $$multiple:true}},
            {name: 'phone',         value: 'a', $$meta:{$$mandatory:true,  $$multiple:true}},
            {name: 'nic-hdl',       value: 'a', $$meta:{$$mandatory:true,  $$multiple:false}},
            {name: 'last-modified', value: 'f', $$meta:{$$mandatory:false, $$multiple:false}},
            {name: 'source',        value: 'g', $$meta:{$$mandatory:true,  $$multiple:false}},
        ]);

        expect(attrs.canAttributeBeRemoved(attrs.getSingleAttributeOnName('person'))).toBe(false);

        expect(attrs.canAttributeBeRemoved(attrs.getAllAttributesOnName('address')[0])).toBe(true);
        expect(attrs.canAttributeBeRemoved(attrs.getAllAttributesOnName('address')[1])).toBe(true);

        expect(attrs.canAttributeBeRemoved(attrs.getAllAttributesOnName('phone')[0])).toBe(false);
        expect(attrs.canAttributeBeRemoved(attrs.getSingleAttributeOnName('nic-hdl'))).toBe(false);

        expect(attrs.canAttributeBeRemoved(attrs.getSingleAttributeOnName('last-modified'))).toBe(true);

        expect(attrs.canAttributeBeRemoved(attrs.getSingleAttributeOnName('source'))).toBe(false);


    });

    it('remove an attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a'},
            {name: 'mnt-by',   value: 'b'},
            {name: 'source',   value: 'c'},
        ]);

        attrs = attrs.removeAttribute(attrs[1]);

        expect(attrs.length).toEqual(2);
        expect(attrs[0].value).toEqual('a');
        expect(attrs[1].value).toEqual('c');
    });

    it('remove null attributes', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a'},
            {name: 'mnt-by',   value: null},
            {name: 'source',   value: 'c'},
        ]);

        var result = attrs.removeNullAttributes();

        expect(result.length).toEqual(2);
        expect(result[0].value).toEqual('a');
        expect(result[1].value).toEqual('c');
    });

    it('remove a null valued attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'mnt-by',   value: null},
            {name: 'source',   value: 'c'},
        ]);

        attrs = attrs.removeAttribute(attrs[0]);

        expect(attrs.length).toEqual(1);
    });

    it('remove an undefined valued attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'mnt-by'},
            {name: 'source',   value: 'c'},
        ]);

        attrs = attrs.removeAttribute(attrs[0]);

        expect(attrs.length).toEqual(1);
    });

    it('duplicate an attribute', function () {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a', $$meta:{$$mandatory:true, $$multiple:false}},
            {name: 'mnt-by',   value: 'b', $$meta:{$$mandatory:true, $$multiple:true}},
            {name: 'source',   value: 'c', $$meta:{$$mandatory:true, $$multiple:false}}
        ]);

        attrs = attrs.duplicateAttribute(attrs[1]);

        expect(attrs.length).toEqual(4);
        expect(attrs[0].value).toEqual('a');
        expect(attrs[1].value).toEqual('b');
        expect(attrs[2].name).toEqual('mnt-by');
        expect(attrs[2].value).toBeUndefined();
        expect(attrs[3].value).toEqual('c');
    });

    it('plaintext version of attributes', function() {
        var attrs = $whoisResources.wrapAttributes([
            {name: 'as-block', value: 'a', $$meta:{$$mandatory:true, $$multiple:false}},
            {name: 'mnt-by',   value: 'b', $$meta:{$$mandatory:true, $$multiple:true}},
            {name: 'source',   value: 'c', $$meta:{$$mandatory:true, $$multiple:false}}
        ]);

        expect(attrs.toPlaintext()).toEqual(
            'as-block:            a\n' +
            'mnt-by:              b\n' +
            'source:              c\n');
    });

    it('plaintext version of object', function() {
        var resources = $whoisResources.wrapWhoisResources({
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
                                    name: 'person',
                                    value: 'Test Person'
                                },
                                {
                                    name: 'nic-hdl',
                                    value: 'MG20276-RIPE'
                                },
                                {
                                    name: 'source',
                                    value: 'RIPE'
                                }
                            ]
                        }
                    }
                ]
            }
        });

        expect($whoisResources.wrapAttributes(resources.getAttributes()).toPlaintext()).toEqual(
            'person:              Test Person\n' +
            'nic-hdl:             MG20276-RIPE\n' +
            'source:              RIPE\n');
    });

    it('extract object from a response', function() {
        var personAttrs =  [
            { name: 'person', value: 'Test Person' },
            { name: 'nic-hdl', value: 'MG20276-RIPE' },
            { name: 'mnt-by',value: 'TEST-MNT' },
            { name: 'source',  value: 'RIPE' }
        ];
        var mntnerAttrs =  [
            { name: 'mntner', value: 'TEST-MNT' },
            { name: 'admin-c', value: 'MG20276-RIPE' },
            { name: 'mnt-by', value: 'TEST-MNT' },
            { name: 'source', value: 'RIPE' }
        ];
        var resources = $whoisResources.wrapWhoisResources({
            objects: {
                object: [
                    { attributes: { attribute: personAttrs } },
                    { attributes: {  attribute: mntnerAttrs } }
                ]
            }});

        expect(resources.getAttributesForObjectWithIndex(0)).toEqual( personAttrs);
        expect(resources.getAttributesForObjectWithIndex(1)).toEqual( mntnerAttrs);
        expect(resources.getAttributesForObjectWithIndex(2)).toEqual( []);

        expect($whoisResources.getAttributesForObjectOfType(resources, 'person')).toEqual( personAttrs);
        expect($whoisResources.getAttributesForObjectOfType(resources,'mntner')).toEqual( mntnerAttrs);
        expect($whoisResources.getAttributesForObjectOfType(resources,'inetnum')).toEqual( []);

    });


    });
