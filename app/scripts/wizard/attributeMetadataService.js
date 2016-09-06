/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).service('AttributeMetadataService', ['jsUtilService', 'PrefixService',
        function (jsUtils, PrefixService) {

            // Defaults:
            // * attributes are shown
            // * attribute values are valid -except-
            // * primary key values are valid when not-empty, otherwise they're invalid
            // * attribute cardinality is 0..*

            // The flags used in the metadata therefore contradict the defaults, e.g. you have to
            // set an attribute to 'hidden' if you don't want to show it. This means the metadata
            // only has to provide overrides and can therefore be pretty small.

            this.getAllMetadata = getAllMetadata;
            this.getMetadata = getMetadata;
            this.isValid = isValid;
            this.isHidden = isHidden;
            this.getReferences = getReferences;
            this.getCardinality = getCardinality;

            function isHidden(objectType, attributes, attribute) {
                jsUtils.checkTypes(arguments, ['string', 'array', 'object']);
                var md = getMetadata(objectType, attribute.name).hidden;
                if (!md) {
                    return false;
                }
                return evaluateMetadata(objectType, attributes, attribute, md);
            }

            function isInvalid(objectType, attributes, attribute) {
                jsUtils.checkTypes(arguments, ['string', 'array', 'object']);
                var md = getMetadata(objectType, attribute.name);
                if (!md.invalid) {
                    // primary keys are invalid if they're empty
                    return md.primaryKey ? !attribute.value : false;
                }
                return evaluateMetadata(objectType, attributes, attribute, md.invalid);
            }

            function isValid(objectType, attributes, attribute) {
                return !isInvalid(objectType, attributes, attribute);
            }

            function evaluateMetadata(objectType, attributes, attribute, attrMetadata) {
                jsUtils.checkTypes(arguments, ['string', 'array', 'object']);
                var target;
                // checks a list of attrs to see if any are invalid. each attr has an 'invalid'
                // definition in the metadata, or, if not, it's valid by default.
                if (jsUtils.typeOf(attrMetadata) === 'function') {
                    return attrMetadata(objectType, attributes, attribute);
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
                    if (isInvalid(objectType, attributes, target)) {
                        return true;
                    }
                } else if (jsUtils.typeOf(attrMetadata.invalid) === 'array') {
                    return -1 !== _.findIndex(attrMetadata.invalid, function (attrName) {
                        var i;
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

            function getReferences(objectType, attributeName) {
                return getMetadata(objectType, attributeName).refs;
            }

            function getAllMetadata(objectType) {
                jsUtils.checkTypes(arguments, ['string']);
                if (typeof objectType === 'string' && objectType) {
                    if (!objectMetadata[objectType]) {
                        throw Error('There is no metadata for ', objectType);
                    }
                    return objectMetadata[objectType];
                } else {
                    throw Error('AttributeMetadataService.getMetadata takes two non-empty strings');
                }
            }

            function getMetadata(objectType, attributeName) {
                jsUtils.checkTypes(arguments, ['string', 'string']);
                if (objectType && attributeName) {
                    if (!objectMetadata[objectType]) {
                        throw Error('There is no metadata for ', objectType);
                    }
                    return objectMetadata[objectType][attributeName];
                } else {
                    throw Error('AttributeMetadataService.getMetadata takes two non-empty strings');
                }
            }

            function getCardinality(objectType, attributeName) {
                jsUtils.checkTypes(arguments, ['string', 'string']);
                var result = {
                    minOccurs: 0, // No min
                    maxOccurs: -1 // No max
                };
                var md = getMetadata(objectType, attributeName);
                if (md.minOccurs) {
                    result.minOccurs = md.minOccurs;
                }
                if (md.maxOccurs) {
                    result.maxOccurs = md.maxOccurs;
                }
                return result;
            }

            /*
             * Metadata evaluation functions
             */
            function prefixIsInvalid(objectType, attributes, attribute) {
                return !PrefixService.validatePrefix(attribute.value);
            }

            // notes on metadata structure:
            // e.g.
            // 'admin-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
            //
            // should be read: admin-c is a mandatory field which can be added as many times as you like
            // (minOccurs:1, maxOccurs: -1 [by default]).
            //
            // It uses an autocomplete mechanism which refers to 'person' and 'role' objects.
            //
            // It should be hidden when EITHER the prefix OR any nserver values are invalid
            //
            var objectMetadata = {
                domain: {
                    domain: {minOccurs: 1, maxOccurs: 1, primaryKey: true},
                    descr: {minOccurs: 0, maxOccurs: -1},
                    org: {minOccurs: 0, maxOccurs: -1, refs: ['organisation']},
                    'admin-c': {minOccurs: 1, maxOccurs: -1, refs: ['person', 'role']},
                    'tech-c': {minOccurs: 1, maxOccurs: -1, refs: ['person', 'role']},
                    'zone-c': {minOccurs: 1, maxOccurs: -1, refs: ['person', 'role']},
                    nserver: {minOccurs: 2, maxOccurs: -1},
                    'ds-rdata': {minOccurs: 0, maxOccurs: -1},
                    remarks: {minOccurs: 0, maxOccurs: -1},
                    notify: {minOccurs: 0, maxOccurs: -1},
                    'mnt-by': {minOccurs: 1, maxOccurs: -1, refs: ['mntner']},
                    created: {minOccurs: 0, maxOccurs: 1},
                    'last-modified': {minOccurs: 0, maxOccurs: 1},
                    source: {minOccurs: 1, maxOccurs: 1}
                },
                prefix: {
                    prefix: {minOccurs: 1, maxOccurs: 1, primaryKey: true, invalid: prefixIsInvalid},
                    descr: {minOccurs: 0, maxOccurs: -1},
                    nserver: {minOccurs: 2, hidden: {invalid: 'prefix'}},
                    'reverse-zones': {minOccurs: 1, maxOccurs: 1, hidden: {invalid: ['prefix', 'nserver']}},
                    'ds-rdata': {minOccurs: 0, maxOccurs: -1},
                    org: {minOccurs: 0, maxOccurs: -1, refs: ['organisation']},
                    'admin-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
                    'tech-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
                    'zone-c': {minOccurs: 1, refs: ['person', 'role'], hidden: {invalid: ['prefix', 'nserver']}},
                    remarks: {minOccurs: 0, maxOccurs: -1},
                    notify: {minOccurs: 0, maxOccurs: -1},
                    'mnt-by': {minOccurs: 1, maxOccurs: -1, refs: ['mntner']},
                    created: {minOccurs: 0, maxOccurs: 1},
                    'last-modified': {minOccurs: 0, maxOccurs: 1},
                    source: {minOccurs: 1, maxOccurs: 1}
                }
            };

        }]);

})();
