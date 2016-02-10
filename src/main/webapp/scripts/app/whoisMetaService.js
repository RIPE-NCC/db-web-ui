'use strict';

angular.module('dbWebApp')
    .service('WhoisMetaService', ['CountryCodes', function (CountryCodes) {

        this._getDocumentationForAttribute = function(objectType, attrName, docKind) {
            var doc = undefined;
            if (attrName === 'mp-peer') {
                doc = this._mpPeerDoc[objectType];
            } else if (attrName === 'mnt-routes') {
                doc = this._mntRoutesDoc[objectType];
            } else if (attrName === 'status') {
                doc = this._statusDoc[objectType];
            }
            if (_.isUndefined(doc)) {
                doc = this._attrDocumentation[attrName];
            }

            if (!_.isUndefined(doc)) {
                return doc[docKind]
            }
            return doc;
        };

        this.getAttributeShortDescription = function (objectType, attrName) {
            var short = this._getDocumentationForAttribute(objectType, attrName, 'short');
            if (_.isUndefined(short)) {
                short = this._getDocumentationForAttribute(objectType, attrName, 'description');
            }
            return short;
        };

        this.getAttributeDescription = function (objectType, attrName) {
            return this._getDocumentationForAttribute(objectType, attrName, 'description' );
        };

        this.getAttributeSyntax = function (objectType, attrName) {
            return this._getDocumentationForAttribute(objectType, attrName, 'syntax');
        };

        this._getMetaAttributesOnObjectType = function (objectTypeName, mandatoryOnly) {
            if (!objectTypeName || !this._objectTypesMap[objectTypeName]) {
                return [];
            }
            if (mandatoryOnly === false) {
                return this._objectTypesMap[objectTypeName].attributes;
            }
            return this._objectTypesMap[objectTypeName].attributes.filter(
                function (attr) {
                    return attr.mandatory === mandatoryOnly;
                }
            );
        };

        this.findMetaAttributeOnObjectTypeAndName = function (objectTypeName, attributeName) {
            if (!objectTypeName || !this._objectTypesMap[objectTypeName]) {
                return undefined;
            }
            return _.find(this._objectTypesMap[objectTypeName].attributes,
                function (attr) {
                    return attr.name === attributeName;
            });
        };

        this.getObjectTypes = function () {
            var keys = [];
            for (var key in this._objectTypesMap) {
                keys.push(key);
            }
            return keys;
        };

        function _wrapMetaInAttribute( self, objectTypeName, attrName, attrValue, attrComment, attrLink, reffedAttrType, metaAttribute, idx ) {
            return {
                name: attrName,
                value: attrValue,
                comment: attrComment,
                link: attrLink,
                'referenced-type':reffedAttrType,
                $$meta: {
                    $$idx: idx,
                    $$mandatory: metaAttribute.mandatory,
                    $$multiple: metaAttribute.multiple,
                    $$primaryKey: metaAttribute.primaryKey,
                    $$short: self.getAttributeShortDescription(objectTypeName, metaAttribute.name),
                    $$description: self.getAttributeDescription(objectTypeName, metaAttribute.name),
                    $$syntax: self.getAttributeSyntax(objectTypeName, metaAttribute.name),
                    $$refs: metaAttribute.refs,
                    $$allowedValues: metaAttribute.allowedValues
                }
            }
        }

        this.enrichAttributesWithMetaInfo = function (objectTypeName, attrs) {
            if(_.isUndefined(objectTypeName) || _.isUndefined(attrs)) {
                return attrs;
            }
            var attrsMeta = this._getMetaAttributesOnObjectType(objectTypeName, false);

            var self = this;
            var enrichedAttrs = [];
            _.each(attrs, function (attr) {
                var attrMeta = _.find(attrsMeta, function (am) {
                    return am.name === attr.name;
                });
                if( !_.isUndefined(attrMeta) ) {
                    var idx;
                    if (!_.isUndefined(attr.$$meta)) {
                        idx = attr.$$meta.$$idx;
                    }
                    enrichedAttrs.push(_wrapMetaInAttribute(self, objectTypeName, attr.name, attr.value, attr.comment, attr.link, attr['referenced-type'], attrMeta, idx));
                }
            });

            return enrichedAttrs;
        };

        this.getAllAttributesOnObjectType = function (objectTypeName) {
            if (objectTypeName === null) {
                return [];
            }

            var self = this;

            // enrich with order info
            var idx = 0;
            return _.map(this._getMetaAttributesOnObjectType(objectTypeName, false), function (meta) {
                var wrapped = _wrapMetaInAttribute(self, objectTypeName, meta.name, undefined, undefined, undefined, undefined, meta, idx);
                idx++;
                return wrapped;
            });
        };

        this.getMandatoryAttributesOnObjectType = function (objectTypeName) {
            if (objectTypeName === null) {
                return [];
            }
            var self = this;

            // enrich with order info
            var idx = 0;
            return _.map(this._getMetaAttributesOnObjectType(objectTypeName, true), function (meta) {
                var wrapped = _wrapMetaInAttribute(self, objectTypeName, meta.name, '', undefined, undefined, undefined, meta, idx);
                idx++;
                return wrapped;
            });
        };

        this._objectTypesMap = {
            'as-block': {
                name: 'as-block', description: undefined,
                'attributes': [
                    {name: 'as-block', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: false, multiple: true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: false, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'as-set': {
                name: 'as-set', description: undefined,
                'attributes': [
                    {name: 'as-set', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'members', mandatory: false, multiple: true, refs: []},
                    {name: 'mbrs-by-ref', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'aut-num': {
                name: 'aut-num', description: undefined,
                'attributes': [
                    {name: 'aut-num', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'as-name', mandatory: true, multiple: false, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'member-of', mandatory: false, multiple: true, refs: ['AS_SET', 'ROUTE_SET', 'RTR_SET']},
                    {name: 'import-via', mandatory: false, multiple: true, refs: []},
                    {name: 'import', mandatory: false, multiple: true, refs: []},
                    {name: 'mp-import', mandatory: false, multiple: true, refs: []},
                    {name: 'export-via', mandatory: false, multiple: true, refs: []},
                    {name: 'export', mandatory: false, multiple: true, refs: []},
                    {name: 'mp-export', mandatory: false, multiple: true, refs: []},
                    {name: 'default', mandatory: false, multiple: true, refs: []},
                    {name: 'mp-default', mandatory: false, multiple: true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'sponsoring-org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'status', mandatory: false, multiple: false, refs: [], allowedValues:['ASSIGNED','LEGACY','OTHER']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'domain': {
                name: 'domain', description: undefined,
                'attributes': [
                    {name: 'domain', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'zone-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'nserver', mandatory: true, multiple: true, refs: []},
                    {name: 'ds-rdata', mandatory: false, multiple: true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'filter-set': {
                name: 'filter-set', description: undefined,
                'attributes': [
                    {name: 'filter-set', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'filter', mandatory: false, multiple: false, refs: []},
                    {name: 'mp-filter', mandatory: false, multiple: false, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'inet6num': {
                name: 'inet6num', description: undefined,
                'attributes': [
                    {name: 'inet6num', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'netname', mandatory: true, multiple: false, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'country', mandatory: true, multiple: true, refs: [], allowedValues: CountryCodes.get()},
                    {name: 'geoloc', mandatory: false, multiple: false, refs: []},
                    {name: 'language', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'sponsoring-org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'status', mandatory: true, multiple: false, refs: [], allowedValues:['ALLOCATED-BY-RIR','ALLOCATED-BY-LIR','AGGREGATED-BY-LIR','ASSIGNED','ASSIGNED ANYCAST','ASSIGNED PI']},
                    {name: 'assignment-size', mandatory: false, multiple: false, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-domains', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-irt', mandatory: false, multiple: true, refs: ['IRT']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'inetnum': {
                name: 'inetnum', description: undefined,
                'attributes': [
                    {name: 'inetnum', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'netname', mandatory: true, multiple: false, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'country', mandatory: true, multiple: true, refs: [], allowedValues: CountryCodes.get()},
                    {name: 'geoloc', mandatory: false, multiple: false, refs: []},
                    {name: 'language', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'sponsoring-org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'status', mandatory: true, multiple: false, refs: [], allowedValues: ['ALLOCATED PA','ALLOCATED PI','ALLOCATED UNSPECIFIED','LIR-PARTITIONED PA','LIR-PARTITIONED PI', 'SUB-ALLOCATED PA','ASSIGNED PA','ASSIGNED PI','ASSIGNED ANYCAST','EARLY-REGISTRATION','NOT-SET','LEGACY']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-domains', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-irt', mandatory: false, multiple: true, refs: ['IRT']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'inet-rtr': {
                name: 'inet-rtr', description: undefined,
                'attributes': [
                    {name: 'inet-rtr', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'alias', mandatory: false, multiple: true, refs: []},
                    {name: 'local-as', mandatory: true, multiple: false, refs: []},
                    {name: 'ifaddr', mandatory: true, multiple: true, refs: []},
                    {name: 'interface', mandatory: false, multiple: true, refs: []},
                    {name: 'peer', mandatory: false, multiple: true, refs: []},
                    {name: 'mp-peer', mandatory: false, multiple: true, refs: []},
                    {name: 'member-of', mandatory: false, multiple: true, refs: ['AS_SET', 'ROUTE_SET', 'RTR_SET']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'irt': {
                name: 'irt', description: undefined,
                'attributes': [
                    {name: 'irt', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'address', mandatory: true, multiple: true, refs: []},
                    {name: 'phone', mandatory: false, multiple: true, refs: []},
                    {name: 'fax-no', mandatory: false, multiple: true, refs: []},
                    {name: 'e-mail', mandatory: true, multiple: true, refs: []},
                    {name: 'abuse-mailbox', mandatory: false, multiple: true, refs: []},
                    {name: 'signature', mandatory: false, multiple: true, refs: ['KEY_CERT']},
                    {name: 'encryption', mandatory: false, multiple: true, refs: ['KEY_CERT']},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'auth', mandatory: true, multiple: true, refs: ['KEY_CERT']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'irt-nfy', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'key-cert': {
                name: 'key-cert', description: undefined,
                'attributes': [
                    {name: 'key-cert', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'method', mandatory: false, multiple: false, refs: []},
                    {name: 'owner', mandatory: false, multiple: true, refs: []},
                    {name: 'fingerpr', mandatory: false, multiple: false, refs: []},
                    {name: 'certif', mandatory: true, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'admin-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'mntner': {
                name: 'mntner', description: undefined,
                'attributes': [
                    {name: 'mntner', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'upd-to', mandatory: true, multiple: true, refs: []},
                    {name: 'mnt-nfy', mandatory: false, multiple: true, refs: []},
                    {name: 'auth', mandatory: true, multiple: true, refs: ['KEY_CERT']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'abuse-mailbox', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'organisation': {
                name: 'organisation', description: undefined,
                'attributes': [
                    {name: 'organisation', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'org-name', mandatory: true, multiple: false, refs: []},
                    {name: 'org-type', mandatory: true, multiple: false, refs: []},
                    {name: 'descr', mandatory: false, multiple: true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'address', mandatory: true, multiple: true, refs: []},
                    {name: 'phone', mandatory: false, multiple: true, refs: []},
                    {name: 'fax-no', mandatory: false, multiple: true, refs: []},
                    {name: 'e-mail', mandatory: true, multiple: true, refs: []},
                    {name: 'geoloc', mandatory: false, multiple: false, refs: []},
                    {name: 'language', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'abuse-c', mandatory: false, multiple: false, refs: ['ROLE']},
                    {name: 'ref-nfy', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-ref', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'abuse-mailbox', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'peering-set': {
                name: 'peering-set', description: undefined,
                'attributes': [
                    {name: 'peering-set', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'peering', mandatory: false, multiple: true, refs: []},
                    {name: 'mp-peering', mandatory: false, multiple: true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'person': {
                name: 'person', description: undefined,
                'attributes': [
                    {name: 'person', mandatory: true, multiple: false, refs: []},
                    {name: 'address', mandatory: true, multiple: true, refs: []},
                    {name: 'phone', mandatory: true, multiple: true, refs: []},
                    {name: 'fax-no', mandatory: false, multiple: true, refs: []},
                    {name: 'e-mail', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'nic-hdl', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'abuse-mailbox', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'poem': {
                name: 'poem', description: undefined,
                'attributes': [
                    {name: 'poem', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: false, multiple: true, refs: []},
                    {name: 'form', mandatory: true, multiple: false, refs: ['POETIC_FORM']},
                    {name: 'text', mandatory: true, multiple: true, refs: []},
                    {name: 'author', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: false, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'poetic-form': {
                name: 'poetic-form', description: undefined,
                'attributes': [
                    {name: 'poetic-form', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: false, multiple: true, refs: []},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'role': {
                name: 'role', description: undefined,
                'attributes': [
                    {name: 'role', mandatory: true, multiple: false, refs: []},
                    {name: 'address', mandatory: true, multiple: true, refs: []},
                    {name: 'phone', mandatory: false, multiple: true, refs: []},
                    {name: 'fax-no', mandatory: false, multiple: true, refs: []},
                    {name: 'e-mail', mandatory: true, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'nic-hdl', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'abuse-mailbox', mandatory: false, multiple: false, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'route': {
                name: 'route', description: undefined,
                'attributes': [
                    {name: 'route', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'origin', mandatory: true, multiple: false, primaryKey: true, refs: ['AUT_NUM']},
                    {name: 'pingable', mandatory: false, multiple: true, refs: []},
                    {name: 'ping-hdl', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'holes', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'member-of', mandatory: false, multiple: true, refs: ['AS_SET', 'ROUTE_SET', 'RTR_SET']},
                    {name: 'inject', mandatory: false, multiple: true, refs: []},
                    {name: 'aggr-mtd', mandatory: false, multiple: false, refs: []},
                    {name: 'aggr-bndry', mandatory: false, multiple: false, refs: []},
                    {name: 'export-comps', mandatory: false, multiple: false, refs: []},
                    {name: 'components', mandatory: false, multiple: false, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'route6': {
                name: 'route6', description: undefined,
                'attributes': [
                    {name: 'route6', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'origin', mandatory: true, multiple: false, primaryKey: true, refs: ['AUT_NUM']},
                    {name: 'pingable', mandatory: false, multiple: true, refs: []},
                    {name: 'ping-hdl', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'holes', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'member-of', mandatory: false, multiple: true, refs: ['AS_SET', 'ROUTE_SET', 'RTR_SET']},
                    {name: 'inject', mandatory: false, multiple: true, refs: []},
                    {name: 'aggr-mtd', mandatory: false, multiple: false, refs: []},
                    {name: 'aggr-bndry', mandatory: false, multiple: false, refs: []},
                    {name: 'export-comps', mandatory: false, multiple: false, refs: []},
                    {name: 'components', mandatory: false, multiple: false, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'route-set': {
                name: 'route-set', description: undefined,
                'attributes': [
                    {name: 'route-set', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'members', mandatory: false, multiple: true, refs: []},
                    {name: 'mp-members', mandatory: false, multiple: true, refs: []},
                    {name: 'mbrs-by-ref', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'rtr-set': {
                name: 'rtr-set', description: undefined,
                'attributes': [
                    {name: 'rtr-set', mandatory: true, multiple: false, primaryKey: true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'members', mandatory: false, multiple: true, refs: []},
                    {name: 'mp-members', mandatory: false, multiple: true, refs: []},
                    {name: 'mbrs-by-ref', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            }
        };

        // Structure below holds syntax that occur more than once
        var _shared = {
            email: {
                syntax: 'A valid email address, e.g. user@example.net.'
            },
            nicHandle: {
                syntax: 'From 2 to 4 characters, followed by up to 6 digits and a source specification. The first digit must not be \"0\". The source specification is \"-RIPE\" for the RIPE Database.'
            },
            freeForm: {
                syntax: 'Any free-form text using <a href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1#Codepage_layout" target="_blank">Latin-1 character encoding</a>.'
            },
            objectName: {
                syntax: 'Made up of letters, digits, the underscore \"_\" and hyphen \"-\". The first character of a name must be a letter, and the last character a letter or digit. Note that <a href="https://tools.ietf.org/html/rfc2622#section-2" target="_blank">certain words are reserved by RPSL</a> and cannot be used.'
            },
            asNumber: {
                syntax: 'The letters \"AS\" followed by an integer in the range from 0 to 4294967295, e.g. AS65536'
            },
            keyCert: {
                syntax: 'PGPKEY-&lt;id&gt;, where &lt;id&gt; is the PGP key ID of the public key in 8-digit hexadecimal format without the \"0x\" prefix.'
            },
            phone: {
                syntax: 'Contact telephone number including country code. Can take one of the forms:' + '<br/>' +
                '+&lt;integer-list&gt;' + '<br/>' +
                '+&lt;integer-list&gt; \"(\" &lt;integer-list&gt; \")\" &lt;integer-list&gt;' + '<br/>' +
                '+&lt;integer-list&gt; ext. &lt;integer list&gt;' + '<br/>' +
                '+&lt;integer-list&gt; \"(\" integer list \")\" &lt;integer-list&gt; ext. &lt;integer-list&gt;'
            },
            generated: {
                syntax: 'Attribute generated by server.'
            },
            poeticForm: {
                syntax: 'FORM-&lt;string&gt;' + '<br/>' + '&lt;string&gt; can be made up of letters, digits, the underscore \"_\" and hyphen \"-\".'
            },
            irt: {
                syntax: 'An irt name is made up of letters, digits, the underscore \"_\" and hyphen \"-\". It must start with \"irt-\" and the last character of a name must be a letter or a digit.'
            },
            organisation: {
                syntax: 'The \"ORG-\" string followed by 2 to 4 characters, followed by up to 5 digits followed by a source specification. The first digit must not be \"0\". The source specification is \"-RIPE\" for the RIPE Database.'
            },
            organisationName: {
                syntax: 'A word may have up to 64 characters and is not case sensitive. Each word can have any combination of the above characters with no restriction on the start or end of a word.'
            },
            peer: {
                syntax: '&lt;protocol&gt; &lt;ipv4-address&gt; &lt;options&gt;' + '&lt;br/&gt;' +
                '| &lt;protocol&gt; &lt;inet-rtr-name&gt; &lt;options&gt;' + '&lt;br/&gt;' +
                '| &lt;protocol&gt; &lt;rtr-set-name&gt; &lt;options&gt;' + '&lt;br/&gt;' +
                '| &lt;protocol&gt; &lt;peering-set-name&gt; &lt;options&gt;'
            }
        };

        this._attrDocumentation = {
            'abuse-mailbox': {
                short: 'Specifies the email address for abuse complaints.',
                description: 'Specifies the email address to which abuse complaints should be sent. This attribute should only be used in the <strong>role</strong> object. <a href="https://www.ripe.net/manage-ips-and-asns/resource-management/abuse-c-information" target="_blank">Learn more.</a>',
                syntax: _shared.email.syntax
            },
            'abuse-c': {
                short: 'Enter the nic-handle of your abuse-c role object or click the \"bell\" icon to create one.',
                description: 'References an abuse contact. This can only be a <strong>role</strong> object containing an \"abuse-mailbox:\" attribute.',
                syntax: _shared.nicHandle.syntax
            },
            'address': {
                short: undefined,
                description: 'Specifies the full postal address of a contact.',
                syntax: _shared.freeForm.syntax
            },
            'admin-c': {
                short: 'Nic-handle of an administrative contact.',
                description: 'References an on-site administrative contact.',
                syntax: _shared.nicHandle.syntax
            },
            'aggr-bndry': {
                short: undefined,
                description: 'Defines a set of ASes which form the aggregation boundary.',
                syntax: '[&lt;as-expression&gt;]'
            },
            'aggr-mtd': {
                short: 'Specifies how the aggregate is generated, e.g. inbound',
                description: 'Specifies how the aggregate is generated.',
                syntax: 'inbound | outbound [&lt;as-expression&gt;]'
            },
            'alias': {
                short: undefined,
                description: 'The canonical DNS name for the router.',
                syntax: 'A fully qualified domain name with or without a trailing dot.'
            },
            'assignment-size': {
                short: 'Prefix size as a numeric value, e.g. 48',
                description: 'Specifies the size of blocks assigned to end users from this aggregated inet6num assignment.',
                syntax: 'Specifies a numeric value.'
            },
            'as-block': {
                short: undefined,
                description: 'Range of AS numbers.',
                syntax: '&lt;as-number&gt; - &lt;as-number&gt;'
            },
            'as-name': {
                short: undefined,
                description: 'A descriptive name associated with the AS.',
                syntax: _shared.objectName.syntax
            },
            'as-set': {
                short: undefined,
                description: 'Defines the name of the set.',
                syntax: 'An as-set name is made up of letters, digits, the underscore \"_\" and hyphen \"-\". It must start with \"as-\", and the last character of a name must be a letter or a digit. An as-set name can also be hierarchical. A hierarchical set name is a sequence of set names and AS numbers separated by colons \":\".  At least one component of such a name must be an actual set name (i.e. start with \"as-\"). All the set name components of a hierarchical as-name have to be as-set names.'
            },
            'auth': {
                short: 'Defines the authentication scheme, e.g. SSO user@example.net',
                description: 'Defines the authentication scheme to be used.',
                syntax: '<table>' +
                '<tr>' +
                '<th>auth-scheme</th>' +
                '<th>scheme-info</th>' +
                '<th>Notes</th>' +
                '</tr>' +
                '<tr>' +
                '<td>SSO</td>' +
                '<td>user@example.net</td>' +
                '<td>The email address used for your RIPE NCC Access account.</td>' +
                '</tr>' +
                '<tr>' +
                '<td>MD5-PW</td>' +
                '<td>encrypted password produced using the crypt_md5 algorithm</td>' +
                '<td>We strongly advise to use a complex password.</td>' +
                '</tr>' +
                '<tr>' +
                '<td>PGPKEY&#8209;&lt;id&gt;</td>' +
                '<td></td>' +
                '<td>&lt;id&gt; is the PGP key ID to be used for authentication.</td>' +
                '</tr>' +
                '</table>'
            },
            'author': {
                short: undefined,
                description: 'References a poem author.',
                syntax: _shared.nicHandle.syntax
            },
            'aut-num': {
                short: undefined,
                description: 'The Autonomous System Number, e.g. AS65536.',
                syntax: _shared.asNumber.syntax
            },
            'certif': {
                short: undefined,
                description: 'Contains the public key.',
                syntax: 'The value of the public key should be supplied using multiple \"certif:\" attributes. This is done by exporting the key from your local key ring in ASCII armored format and prepending each line with the string \"certif:\".'
            },
            'components': {
                short: 'Defines what component routes are used to form the aggregate.',
                description: 'The \"components:\" attribute defines what component routes are used to form the aggregate.',
                syntax: ''
            }, // no documentation available
            'country': {
                short: 'Identifies the country as a two-letter ISO 3166 code, e.g. NL',
                description: 'Identifies the country.',
                syntax: 'A valid two-letter ISO 3166 country code.'
            },
            'created': {
                short: 'Value will be generated by the server.',
                description: 'This attributes reflects when the object was created in ISO 8601 format (yyyy-MM-dd\'T\'HH:mm:ssZ).',
                syntax: _shared.generated.syntax
            },
            'default': {
                short: undefined,
                description: 'Specifies default routing policies.',
                syntax: 'to &lt;peering&gt; [action &lt;action&gt;] [networks &lt;filter&gt;]'
            },
            'descr': {
                short: undefined,
                description: 'A short description related to the object.',
                syntax: _shared.freeForm.syntax
            },
            'domain': {
                short: 'The reverse domain name, e.g. 5.2.0.192.in-addr.arpa',
                description: 'The reverse domain name.',
                syntax: 'A fully qualified domain name with or without a trailing dot.'
            },
            'ds-rdata': {
                short: undefined,
                description: 'DS records for this domain.',
                syntax: '&lt;Keytag&gt; &lt;Algorithm&gt; &lt;Digest type&gt; &lt;Digest&gt;' + '<br>' +
                'Keytag is represented by an unsigned decimal integer (0-65535).' + '<br>' +
                'Algorithm is represented by an unsigned decimal integer (0-255).' + '<br>' +
                'Digest type is represented by a unsigned decimal integer (0-255).' + '<br>' +
                'Digest is a digest in hexadecimal representation (case insensitive). Its length varies for various digest types. For digest type SHA-1 digest is represented by 20 octets (40 characters, plus possible spaces). For more details, see RFC4034.'
            },
            'encryption': {
                short: 'A reference to a CSIRT key-cert object',
                description: 'References a key-cert object representing a CSIRT public key used to encrypt correspondence sent to the CSIRT.',
                syntax: _shared.keyCert.syntax
            },
            'export': {
                short: undefined,
                description: 'Specifies an export policy expression.',
                syntax: '[protocol &lt;protocol-1&gt;] [into &lt;protocol-1&gt;]' + '<br/>' +
                ' to &lt;peering-1&gt; [action &lt;action-1&gt;]' + '<br/>' +
                '    .' + '<br/>' +
                '    .' + '<br/>' +
                '    .' + '<br/>' +
                ' to &lt;peering-N&gt; [action &lt;action-N&gt;]' +
                ' announce &lt;filter&gt;'
            },
            'export-comps': {
                short: 'Defines the set\'s policy filter.',
                description: 'Defines the set\'s policy filter, a logical expression which when applied to a set of routes returns a subset of these routes.',
                syntax: ''
            }, // no syntax available
            'e-mail': {
                short: 'The email address of a contact person.',
                description: 'The email address of a contact person. This attribute is filtered from the default whois output when at least one of the objects returned by the query contains an abuse-mailbox attribute.',
                syntax: _shared.email.syntax
            },
            'fax-no': {
                short: 'Fax number with country code, e.g. +44 161 715 1234.',
                description: 'The fax number of a contact.',
                syntax: _shared.phone.syntax
            },
            'filter': {
                short: undefined,
                description: 'Defines the set\'s policy filter.',
                syntax: 'Logical expression which when applied to a set of routes returns a subset of these routes. Please refer to RFC 2622 for more information.'
            },
            'filter-set': {
                short: undefined,
                description: 'Defines the name of the filter.',
                syntax: 'A filter-set name is made up of letters, digits, the underscore \"_\" and hyphen \"-\". It must start with \"fltr-\", and the last character of a name must be a letter or a digit. A filter-set name can also be hierarchical. A hierarchical set name is a sequence of set names and AS numbers separated  by colons \":\".  At least one component of such a name must  be an actual set name (i.e. start with \"fltr-\"). All the  set name components of a hierarchical filter-name have to be filter-set names.'
            },
            'fingerpr': {
                short: undefined,
                description: 'A fingerprint of a key certificate generated by the database.',
                syntax: _shared.generated.syntax
            },
            'form': {
                short: undefined,
                description: 'Specifies the identifier of a registered poem type.',
                syntax: _shared.poeticForm.syntax
            },
            'geoloc': {
                short: undefined,
                description: 'The location coordinates for the resource.',
                syntax: '<a href="https://en.wikipedia.org/wiki/Decimal_degrees" target="_blank">Decimal degrees</a> with negative numbers for South and West, e.g. 12.3456 -98.7654'
            },
            'holes': {
                short: 'Lists the component address prefixes that are not reachable through the aggregate route.',
                description: 'Lists the component address prefixes that are not reachable through the aggregate route (perhaps that part of the address space is unallocated).',
                syntax: 'A prefix in Classless Inter-Domain Routing (CIDR) notation.'
            },
            'ifaddr': {
                short: undefined,
                description: 'Specifies an interface address within an Internet router.',
                syntax: '&lt;ipv4-address&gt; masklen &lt;integer&gt; [action &lt;action&gt;]'
            },
            'import': {
                short: undefined,
                description: 'Specifies import policy expression.',
                syntax: '[protocol &lt;protocol-1&gt;] [into &lt;protocol-1&gt;]' + '<br/>' +
                'from &lt;peering-1&gt; [action &lt;action-1&gt;]' + '<br/>' +
                '   .' + '<br/>' +
                '   .' + '<br/>' +
                '   .' + '<br/>' +
                'from &lt;peering-N&gt; [action &lt;action-N&gt;]' + '<br/>' +
                'accept &lt;filter&gt;'
            },
            'inet6num': {
                short: undefined,
                description: 'Specifies the range of IPv6 addresses in CIDR notation.',
                syntax: 'A prefix in Classless Inter-Domain Routing (CIDR) notation, e.g. 2001:db8::/32'
            },
            'inetnum': {
                short: 'Specifies the range of IPv4 addresses in dash or CIDR notation.',
                description: 'Specifies a range of IPv4 that the inetnum object presents.',
                syntax: 'Specify a beginning and ending address separated by a hyphen (-), e.g. 192.168.2.0 - 192.168.2.255 or enter a prefix in Classless Inter-Domain Routing (CIDR) notation, e.g. 192.168.2.0/24.'
            },
            'inet-rtr': {
                short: undefined,
                description: 'Fully qualified DNS name of the inet-rtr without trailing dot.',
                syntax: 'Domain name in the format \"hostname.example.net\" with or without trailing dot.'
            },
            'inject': {
                short: 'Specifies which routers perform the aggregation.',
                description: 'Specifies which routers perform the aggregation and when they perform it.',
                syntax: ''
            }, // no syntax available
            'interface': {
                short: 'Specifies a multiprotocol interface address.',
                description: 'Specifies a multiprotocol interface address within an Internet router.',
                syntax: 'afi &lt;afi&gt; &lt;ipv4-address&gt; masklen &lt;integer&gt; [action &lt;action&gt;]' + '<br/>' +
                'afi &lt;afi&gt; &lt;ipv6-address&gt; masklen &lt;integer&gt; [action &lt;action&gt;]' + '[tunnel &lt;remote-endpoint-address&gt;,&lt;encapsulation&gt;]'
            },
            'irt': {
                short: 'Specifies the name of the irt object, must start with \"IRT-\"',
                description: 'Specifies the name of the irt object. The name should start with the prefix \"IRT-\" reserved for this type of object.',
                syntax: _shared.irt.syntax
            },
            'irt-nfy': {
                short: 'Notification email address when a reference to the irt object is added or removed.',
                description: 'Specifies the email address to be notified when a reference to the irt object is added or removed.',
                syntax: _shared.email.syntax
            },
            'key-cert': {
                short: 'Defines the public key, e.g. PGPKEY-<id>',
                description: 'Defines the public key stored in the database.',
                syntax: _shared.keyCert.syntax
            },
            'language': {
                short: 'Identifies the language as a two-letter ISO 639-1 code, e.g. NL.',
                description: 'Identifies the language.',
                syntax: 'Valid two-letter <a href="https://en.wikipedia.org/wiki/ISO_639-1" target="_blank">ISO 639-1 language code</a>.'
            },
            'last-modified': {
                short: 'Value will be generated by the server.',
                description: 'This attributes reflects when the object was last changed in <a href="https://en.wikipedia.org/wiki/ISO_8601" target="_blank">ISO 8601 format</a> (yyyy-MM-dd\'T\'HH:mm:ssZ).',
                syntax: _shared.generated.syntax
            },
            'local-as': {
                short: undefined,
                description: 'Specifies the autonomous system that operates the router.',
                syntax: _shared.asNumber.syntax
            },
            'mbrs-by-ref': {
                short: 'Enter a mntner-name or ANY',
                description: 'This attribute can be used in all \"set\" objects; it allows indirect population of a set. If this attribute is used, the set also includes objects of the corresponding type (aut-num objects for as-set, for example) that are protected by one of these maintainers and whose \"member-of:\" attributes refer to the name of the set. If the value of a \"mbrs-by-ref:\" attribute is ANY, any object of the corresponding type  referring to the set is a member of the set. If the \"mbrs-by-ref:\" attribute is missing, the set is defined explicitly by the \"members:\" attribute.',
                syntax: '&lt;mntner-name&gt; | ANY'
            },
            'members': {
                short: undefined,
                description: 'Lists the members of the set.',
                syntax: ''
            }, // no syntax available
            'member-of': {
                short: 'Identifies a set object that this object wants to be a member of.',
                description: 'This attribute can be used in the route , aut-num and inet-rtr classes. The value of the \"member-of:\" attribute identifies a set object that this object wants to be a member of. This claim  however, should be acknowledged by a respective \"mbrs-by-ref:\" attribute in the referenced object.',
                syntax: ''
            }, // no syntax available
            'method': {
                short: 'Value will be generated by the server.',
                description: 'Defines the type of the public key.',
                syntax: 'Only PGP keys are supported.'
            },
            'mntner': {
                short: 'A unique identifier of the mntner object, e.g. EXAMPLE-MNT',
                description: 'A unique identifier of the mntner object.',
                syntax: _shared.objectName.syntax
            },
            'mnt-by': {
                short: 'Specifies one or more maintainer objects used for authorisation.',
                description: 'Specifies one or more maintainers used for authorisation on the object as \"mnt-by:\". Add maintainers by typing in the input field, remove them by clicking the \"x\". Maintainers marked with a star can be used with your RIPE NCC Access SSO account. RIPE NCC maintainers, if present, cannot be removed. <a href="https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers" target="_blank">Learn more.</a>',
                syntax: _shared.objectName.syntax
            },
            'mnt-domains': {
                short: 'Specifies the mntner object used for reverse domain authorisation.',
                description: 'Specifies the identifier of a registered mntner object used for reverse domain authorisation. Protects domain objects. The authentication method of this maintainer object will be used for any encompassing reverse domain object.  <a href="https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers" target="_blank">Learn more.</a>',
                syntax: _shared.objectName.syntax
            },
            'mnt-irt': {
                short: 'Specifies the IRT object used for CSIRT security incidents.',
                description: 'May appear in an inetnum or inet6num object. It points to an irt object representing a Computer Security Incident Response Team (CSIRT) that handles security incidents for the address space specified by the inetnum or inet6num object.',
                syntax: _shared.irt.syntax
            },
            'mnt-lower': {
                short: 'Specifies the mntner object used for hierarchical authorisation.',
                description: 'Specifies the identifier of a registered mntner object used for hierarchical authorisation. Protects creation of objects directly (one level below) in the hierarchy of an object type. The authentication method of this maintainer object will then be used upon creation of any object directly below the object that contains the \"mnt-lower:\" attribute.  <a href="https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers" target="_blank">Learn more.</a>',
                syntax: _shared.objectName.syntax
            },
            'mnt-nfy': {
                short: 'Notification email address when the object is successfully updated.',
                description: 'Specifies the email address to be notified when an object protected by a mntner is successfully updated.',
                syntax: _shared.email.syntax
            },
            'mnt-ref': {
                short: 'Specifies a mntner that may add references to the organisation object from other objects.',
                description: 'Specifies the maintainer objects that are entitled to add references to the organisation object from other objects.',
                syntax: _shared.objectName.syntax
            },
            'mnt-routes': null, // specified object specific table
            'mp-default': {
                short: undefined,
                description: 'Specifies default multiprotocol routing policies.',
                syntax: 'to &lt;peering&gt; [action &lt;action&gt;] [networks &lt;filter&gt;]'
            },
            'mp-export': {
                short: undefined,
                description: 'Specifies a multiprotocol export policy expression.',
                syntax: '[protocol &lt;protocol-1&gt;] [into &lt;protocol-1&gt;]' + '<br/>' +
                'afi &lt;afi-list&gt; to &lt;peering-1&gt; [action &lt;action-1&gt;]' + '<br/>' +
                '.' + '<br/>' +
                '.' + '<br/>' +
                '.' + '<br/>' +
                ' to &lt;peering-N&gt; [action &lt;action-N&gt;] announce &lt;filter&gt;'
            },
            'export-via': {
                short: undefined,
                description: 'Specifies an export policy expression targeted at a non-adjacent network.',
                syntax: '[protocol &lt;protocol-1&gt;] [into &lt;protocol-2&gt;]' + '<br/>' +
                'afi &lt;afi-list&gt;' + '<br/>' +
                '&lt;peering-1&gt;' + '<br/>' +
                'to &lt;peering-2&gt; [action &lt;action-1&gt;; &lt;action-2&gt;; ... &lt;action-N&gt;;]' + '<br/>' +
                '.' + '<br/>' +
                '.' + '<br/>' +
                '.' + '<br/>' +
                '&lt;peering-3&gt;' + '<br/>' +
                'to &lt;peering-M&gt; [action &lt;action-1&gt;; &lt;action-2&gt;; ... &lt;action-N&gt;;]' + '<br/>' +
                'announce &lt;filter&gt;'
            },
            'mp-filter': {
                short: undefined,
                description: 'Defines the set\'s multiprotocol policy filter.',
                syntax: 'Logical expression which when applied to a set of multiprotocol routes returns a subset of these routes. Please refer to RPSLng Internet Draft for more information.'
            },
            'mp-import': {
                short: undefined,
                description: 'Specifies multiprotocol import policy expression.',
                syntax: '[protocol &lt;protocol-1&gt;] [into &lt;protocol-1&gt;]' + '<br/>' +
                'afi &lt;afi-list&gt;' + '&lt;br/&gt;' +
                'from &lt;peering-1&gt; [action &lt;action-1&gt;]' + '<br/>' +
                '.' + '<br/>' +
                '.' + '<br/>' +
                '.' + '<br/>' +
                'from &lt;peering-N&gt; [action &lt;action-N&gt;]' + '<br/>' +
                'accept (&lt;filter&gt;|&lt;filter&gt; except &lt;importexpression&gt;|' + '<br/>' +
                '        &lt;filter&gt; refine &lt;importexpression&gt;)' + '<br/>'
            },
            'import-via': {
                short: undefined,
                description: 'Specifies an import policy expression targeted at a non-adjacent network.',
                syntax: '[protocol &lt;protocol-1&gt;] [into &lt;protocol-2&gt;]' + '<br/>' +
                'afi &lt;afi-list&gt;' + '<br/>' +
                '&lt;peering-1&gt;' + '<br/>' +
                'from &lt;peering-2&gt; [action &lt;action-1&gt;; &lt;action-2&gt;; ... &lt;action-N&gt;;]' + '<br/>' +
                '    .' + '<br/>' +
                '    .' + '<br/>' +
                '    .' + '<br/>' +
                '&lt;peering-3&gt;' + '<br/>' +
                'from &lt;peering-M&gt; [action &lt;action-1&gt;; &lt;action-2&gt;; ... &lt;action-N&gt;;]' + '<br/>' +
                'accept (&lt;filter&gt;|&lt;filter&gt; except &lt;importexpression&gt;|' + '<br/>' +
                '        &lt;filter&gt; refine &lt;importexpression&gt;)\n'
            },
            'mp-members': {
                short: undefined,
                description: 'Lists the multiprotocol members of the set.',
                syntax: ''
            }, // no syntax available
            'mp-peer': null,  // specified object specific table
            'mp-peering': {
                short: undefined,
                description: 'Defines a multiprotocol peering that can be used for importing or exporting routes.',
                syntax: '&lt;as-expression&gt; [&lt;mp-router-expression-1&gt;] [at &lt;mp-router-expression-2&gt;] | &lt;peering-set-name&gt;'
            },
            'netname': {
                short: undefined,
                description: 'The name of the range of IP address space.',
                syntax: 'The netname is made up of letters, digits, the underscore \"_\" and hyphen \"-\". The first character of a name must be a letter, and the last character of a name must be a letter or a digit.'
            },
            'nic-hdl': {
                short: 'Leave value at \"AUTO-1\" to generate a unique NIC handle',
                description: 'Specifies the NIC handle of a role or person object. Leave this value on \"AUTO-1\" let the database assign the NIC handle automatically.',
                syntax: 'When using \"AUTO-1\", by default the first characters of the name of the person or role are used to create the NIC handle. For example, \"John Smith\" will result in a NIC handle such as JS99999-RIPE. You can enter up to 4 additional characters after \"AUTO-1\" to influence which characters are used. For example, specifying \"AUTO-1BAR\" will result in a NIC handle such as BAR9999-RIPE, regardless of the specified name.'
            },
            'notify': {
                short: 'Notification email address where changes to an object should be sent.',
                description: 'Specifies the email address to which notifications of changes to an object should be sent. This attribute is filtered from the default whois output.',
                syntax: _shared.email.syntax
            },
            'nserver': {
                short: 'Specifies the nameserver of the domain. Include this attribute at least twice.',
                description: 'Specifies the nameservers of the domain.',
                syntax: 'Nameserver name in the format \"nameserver.example.net\" with or without trailing dot. The nameserver name may be optionally followed by IPv4 address in decimal dotted quad form (e.g. 192.0.2.1) or IPv6 address in lowercase canonical form (e.g. 2001:db8::8:800:200c:417a). The nameserver name may be followed by an IP address only when the name is inside of the domain being delegated.'
            },
            'org': {
                short: 'Reference to an organisation object representing the holder of the resource.',
                description: 'Points to an existing organisation object representing the entity that holds the resource.',
                syntax: _shared.organisation.syntax
            },
            'org-name': {
                short: 'Specifies the name of the organisation in ASCII-only.',
                description: 'Specifies the name of the organisation that this object represents in the RIPE Database. This is an ASCII-only text attribute. You can specify the name of the organisation in <a href="https://en.wikipedia.org/wiki/ISO/IEC_8859-1#Codepage_layout" target="_blank">Latin-1 character encoding</a> in the \"descr:\" attribute, if required.',
                syntax: _shared.objectName.syntax
            },
            'org-type': {
                short: 'Specifies the type of the organisation, e.g. LIR or OTHER.',
                description: 'Specifies the type of the organisation.',
                syntax: 'org-type can have one of these values:' +
                '<ul>' +
                '<li>IANA: for Internet Assigned Numbers Authority</li>' +
                '<li>RIR:for Regional Internet Registries</li>' +
                '<li>NIR: for National Internet Registries (there are no NIRs in the RIPE NCC service region)</li>' +
                '<li>LIR: for Local Internet Registries</li>' +
                '<li>WHITEPAGES: for special links to industry people</li>' +
                '<li>DIRECT_ASSIGNMENT: for direct contract with RIPE NCC</li>' +
                '<li>OTHER: for all other organisations</li>' +
                '</ul>'
            },
            'organisation': {
                short: 'Leave value at \"AUTO-1\" to generate a unique org-id.',
                description: 'Specifies the ID of an organisation object. Leave this value on \"AUTO-1\" to let the database assign the ID automatically.',
                syntax: 'When using \"AUTO-1\", by default the first characters of the organisation name are used to create the org-id. For example, \"Acme Corporation\" will result in a NIC handle such as ORG-AC9999-RIPE. You can enter up to 4 additional characters after \"AUTO-1\" to influence which characters are used. For example, specifying \"AUTO-1BAR\" will result in an org-id such as ORG-BAR9999-RIPE, regardless of the specified organisation name.'
            },
            'origin': {
                short: 'Specifies the AS that originates the route.',
                description: 'Specifies the AS that originates the route. The corresponding aut-num object should be registered in the database. Together with the \"route:\" attribute constitutes a primary key of the object, which is why the value cannot be modified after creation.',
                syntax: _shared.asNumber.syntax
            },
            'owner': {
                short: 'Value will be generated by the server.',
                description: 'Specifies the owner of the public key.',
                syntax: _shared.generated.syntax
            },
            'peer': {
                short: undefined,
                description: 'Details of any (interior or exterior) router peerings.',
                syntax: '&lt;protocol&gt; &lt;ipv4-address&gt; &lt;options&gt;' + '&lt;br/&gt;' +
                '| &lt;protocol&gt; &lt;inet-rtr-name&gt; &lt;options&gt;' + '&lt;br/&gt;' +
                '| &lt;protocol&gt; &lt;rtr-set-name&gt; &lt;options&gt;' + '&lt;br/&gt;' +
                '| &lt;protocol&gt; &lt;peering-set-name&gt; &lt;options&gt;'
            },
            'peering': {
                short: undefined,
                description: 'Defines a peering that can be used for importing or exporting routes.',
                syntax: '&lt;peering&gt;'
            },
            'peering-set': {
                short: undefined,
                description: 'Specifies the name of the peering-set.',
                syntax: 'A peering-set name is made up of letters, digits, the underscore \"_\" and hyphen \"-\". It must start with \"prng-\", and the last character of a name must be a letter or a digit.' + '<br/>' +
                'A peering-set name can also be hierarchical. A hierarchical set name is a sequence of set names and AS numbers separated by colons \":\".' +
                'At least one component of such a name must be an actual set name (i.e. start with \"prng-\").  All the set name components of a hierarchical peering-set name have to be peering-set names.'
            },
            'person': {
                short: 'Specifies the full name of a contact, e.g. John Smith.',
                description: 'Specifies the full name of an administrative, technical or zone contact person for other objects in the database.',
                syntax: 'It should contain 2 to 10 words. Each word consists of letters, digits or the following symbols: .`\'_-' + '<br/>' +
                'The first word should begin with a letter. Max 64 characters can be used in each word.'
            },
            'phone': {
                short: 'Phone number with country code, e.g. +44 161 715 1234.',
                description: 'Specifies a telephone number of the contact.',
                syntax: _shared.phone.syntax
            },
            'ping-hdl': {
                short: 'References a person or role related to the \"pingable:\" attribute.',
                description: 'References a person or role capable of responding to queries concerning the IP addresses specified in the \"pingable:\" attribute.',
                syntax: _shared.nicHandle.syntax
            },
            'pingable': {
                short: 'Specifies an IP address that should be reachable from outside networks.',
                description: 'Allows a network operator to advertise an IP address of a node that should be reachable from outside networks. This node can be used as a destination address for diagnostic tests. The IP address must be within the address range of the prefix containing this attribute.',
                syntax: 'A single IPv4 address in decimal dotted quad form (e.g. 192.0.2.1) in case of a route object, or an IPv6 address in lowercase canonical form (e.g. 2001:db8::8:800:200c:417a) in case of a route6 object.'
            },
            'poem': {
                short: undefined,
                description: 'Specifies the title of the poem.',
                syntax: 'POEM-&lt;string&gt;' + '&lt;br/&gt;' +
                '&lt;string&gt; can include alphanumeric characters, and \"_\" and "-" characters.'
            },
            'poetic-form': {
                short: undefined,
                description: 'Specifies the poem type.',
                syntax: _shared.poeticForm.syntax
            },
            'ref-nfy': {
                short: 'Notification email address when a reference to the organisation object is added or removed.',
                description: 'Specifies the email address to be notified when a reference to the organisation object is added or removed. This attribute is filtered from the default whois output when at least one of the  objects returned by the query contains an abuse-mailbox attribute.',
                syntax: _shared.email.syntax
            },
            'remarks': {
                short: 'Any free-form comments about the object.',
                description: 'Contains remarks.',
                syntax: _shared.freeForm.syntax
            },
            'role': {
                short: undefined,
                description: 'Specifies the name of a role entity, e.g. Acme Corporation NOC.',
                syntax: _shared.organisationName.syntax
            },
            'route': {
                short: 'Specifies the prefix of the interAS route.',
                description: 'Specifies the prefix of the interAS route. Together with the \"origin:\" attribute constitutes a primary key of the route object, which is why the value cannot be modified after creation.',
                syntax: 'A prefix in Classless Inter-Domain Routing (CIDR) notation using all four octets of an IPv4 address, e.g. 192.168.2.0/24.'
            },
            'route6': {
                short: 'Specifies the IPv6 prefix of the interAS route.',
                description: 'Specifies the IPv6 prefix of the interAS route. Together with the \"origin:\" attribute, constitutes a primary key of the route6 object, which is why the value cannot be modified after creation.',
                syntax: 'A prefix in Classless Inter-Domain Routing (CIDR) notation, e.g. 2001:db8::/32'
            },
            'route-set': {
                short: 'Specifies the name of the route set, must start with \"rs-\"',
                description: 'Specifies the name of the route set. It is a primary key for the route-set object.',
                syntax: 'An route-set name is made up of letters, digits, the underscore \"_\" and hyphen \"-\". It must start with \"rs-\", and the last character of a name must be a letter or a digit. A route-set name can also be hierarchical.  A hierarchical set name is a sequence of set names and AS numbers separated by colons \":\".  At least one component of such a name must be an actual set name (i.e. start with \"rs-\"). All the set name components of a hierarchical route-name have to be route-set names.'
            },
            'rtr-set': {
                short: 'Specifies the name of the rtr-set, must start with \"rtrs-\"',
                description: 'Defines the name of the rtr-set.',
                syntax: 'A router-set name is made up of letters, digits, the underscore \"_\" and hyphen \"-\". It must start with \"rtrs-\", and the last character of a name must be a letter or a digit. A router-set name can also be hierarchical.  A hierarchical set name is a sequence of set names and AS numbers separated by colons \":\".  At least one component of such a name must be an actual set name (i.e. start with \"rtrs-\").  All the set name components of a hierarchical router-set name have to be router-set names.'
            },
            'signature': {
                short: 'References a CSIRT key-cert object.',
                description: 'References a key-cert object representing a CSIRT public key used by the team to sign their correspondence.',
                syntax: _shared.keyCert.syntax
            },
            'source': {
                short: 'Must be \"RIPE\" for the RIPE Database.',
                description: 'Specifies the registry where the object is registered. Must be \"RIPE\" for the RIPE Database.',
                syntax: 'The source is made up of letters, digits, the underscore \"_\" and hyphen \"-\". The first character of a registry name must be a letter, and the last character of a registry name must be a letter or a digit.'
            },
            'sponsoring-org': {
                short: 'Reference to an organisation object representing the sponsor.',
                description: 'Points to an existing organisation object representing the sponsoring organisation responsible for the resource.',
                syntax: _shared.organisation.syntax
            },
            'status': undefined,
            'tech-c': {
                short: 'Nic-handle of a technical contact.',
                description: 'References a technical contact.',
                syntax: _shared.nicHandle.syntax
            },
            'text': {
                short: 'Text of the poem.',
                description: 'Text of the poem. Must be humorous, but not malicious or insulting.',
                syntax: _shared.freeForm.syntax
            },
            'upd-to': {
                short: 'Notification email address when the object is unsuccessfully updated.',
                description: 'Specifies the email address to be notified when an object protected by a mntner is unsuccessfully updated.',
                syntax: _shared.email.syntax
            },
            'zone-c': {
                short: 'Nic-handle of a zone contact.',
                description: 'References a zone contact.',
                syntax: _shared.nicHandle.syntax
            }
        };

        this._statusDoc = {
            'aut-num': {
                short: 'Value will be generated by the server',
                description: 'Specifies the kind of resource.',
                syntax: 'Status can have one of these values:' + '<br/>' +
                '<ul>' +
                '<li>ASSIGNED</li>' +
                '<li>LEGACY</li>' +
                '<li>OTHER</li>' +
                '</ul>'
            },
            'inet6num': {
                short: undefined,
                description: 'Specifies the kind of resource.',
                syntax: 'Status can have one of these values:' + '<br/>' +
                '<ul>' +
                '<li>ALLOCATED-BY-RIR</li>' +
                '<li>ALLOCATED-BY-LIR</li>' +
                '<li>AGGREGATED-BY-LIR</li>' +
                '<li>ASSIGNED</li>' +
                '<li>ASSIGNED ANYCAST</li>' +
                '<li>ASSIGNED PI</li>' +
                '</ul>'
            },
            'inetnum': {
                short: undefined,
                description: 'Specifies the kind of resource.',
                syntax: 'Status can have one of these values:' + '<br/>' +
                '<ul>' +
                '<li>ALLOCATED PA</li>' +
                '<li>ALLOCATED PI</li>' +
                '<li>ALLOCATED UNSPECIFIED</li>' +
                '<li>LIR-PARTITIONED PA</li>' +
                '<li>LIR-PARTITIONED PI</li>' +
                '<li>SUB-ALLOCATED PA</li>' +
                '<li>ASSIGNED PA</li>' +
                '<li>ASSIGNED PI</li>' +
                '<li>ASSIGNED ANYCAST</li>' +
                '<li>EARLY-REGISTRATION</li>' +
                '<li>NOT-SET</li>' +
                '<li>LEGACY</li>' +
                '</ul>'
            }
        };

        this._mntRoutesDoc = {
            'aut-num': {
                short: 'References a mntner used in determining authorisation for the creation of route(6) objects.',
                description: 'This attribute references a maintainer object which is used in determining authorisation for the creation of route6 objects.  This entry is for the mnt-routes attribute of aut-num class.  After the reference to the maintainer, an optional list of prefix ranges inside of curly braces or the keyword \"ANY\" may follow. The default, when no additional set items are specified, is \"ANY\" or all more specifics. <a href="https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers" target="_blank">Learn more.</a>',
                syntax: '&lt;mnt-name&gt; [ { list of (&lt;ipv4-address&gt;/&lt;prefix&gt; or &lt;ipv6-address&gt;/&lt;prefix&gt;) } | ANY ]'
            },
            'inet6num': {
                short: 'References a mntner used in determining authorisation for the creation of route6 objects.',
                description: 'This attribute references a maintainer object which is used in determining authorisation for the creation of route6 objects. This entry is for the mnt-routes attribute of route6 and inet6num classes. After the reference to the maintainer, an optional list of prefix ranges inside of curly braces or the keyword \"ANY\" may follow. The default, when no additional set items are specified, is \"ANY\" or all more specifics. <a href="https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers" target="_blank">Learn more.</a>',
                syntax: '&lt;mnt-name&gt; [ { list of &lt;ipv6-address&gt;/&lt;prefix&gt; } | ANY ]'
            },
            'inetnum': {
                short: 'References a mntner used in determining authorisation for the creation of route objects.',
                description: 'This attribute references a maintainer object which is used in determining authorisation for the creation of route objects. After the reference to the maintainer, an optional list of prefix ranges inside of curly braces or the keyword \"ANY\" may follow. The default, when no additional set items are specified, is \"ANY\" or all more specifics. <a href="https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers" target="_blank">Learn more.</a>',
                syntax: '&lt;mnt-name&gt; [ { list of &lt;address-prefix-range&gt; } | ANY ]'
            },
            'route': {
                short: 'References a mntner used in determining authorisation for the creation of route objects.',
                description: 'This attribute references a maintainer object which is used in determining authorisation for the creation of route objects. After the reference to the maintainer, an optional list of prefix ranges inside of curly braces or the keyword \"ANY\" may follow. The default, when no additional set items are specified, is \"ANY\" or all more specifics. <a href="https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers" target="_blank">Learn more.</a>',
                syntax: '&lt;mnt-name&gt; [ { list of &lt;address-prefix-range&gt; } | ANY ]'
            },
            'route6': {
                short: 'References a mntner used in determining authorisation for the creation of route6 objects.',
                description: 'This attribute references a maintainer object which is used in determining authorisation for the creation of route6 objects. This entry is for the mnt-routes attribute of route6 and inet6num classes. After the reference to the maintainer, an optional list of prefix ranges inside of curly braces or the keyword \"ANY\" may follow. The default, when no additional set items are specified, is \"ANY\" or all more specifics. <a href="https://www.ripe.net/manage-ips-and-asns/db/support/security/maintainers" target="_blank">Learn more.</a>',
                syntax: '&lt;mnt-name&gt; [ { list of &lt;ipv6-address&gt;/&lt;prefix&gt; } | ANY ]'
            }
        };

        this._mpPeerDoc = {
            'inet-rtr': {
                short: undefined,
                description: 'Details of any (interior or exterior) multiprotocol router peerings.',
                syntax: _shared.peer.syntax
            },
            'peering-set': {
                short: undefined,
                description: 'Defines a multiprotocol peering used for importing or exporting routes.',
                syntax: _shared.peer.syntax
            }
        };
    }]);
