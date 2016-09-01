/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).service('AttributeMetadataService', ['PrefixService',
        function (PrefixService) {

            // Defaults:
            // * attributes are shown
            // * attribute values are valid -except-
            // * primary key values are valid when not-empty, otherwise they're invalid
            // * attribute cardinality is 0..*

            // The flags used in the metadata therefore contradict the defaults, e.g. you have to
            // set an attribute to 'hidden' if you don't want to show it. This means the metadata
            // only has to provide overrides and can therefore be pretty small.

            this.getMetadata = getMetadata;
            this.isValid = isValid;
            this.isHidden = isHidden;
            this.getReferences = getReferences;
            this.getCardinality = getCardinality;

            function isHidden(objectType, attributes, attribute) {
                var md = getMetadata(objectType, attribute.name).hidden;
                if (!md) {
                    return false;
                }
                return evaluateMetadata(objectType, attributes, attribute, md);
            }

            function isInvalid(objectType, attributes, attribute) {
                checkTypes(arguments, ['string', 'array', 'object']);
                var md = getMetadata(objectType, attribute.name);
                if (!md.invalid) {
                    // primary keys are invalid if they're empty
                    return md.primaryKey ? !attribute.value : false;
                }
                // checks a list of attrs to see if any are invalid. each attr has an 'invalid'
                // definition in the metadata, or, if not, it's valid by default.
                var mustBeValid = [];
                if (typeOf(md.invalid) === 'string') {
                    mustBeValid.push(_.find(attributes, function (o) {
                        return o.name === md.invalid;
                    }));
                } else if (typeOf(md.invalid) === 'array') {
                    _.forEach(md.invalid, function (mdvalue) {
                        if (typeOf(mdvalue) === 'string') {
                            mustBeValid.push(_.find(attributes, function (o) {
                                return o.name === mdvalue;
                            }));
                        }
                    });
                }
                // Check every attribute for validity
            }

            function isValid(objectType, attributes, attribute) {
                return !isInvalid(objectType, attributes, attribute);
            }

            function evaluateMetadata(objectType, attributes, attribute, attrMetadata) {
                if (attrMetadata && attrMetadata.invalid) {
                    // checks a list of attrs to see if any are invalid. each attr has an 'invalid'
                    // definition in the metadata, or, if not, it's valid by default.
                    var mustBeValid = [];
                    if (typeOf(attrMetadata.invalid) === 'string') {
                        mustBeValid = mustBeValid.concat(_.filter(attributes, function (o) {
                            return o.name === attrMetadata.invalid;
                        }));
                    } else if (typeOf(attrMetadata.invalid) === 'array') {
                        _.forEach(attrMetadata.invalid, function (attrName) {
                            var found = _.filter(attributes, function (o) {
                                return o.name === attrName;
                            });
                            mustBeValid = mustBeValid.concat(found);
                        });
                    } else {
                        console.log('');
                    }
                    var invalidAttrs = _.filter(mustBeValid, function (attr) {
                        return isInvalid(objectType, attributes, attr);
                    });
                    return invalidAttrs.length !== 0;
                } else {
                    return false;
                }
            }

            function getReferences(objectType, attributeName) {
                return getMetadata(objectType, attributeName).refs;
            }

            function getMetadata(objectType, attributeName) {
                checkTypes(arguments, ['string', 'string']);
                if (typeof objectType === 'string' && typeof attributeName === 'string' && objectType && attributeName) {
                    if (!objectMetadata[objectType]) {
                        throw Error('There is no metadata for ', objectType);
                    }
                    return objectMetadata[objectType][attributeName];
                } else {
                    throw Error('AttributeMetadataService.getMetadata takes two non-empty strings');
                }
            }

            function getCardinality(objectType, attributeName) {
                checkTypes(arguments, ['string', 'string']);
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

            function typeOf(obj) {
                return {}.toString.call(obj).match(/\s(\w+)/)[1].toLowerCase();
            }

            function checkTypes(args, types) {
                args = [].slice.call(args);
                for (var i = 0; i < types.length; ++i) {
                    if (typeOf(args[i]) !== types[i]) {
                        throw new TypeError('param ' + i + ' must be of type ' + types[i]);
                    }
                }
            }

            /*
             * Metadata evaluation functions
             */
            function validatePrefix(objectType, attributes, attribute) {
                return PrefixService.validatePrefix(attribute.value);
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
                    prefix: {minOccurs: 1, maxOccurs: 1, primaryKey: true, invalid: validatePrefix},
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
