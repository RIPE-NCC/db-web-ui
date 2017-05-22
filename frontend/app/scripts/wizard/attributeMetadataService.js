/*global _, angular*/

(function () {
    'use strict';

    angular.module('dbWebApp'
    ).service('AttributeMetadataService', ['$rootScope', 'jsUtilService', 'PrefixService', 'WhoisMetaService', function ($rootScope, jsUtils, PrefixService, WhoisMetaService) {

        // Defaults:
        // * attributes are shown
        // * attribute values are valid -except-
        // * empty primary key values are invalid
        // * when attribute cardinality is 1..* and it's not on the form, or value is empty

        // The flags used in the metadata contradict the defaults, e.g. you have to set an
        // attribute to 'hidden' if you don't want to show it. This means the metadata only
        // has to provide overrides and can therefore be pretty small

        this.enrich = enrich;
        this.clearLastPrefix = clearLastPrefix;
        this.getMetadata = getMetadata;
        this.getAllMetadata = getAllMetadata;
        this.isInvalid = isInvalid;
        this.isHidden = isHidden;
        this.getCardinality = getCardinality;
        this.determineAttributesForNewObject = determineAttributesForNewObject;
        this.resetDomainLookups = resetDomainLookups;
        this.isList = isList;

        function determineAttributesForNewObject(objectType) {
            var i, attributes = [];
            _.forEach(getAllMetadata(objectType), function (val, key) {
                if (val.minOccurs) {
                    for (i = 0; i < val.minOccurs; i++) {
                        attributes.push({name: key, value: ''});
                    }
                }
            });
            return attributes;
        }

        function enrich(objectType, attributes) {
            jsUtils.checkTypes(arguments, ['string', 'array']);
            var i;
            for (i = 0; i < attributes.length; i++) {
                attributes[i].$$invalid = isInvalid(objectType, attributes, attributes[i]);
                attributes[i].$$hidden = isHidden(objectType, attributes, attributes[i]);
                attributes[i].$$disable = isReadOnly(objectType, attributes, attributes[i]);
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
            if (md) {
                if (md.invalid) {
                    // use invalid to check it
                    return evaluateMetadata(objectType, attributes, attribute, md.invalid);
                } else if (md.primaryKey || md.minOccurs > 0) {
                    // pks and mandatory must have value
                    return !attribute.value;
                }
            }
            return false;
        }

        function isReadOnly(objectType, attributes, attribute) {
            jsUtils.checkTypes(arguments, ['string', 'array', 'object']);
            var md = getMetadata(objectType, attribute.name);
            if (!md || !md.readOnly) {
                return false;
            }
            return evaluateMetadata(objectType, attributes, attribute, md.readOnly);
        }

        function evaluateMetadata(objectType, attributes, attribute, attrMetadata) {
            jsUtils.checkTypes(arguments, ['string', 'array', 'object']);
            var i, target;
            if (jsUtils.typeOf(attrMetadata) === 'boolean') {
                return attrMetadata;
            }
            if (jsUtils.typeOf(attrMetadata) === 'function') {
                try {
                    attribute.$$error = '';
                    return attrMetadata(objectType, attributes, attribute);
                } catch (e) {
                    attribute.$$error = e;
                    return true;
                }
            }
            if (jsUtils.typeOf(attrMetadata) === 'regexp') {
                if (jsUtils.typeOf(attribute.value) !== 'string') {
                    return true;
                }
                // negate cz test is for IN-valid or UN-hidden (i.e. 'visible') & regex is for a +ve match
                return !attrMetadata.test(attribute.value);
            }
            if (jsUtils.typeOf(attrMetadata) === 'array') {
                // handles { ..., invalid: [RegExp, invalid: ['attr1', 'attr2'], Function]}
                return -1 !== _.findIndex(attrMetadata, function (item) {
                        if (jsUtils.typeOf(item) === 'string') {
                            // must be 'invalid' or 'hidden' or 'readOnly'
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
            if (jsUtils.typeOf(attrMetadata) !== 'object' || !(attrMetadata.invalid || attrMetadata.hidden || attrMetadata.readOnly)) {
                return false;
            }
            // Evaluate the 'invalid's and return the first true result
            if (jsUtils.typeOf(attrMetadata.invalid) === 'string') {
                target = _.filter(attributes, function (o) {
                    return o.name === attrMetadata.invalid;
                });
                for (i = 0; i < target.length; i++) {
                    target[i].$$invalid = isInvalid(objectType, attributes, target[i]);
                    if (target[i].$$invalid) {
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
                            target[i].$$invalid = isInvalid(objectType, attributes, target[i]);
                            if (target[i].$$invalid) {
                                return true;
                            }
                        }
                    });
            }
            // TODO: 'hidden' and 'readOnly' - string and array
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
         *
         * https://jira.ripe.net/browse/DB-220
         *
         * If there is an existing domain within the specified prefix, display an error.
         * Find any domain objects for a given prefix, using TWO queries:
         *
         * (1) exact match: -d --exact -T domain -r 193.193.200.0 - 193.193.200.255
         *
         * (2) ALL more specific (excluding exact match) : -d --all-more -T domain -r ...
         *
         * If any domain objects are returned from either query, then display an error.
         */
        var existingDomains = {};
        var existingDomainTo;

        function resetDomainLookups(prefix) {
            if (jsUtils.typeOf(prefix) === 'string') {
                delete existingDomains[prefix];
            }
        }

        function domainsAlreadyExist(objectType, attributes, attribute) {
            if (!attribute.value) {
                attribute.$$info = '';
                attribute.$$error = '';
                return true;
            }
            var existing = existingDomains[attribute.value];
            if (angular.isNumber(existing)) {
                if (existing) {
                    attribute.$$info = '';
                    attribute.$$error = 'Domains already exist under this prefix';
                } else {
                    attribute.$$info = 'Prefix looks OK';
                    attribute.$$error = '';
                }
                return existing;
            }
            var doCall = function () {
                // otherwise find the domains and put them in the cache
                PrefixService.findExistingDomainsForPrefix(attribute.value).then(function (results) {
                    var domainsInTheWay = 0;
                    _.forEach(results, function (result) {
                        if (result && result.data && result.data.objects) {
                            domainsInTheWay += result.data.objects.object.length;
                        }
                    });
                    existingDomains[attribute.value] = domainsInTheWay;
                    // let the evaluation engine know that we've got a new value
                    $rootScope.$broadcast('attribute-state-changed', attribute);
                }, function () {
                    existingDomains[attribute.value] = 0;
                });
            };
            if (existingDomainTo) {
                clearTimeout(existingDomainTo);
            }
            existingDomainTo = setTimeout(doCall, 600);
            return true;
        }

        var lastPrefix;
        var cachedResponses = {};

        function clearLastPrefix() {
            lastPrefix = '';
        }

        function prefixIsInvalid(objectType, attributes, attribute) {

            if (!attribute.value) {
                attribute.$$info = '';
                attribute.$$error = '';
                return true;
            }

            if (lastPrefix === attribute.value) {
                // don't bother. it's just an extraneous evaluation of the prefix
                return;
            }

            cachedResponses = {}; // prefix changed, so empty the cache
            if (PrefixService.isValidPrefix(attribute.value)) {
                lastPrefix = attribute.value;
                $rootScope.$broadcast('prefix-ok', attribute.value);
                attribute.$$info = 'Prefix looks OK';
                attribute.$$error = '';
                return false;
            }

            attribute.$$info = '';
            attribute.$$error = 'Invalid prefix notation';
            return true;
        }

        var hostnameRe = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/;
        var timeout;

        function nserverIsInvalid(objectType, attributes, attribute) {

            if (!attribute.value) {
                return true;
            }

            var reverseZone = _.find(attributes, function (item) {
                return item.name === 'reverse-zone';
            });

            if (!reverseZone || !reverseZone.value.length) {
                // no zones?
                attribute.$$info = '';
                attribute.$$error = 'No reverse zones';
                return true;
            }

            if (attribute.value && PrefixService.getAddress(attribute.value)) {
                attribute.$$info = '';
                attribute.$$error = 'IP notation not allowed, use a fully qualified domain name';
                return true;
            }
            // check it looks sth like a hostname
            if (!hostnameRe.exec(attribute.value)) {
                attribute.$$info = '';
                attribute.$$error = '';
                return true;
            }
            var keepTrying = 4;
            var sameValList = _.filter(attributes, function (attr) {
                return attribute.name === attr.name && attribute.value === attr.value;
            });
            if (sameValList.length > 1) {
                // should have found itself once, otherwise it's a dupe
                attribute.$$info = '';
                attribute.$$error = 'Duplicate value';
                return true;
            }
            if (angular.isObject(cachedResponses[attribute.value])) {
                var result = cachedResponses[attribute.value];
                if (result.code === 0) {
                    attribute.$$info = result.message;
                    attribute.$$error = '';
                    attribute.$$invalid = false;
                } else {
                    attribute.$$info = '';
                    attribute.$$error = result.message;
                    attribute.$$invalid = true;
                }
                return attribute.$$invalid;
            }

            var doCall = function () {
                attribute.$$info = 'Checking name server...';
                attribute.$$error = '';

                // any reverse zone will do
                PrefixService.checkNameserverAsync(attribute.value, reverseZone.value[0].value).then(function (resp) {

                    if (!resp || !resp.data || !angular.isNumber(resp.data.code)) {
                        cachedResponses[attribute.value] = {code: -1, message: 'No response during check'};
                        return;
                    }
                    var nserverResult = resp.data;
                    if (nserverResult.ns !== attribute.value) {
                        // ignore this result. input has changed since req was fired
                        return;
                    }
                    cachedResponses[attribute.value] = nserverResult;
                    // put response in cache
                    $rootScope.$broadcast('attribute-state-changed', attribute);
                }, function (err) {
                    if (err.status === 404) {
                        cachedResponses[attribute.value] = {code: -1, message: 'FAILED'};
                        $rootScope.$broadcast('attribute-state-changed', attribute);
                    } else if (keepTrying) {
                        keepTrying -= 1;
                        if (timeout) {
                            clearTimeout(timeout);
                        }
                        timeout = setTimeout(doCall, 1000);
                    } else {
                        cachedResponses[attribute.value] = {code: -1, message: 'FAILED'};
                        $rootScope.$broadcast('attribute-state-changed', attribute);
                    }
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

        function isModifyMode(objectType, attributes) {
            // If 'created' is filled, we're modifying
            var created = _.find(attributes, function (item) {
                return item.name.toUpperCase() === 'CREATED';
            });
            return created && typeof created.value === 'string';
        }

        function isList(objectType, attribute) {
            var md = getMetadata(objectType, attribute.name);
            if (md) {
                if (md.staticList || md.refs) {
                    return true;
                }
            }
            return false;
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
        var objectMetadata = makeObjectMetadata();

        function convertMeta(obj) {
            var newObj = {};

            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }
                var o = obj[key];
                var n = {};

                for (var i = 0; i < o.attributes.length; i++) {
                    var a = o.attributes[i];
                    var p = {};
                    if (a.primaryKey) {
                        p.primaryKey = a.primaryKey;
                        p.maxOccurs = 1;
                        p.minOccurs = 1;
                    }
                    if (a.mandatory) {
                        p.minOccurs = 1;
                    }
                    if (!a.multiple) {
                        p.maxOccurs = 1;
                    }
                    if (a.refs && a.refs.length > 0) {
                        p.refs = a.refs;
                    }
                    if (a.searchable) {
                        p.searchable = a.searchable;
                    }
                    if (a.isEnum) {
                       p.staticList = true;
                    }
                    n[a.name] = p;
                }
                newObj[key] = n;
            }
            return newObj;
        }

        function makeObjectMetadata() {
            var metadata = convertMeta(WhoisMetaService._objectTypesMap);

            // add some custom wizard-related attributes hostname
            metadata.domain.nserver = {minOccurs: 2};

            metadata.prefix = {
                prefix: {minOccurs: 1, maxOccurs: 1, primaryKey: true, invalid: [prefixIsInvalid, domainsAlreadyExist], hidden: {invalid: ['mnt-by']}},
                descr: {},
                nserver: {minOccurs: 2, hidden: {invalid: 'prefix'}, invalid: nserverIsInvalid},
                'reverse-zone': {minOccurs: 1, maxOccurs: 1, hidden: {invalid: ['prefix', 'nserver']}},
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
                source: {readOnly: true, minOccurs: 1, maxOccurs: 1, hidden: {invalid: ['mnt-by']}}
            };

            // Here we assume that the basic rules are the same for these attributes
            var attrs = ['aut-num', 'inetnum', 'inet6num'];
            for (var a in attrs) {
              var aName = attrs[a];
              metadata[aName][aName].invalid = [];
              metadata[aName][aName].hidden = {invalid: ['mnt-by']};
              metadata[aName][aName].readOnly = isModifyMode;

              metadata[aName].org.readOnly = true;
              metadata[aName]['sponsoring-org'].readOnly = true; // TODO: needs to be calculated. also: sponsoring-org and org-type
              metadata[aName].status.readOnly = isModifyMode;
              metadata[aName].source.readOnly = isModifyMode;
            }
            metadata.inetnum.netname.readOnly = isModifyMode;
            metadata.inet6num.netname.readOnly = isModifyMode;

            return metadata;
        }
    }]);
})();
