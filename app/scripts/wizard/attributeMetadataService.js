/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).service('AttributeMetadataService', ['jsUtilService', 'PrefixService',
        function (jsUtils, PrefixService) {

        // Defaults:
        // * attributes are shown
        // * attribute values are valid -except-
        // * empty primary key values are invalid
        // * attribute cardinality is 0..*

        // The flags used in the metadata therefore contradict the defaults, e.g. you have to
        // set an attribute to 'hidden' if you don't want to show it. This means the metadata
        // only has to provide overrides and can therefore be pretty small.

        this.enrich = enrich;
        this.getAllMetadata = getAllMetadata;
        this.getMetadata = getMetadata;
        this.isInvalid = isInvalid;
        this.isHidden = isHidden;
        this.getCardinality = getCardinality;

        function enrich(objectType, attributes) {
            jsUtils.checkTypes(arguments, ['string', 'array']);
            var i;
            for (i = 0; i < attributes.length; i++) {
                attributes[i].$$invalid = isInvalid(objectType, attributes, attributes[i]);
                attributes[i].$$hidden = isHidden(objectType, attributes, attributes[i]);
            }
        }

        function isHidden(objectType, attributes, attribute) {
            jsUtils.checkTypes(arguments, ['string', 'array', 'object']);
            var md = getMetadata(objectType, attribute.name);
            if (!md || !md.hidden) {
                return false;
            }
            return evaluateMetadata(objectType, attributes, attribute, md.hidden);
        }

        function isInvalid(objectType, attributes, attribute) {
            jsUtils.checkTypes(arguments, ['string', 'array', 'object']);
            var md = getMetadata(objectType, attribute.name);
            if (!md || !md.invalid) {
                // primary keys are invalid if they're empty
                return md.primaryKey ? !attribute.value : false;
            }
            return evaluateMetadata(objectType, attributes, attribute, md.invalid);
        }

        function evaluateMetadata(objectType, attributes, attribute, attrMetadata) {
            jsUtils.checkTypes(arguments, ['string', 'array', 'object']);
            var i, target;
            // checks a list of attrs to see if any are invalid. each attr has an 'invalid'
            // definition in the metadata, or, if not, it's valid by default.
            if (jsUtils.typeOf(attrMetadata) === 'function') {
                return attrMetadata(objectType, attributes, attribute);
            }
            if (jsUtils.typeOf(attrMetadata) === 'regexp') {
                if (jsUtils.typeOf(attribute.value) !== 'string') {
                    return true;
                }
                // negate cz test is for IN-valid & regex is for a +ve match
                return !attrMetadata.test(attribute.value);
            }
            if (jsUtils.typeOf(attrMetadata) === 'array') {
                // handles { ..., invalid: [RegExp, invalid: ['attr1', 'attr2'], Function]}
                return -1 !== _.findIndex(attrMetadata, function (item) {
                        if (jsUtils.typeOf(item) === 'string') {
                            // must be 'invalid' or 'hidden'
                            if (attrMetadata[item]) {
                                return evaluateMetadata(objectType, attributes, attribute, attrMetadata[item]);
                            } else {
                                // not handled
                                return false;
                            }
                        } else {
                            return evaluateMetadata(objectType, attributes, attribute, item);
                        }
                    });
            }
            // Otherwise, go through the 'invalid' and 'hidden' properties and return the first true result
            // First, check it's valid metadata
            if (jsUtils.typeOf(attrMetadata) !== 'object' || !(attrMetadata.invalid || attrMetadata.hidden)) {
                return false;
            }
            // Evaluate the 'invalid's and return the first true result
            if (jsUtils.typeOf(attrMetadata.invalid) === 'string') {
                target = _.filter(attributes, function (o) {
                    return o.name === attrMetadata.invalid;
                });
                for (i = 0; i < target.length; i++) {
                    if (isInvalid(objectType, attributes, target[i])) {
                        return true;
                    }
                }
            } else if (jsUtils.typeOf(attrMetadata.invalid) === 'array') {
                return -1 !== _.findIndex(attrMetadata.invalid, function (attrName) {
                        // filter takes care of multiple attributes with the same name
                        target = _.filter(attributes, function (o) {
                            return o.name === attrName;
                        });
                        for (i = 0; i < target.length; i++) {
                            if (isInvalid(objectType, attributes, target[i])) {
                                return true;
                            }
                        }
                    });
            }
            // TODO: 'hidden' -- string and array
            return false;
        }

        function getAllMetadata(objectType) {
            jsUtils.checkTypes(arguments, ['string']);
            if (!objectMetadata[objectType]) {
                throw Error('There is no metadata for ', objectType);
            }
            return objectMetadata[objectType];
        }

        function getMetadata(objectType, attributeName) {
            jsUtils.checkTypes(arguments, ['string', 'string']);
            if (!objectMetadata[objectType]) {
                throw Error('There is no metadata for ', objectType);
            }
            return objectMetadata[objectType][attributeName];
        }

        function getCardinality(objectType, attributeName) {
            jsUtils.checkTypes(arguments, ['string', 'string']);
            var result = {
                minOccurs: 0,
                maxOccurs: -1
            };
            var md = getMetadata(objectType, attributeName);
            if (md.minOccurs > 0) {
                result.minOccurs = Math.max(md.minOccurs, 0);
            }
            if (md.maxOccurs > 0) {
                result.maxOccurs = Math.max(md.maxOccurs, -1);
            }
            return result;
        }

        /*
         * Metadata evaluation functions
         */
        function prefixIsInvalid(objectType, attributes, attribute) {
            var revZonesAttr, invalid = !attribute.value || !PrefixService.isValidPrefix(attribute.value);
            if (!invalid) {
                revZonesAttr = _.find(attributes, function (attr) {
                    return attr.name === 'reverse-zones';
                });
                if (revZonesAttr) {
                    revZonesAttr.value = PrefixService.getReverseDnsZones(attribute.value);
                }
            }
            return invalid;
        }

        var cachedResponses = {};

        var timeout;
        function nserverIsInvalid(objectType, attributes, attribute) {
            var doCall = function() {
                if (cachedResponses[attribute.value]) {
                    return cachedResponses[attribute.value] !== 'OK';
                }
                PrefixService.checkNameserverAsync(attribute.value).then(function () {
                    // put response in cache
                    cachedResponses[attribute.value] = 'OK';
                    attribute.$$invalid = false;
                }, function (err) {
                    if (err.status === 404) {
                        // ignore other errors, service is a bit flakey
                        cachedResponses[attribute.value] = 'FAILED';
                    }
                    attribute.$$invalid = true;
                });
            };
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(doCall, 600);
            // This is a wrapper for an async call, so should return 'true' (invalid). The
            // async response will set the success/errors.
            return jsUtils.typeOf(attribute.$$invalid) === 'boolean' ? attribute.$$invalid : true;
        }

        // Notes on metadata structure:
        //
        // Example 1
        // ---------
        //
        // 'admin-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
        //
        // should be read: admin-c is a mandatory field which can be added as many times as you like
        // (minOccurs:1,  [by default]).
        //
        // It uses an autocomplete mechanism which refers to 'person' and 'role' objects.
        //
        // It should be hidden when EITHER the prefix OR any nserver values are invalid
        //
        // Example 2
        // ---------
        // nserver: {..., invalid: new RegExp('^[a-z]{2,999}$'), hidden: testFunction}
        //
        // Attribute value is invalid if it does NOT match the RegExp, i.e. the regex should
        // match a valid value.
        //
        // Attribute will be hidden if the function 'testFunction' returns true. The function
        // will be invoked like this:
        //
        //     result = testFunction(objectType, attributes, attribute);
        //
        var objectMetadata = {
            domain: {
                domain: {minOccurs: 1, maxOccurs: 1, primaryKey: true},
                descr: {},
                org: {refs: ['organisation']},
                'admin-c': {minOccurs: 1, refs: ['person', 'role']},
                'tech-c': {minOccurs: 1, refs: ['person', 'role']},
                'zone-c': {minOccurs: 1, refs: ['person', 'role']},
                nserver: {minOccurs: 2},
                'ds-rdata': {},
                remarks: {},
                notify: {},
                'mnt-by': {minOccurs: 1, refs: ['mntner']},
                created: {maxOccurs: 1},
                'last-modified': {minOccurs: 0, maxOccurs: 1},
                source: {minOccurs: 1, maxOccurs: 1}
            },
            prefix: {
                prefix: {minOccurs: 1, maxOccurs: 1, primaryKey: true, invalid: prefixIsInvalid},
                descr: {},
                nserver: {minOccurs: 2, hidden: {invalid: 'prefix'}, invalid: [new RegExp('^\\w{1,255}(\\.\\w{1,255})+$'), nserverIsInvalid]},
                'reverse-zones': {minOccurs: 1, maxOccurs: 1, hidden: {invalid: ['prefix', 'nserver']}},
                'ds-rdata': {},
                org: {refs: ['organisation']},
                'admin-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
                'tech-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
                'zone-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
                remarks: {},
                notify: {},
                'mnt-by': {minOccurs: 1, refs: ['mntner']},
                created: {maxOccurs: 1},
                'last-modified': {minOccurs: 0, maxOccurs: 1},
                source: {minOccurs: 1, maxOccurs: 1}
            }
        };

    }]);

})();
