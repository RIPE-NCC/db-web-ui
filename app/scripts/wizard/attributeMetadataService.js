/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).service('AttributeMetadataService', ['constants',
        function (constants) {

            this.getMetadata = getMetadata;
            this.isValid = isValid;
            this.isHidden = isHidden;
            this.getReferences = getReferences;
            this.getCardinality = getCardinality;

            function evaluateMetadata(objectType, attributes, attribute, attrMetadata) {
                //var metadata = getMetadata(objectType, attribute.name);
                console.log('evaluateMetadataExpression', objectType, attributes, attribute, attrMetadata);
                var result = true;
                if (attrMetadata && attrMetadata.invalid) {
                    // checks a list of attrs to see if any are invalid. each attr has an 'invalid'
                    // definition in the metadata, or, if not, it's valid by default.
                    var mustBeValid = [];
                    if (typeof attrMetadata.invalid === 'string') {
                        mustBeValid.push(_.find(attributes, function (o) {
                            return o.name === attrMetadata.invalid;
                        }));
                    } else if (angular.isArray(attrMetadata.invalid)) {
                        _.forEach(attrMetadata.invalid, function (attrName) {
                            mustBeValid.push(_.find(attributes, function (o) {
                                return o.name === attrName;
                            }));
                        });
                    }
                } else {
                    return false;
                }
                return result;
            }

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
                    _.forEach(md.invalid, function (attrName) {
                        mustBeValid.push(_.find(attributes, function (o) {
                            return o.name === attrName;
                        }));
                    });
                }
                // Check every attribute for validity
            }

            function isValid(objectType, attributes, attribute) {
                return !isInvalid(objectType, attributes, attribute);
            }

            function getReferences(objectType, attributeName) {
                return getMetadata(objectType, attributeName).refs;
            }

            function getMetadata(objectType, attributeName) {
                checkTypes(arguments, ['string', 'string']);
                if (typeof objectType === 'string' && typeof attributeName === 'string' && objectType && attributeName) {
                    if (!constants.ObjectMetadata[objectType]) {
                        throw Error('There is no metadata for ', objectType);
                    }
                    return constants.ObjectMetadata[objectType][attributeName];
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

        }]);

})();
