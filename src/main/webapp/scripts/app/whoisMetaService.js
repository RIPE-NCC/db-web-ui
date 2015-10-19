'use strict';

angular.module('dbWebApp')
    .service('WhoisMetaService', function () {

        this.getAttributeDocumentation = function (objectType, attrName) {
            var description = null;
            if (attrName === 'mp-peer') {
                description = this._mpPeerDoc[objectType].description;
            } else if (attrName === 'mnt-routes') {
                description = this._mntRoutesDoc[objectType].description;
            }
            if (! description) {
                description = this._attrDocumentation[attrName].description;
            }
            return description;
        };

        this.getAttributeSyntax = function (objectType, attrName) {
            var syntax = undefined;
            if (attrName === 'mp-peer') {
                syntax = this._mpPeerDoc[objectType].syntax;
            } else if (attrName === 'mnt-routes') {
                syntax = this._mntRoutesDoc[objectType].syntax;
            }
            if (_.isUndefined(syntax)) {
                syntax = this._attrDocumentation[attrName].syntax;
            }
            return syntax;
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

        this.getObjectTypes = function () {
            var keys = [];
            for (var key in this._objectTypesMap) {
                keys.push(key);
            }
            return keys;
        };

        this.enrichAttributesWithMetaInfo = function (objectTypeName, attrs) {
            var attrsMeta = this._getMetaAttributesOnObjectType(objectTypeName, false);

            var self = this;

            var after = _.map(attrs, function (attr) {

                var attrMeta = _.find(attrsMeta, function (am) {
                    return am.name === attr.name;
                });
                var idx;
                if( attr.$$meta ) {
                    idx = attr.$$meta.$$idx;
                }

                return {
                    name: attr.name,
                    value: attr.value,
                    $$meta: {
                        $$idx: idx,
                        $$mandatory: attrMeta.mandatory,
                        $$multiple: attrMeta.multiple,
                        $$primaryKey: attrMeta.primaryKey,
                        $$description: self.getAttributeDocumentation(objectTypeName, attr.name),
                        $$syntax: self.getAttributeSyntax(objectTypeName, attr.name),
                        $$refs: attrMeta.refs
                    }
                };
            });

            return after;
        };

        this.getAllAttributesOnObjectType = function (objectTypeName) {
            if (objectTypeName === null) {
                return [];
            }

            var self = this;

            // enrich with order info
            var idx = 0;
            return _.map(this._getMetaAttributesOnObjectType(objectTypeName, false), function (am) {
                var meta = {
                    name: am.name,
                    $$meta: {
                        $$idx: idx,
                        $$mandatory: am.mandatory,
                        $$multiple: am.multiple,
                        $$primaryKey: am.primaryKey,
                        $$description: self.getAttributeDocumentation(objectTypeName, am.name),
                        $$syntax: self.getAttributeSyntax(objectTypeName, am.name),
                        $$refs: am.refs
                    }
                };
                idx++;
                return meta;
            });
        };

        this.getMandatoryAttributesOnObjectType = function (objectTypeName) {
            if (objectTypeName === null) {
                return [];
            }
            var self = this;

            // enrich with order info
            var idx = 0;
            return _.map(this._getMetaAttributesOnObjectType(objectTypeName, true), function (x) {
                var meta = {
                    name: x.name,
                    $$meta: {
                        $$idx: idx,
                        $$mandatory: x.mandatory,
                        $$multiple: x.multiple,
                        $$primaryKey: x.primaryKey,
                        $$description: self.getAttributeDocumentation(objectTypeName, x.name),
                        $$syntax: self.getAttributeSyntax(objectTypeName, x.name),
                        $$refs: x.refs
                    }
                };
                idx++;
                return meta;
            });
        };

        this._objectTypesMap = {
            'as-block': {
                name: 'as-block', 'description': null,
                'attributes': [
                    {name: 'as-block', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'descr', mandatory: false, multiple: true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: false, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'as-set': {
                name: 'as-set', 'description': null,
                'attributes': [
                    {name: 'as-set', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'aut-num': {
                name: 'aut-num', 'description': null,
                'attributes': [
                    {name: 'aut-num', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'status', mandatory: false, multiple: false, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'domain': {
                name: 'domain', 'description': null,
                'attributes': [
                    {name: 'domain', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'filter-set': {
                name: 'filter-set', 'description': null,
                'attributes': [
                    {name: 'filter-set', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'inet6num': {
                name: 'inet6num', 'description': null,
                'attributes': [
                    {name: 'inet6num', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'netname', mandatory: true, multiple: false, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'country', mandatory: true, multiple: true, refs: []},
                    {name: 'geoloc', mandatory: false, multiple: false, refs: []},
                    {name: 'language', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'sponsoring-org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'status', mandatory: true, multiple: false, refs: []},
                    {name: 'assignment-size', mandatory: false, multiple: false, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-domains', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-irt', mandatory: false, multiple: true, refs: ['IRT']},
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'inetnum': {
                name: 'inetnum', 'description': null,
                'attributes': [
                    {name: 'inetnum', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'netname', mandatory: true, multiple: false, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'country', mandatory: true, multiple: true, refs: []},
                    {name: 'geoloc', mandatory: false, multiple: false, refs: []},
                    {name: 'language', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'sponsoring-org', mandatory: false, multiple: false, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'status', mandatory: true, multiple: false, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-domains', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER']},
                    {name: 'mnt-irt', mandatory: false, multiple: true, refs: ['IRT']},
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'inet-rtr': {
                name: 'inet-rtr', 'description': null,
                'attributes': [
                    {name: 'inet-rtr', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'irt': {
                name: 'irt', 'description': null,
                'attributes': [
                    {name: 'irt', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'key-cert': {
                name: 'key-cert', 'description': null,
                'attributes': [
                    {name: 'key-cert', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'mntner': {
                name: 'mntner', 'description': null,
                'attributes': [
                    {name: 'mntner', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'organisation': {
                name: 'organisation', 'description': null,
                'attributes': [
                    {name: 'organisation', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'peering-set': {
                name: 'peering-set', 'description': null,
                'attributes': [
                    {name: 'peering-set', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'person': {
                name: 'person', 'description': null,
                'attributes': [
                    {name: 'person', mandatory: true, multiple: false, refs: []},
                    {name: 'address', mandatory: true, multiple: true, refs: []},
                    {name: 'phone', mandatory: true, multiple: true, refs: []},
                    {name: 'fax-no', mandatory: false, multiple: true, refs: []},
                    {name: 'e-mail', mandatory: false, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'nic-hdl', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'abuse-mailbox', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'poem': {
                name: 'poem', 'description': null,
                'attributes': [
                    {name: 'poem', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'descr', mandatory: false, multiple: true, refs: []},
                    {name: 'form', mandatory: true, multiple: false, refs: ['POETIC_FORM']},
                    {name: 'text', mandatory: true, multiple: true, refs: []},
                    {name: 'author', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: false, refs: ['MNTNER']},
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'poetic-form': {
                name: 'poetic-form', 'description': null,
                'attributes': [
                    {name: 'poetic-form', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'descr', mandatory: false, multiple: true, refs: []},
                    {name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'role': {
                name: 'role', 'description': null,
                'attributes': [
                    {name: 'role', mandatory: true, multiple: false, refs: []},
                    {name: 'address', mandatory: true, multiple: true, refs: []},
                    {name: 'phone', mandatory: false, multiple: true, refs: []},
                    {name: 'fax-no', mandatory: false, multiple: true, refs: []},
                    {name: 'e-mail', mandatory: true, multiple: true, refs: []},
                    {name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION']},
                    {name: 'admin-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE']},
                    {name: 'nic-hdl', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'remarks', mandatory: false, multiple: true, refs: []},
                    {name: 'notify', mandatory: false, multiple: true, refs: []},
                    {name: 'abuse-mailbox', mandatory: false, multiple: false, refs: []},
                    {name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER']},
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'route': {
                name: 'route', 'description': null,
                'attributes': [
                    {name: 'route', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'origin', mandatory: true, multiple: false, primaryKey:true, refs: ['AUT_NUM']},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'route6': {
                name: 'route6', 'description': null,
                'attributes': [
                    {name: 'route6', mandatory: true, multiple: false, primaryKey:true, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'origin', mandatory: true, multiple: false, primaryKey:true, refs: ['AUT_NUM']},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'route-set': {
                name: 'route-set', 'description': null,
                'attributes': [
                    {name: 'route-set', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            },
            'rtr-set': {
                name: 'rtr-set', 'description': null,
                'attributes': [
                    {name: 'rtr-set', mandatory: true, multiple: false, primaryKey:true, refs: []},
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
                    {name: 'changed', mandatory: false, multiple: true, refs: []},
                    {name: 'created', mandatory: false, multiple: false, refs: []},
                    {name: 'last-modified', mandatory: false, multiple: false, refs: []},
                    {name: 'source', mandatory: true, multiple: false, refs: []}
                ]
            }
    };

        this._attrDocumentation = {
            'abuse-mailbox': {
                'description': 'Specifies the e-mail address to which abuse complaints should be sent.  This attribute should only be used in the ROLE object. It will be deprecated from any other object.  Adding this attribute to a ROLE object will remove any query limits for the ROLE object. These ROLE objects are considered to include only commercial data.',
                'syntax': 'TODO' },
            'abuse-c': {
                'description': 'References an abuse contact.  This can only be a ROLE object containing an \'abuse-mailbox:\' attribute.  Making this reference will remove any query limits for the ROLE object. These ROLE objects are considered to include only commercial data.',
                'syntax': 'TODO' },
            'address': {
                'description': 'Full postal address of a contact',
                'syntax': 'TODO' },
            'admin-c': {
                'description': 'References an on-site administrative contact.',
                'syntax': 'TODO admin-c syntax' },
            'aggr-bndry': {
                'description': 'Defines a set of ASes  which form the aggregation boundary.',
                'syntax': 'TODO' },
            'aggr-mtd': {
                'description': 'Specifies how the aggregate is generated.',
                'syntax': 'TODO' },
            'alias': {
                'description': 'The canonical DNS name for the router.',
                'syntax': 'TODO' },
            'assignment-size': {
                'description': 'Specifies the size of blocks assigned to end users from this aggregated inet6num assignment.',
                'syntax': 'TODO' },
            'as-block': {
                'description': 'Range of AS numbers.',
                'syntax': 'TODO' },
            'as-name': {
                'description': 'A descriptive name associated with an AS.',
                'syntax': 'TODO' },
            'as-set': {
                'description': 'Defines the name of the set.',
                'syntax': 'TODO' },
            'auth': {
                'description': 'Defines an authentication scheme to be used.',
                'syntax': 'TODO' },
            'author': {
                'description': 'References a poem author.',
                'syntax': 'TODO' },
            'aut-num': {
                'description': 'The autonomous system number.',
                'syntax': 'TODO' },
            'certif': {
                'description': 'Contains the public key.',
                'syntax': 'TODO' },
            'changed': {
                'description': 'Specifies who submitted the update. This attribute is filtered from the default whois output. This attribute is deprecated and will be removed in a next release.',
                'syntax': 'TODO' },
            'components': {
                'description': 'The \'components:\' attribute defines what component routes are used to form the aggregate.',
                'syntax': 'TODO' },
            'country': {
                'description': 'Identifies the country.',
                'syntax': 'TODO' },
            'created': {
                'description': 'This attributes reflects when the object was created in ISO8601 format (yyyy-MM-dd\'T\'HH:mm:ssZ.',
                'syntax': 'TODO' },
            'default': {
                'description': 'Specifies default routing policies.',
                'syntax': 'TODO' },
            'descr': {
                'description': 'A short decription related to the object.',
                'syntax': 'TODO' },
            'domain': {
                'description': 'Domain name.',
                'syntax': 'TODO' },
            'ds-rdata': {
                'description': 'DS records for this domain.',
                'syntax': 'TODO' },
            'encryption': {
                'description': 'References a key-cert object representing a CSIRT public key used  to encrypt correspondence sent to the CSIRT.',
                'syntax': 'TODO' },
            'export': {
                'description': 'Specifies an export policy expression.',
                'syntax': 'TODO' },
            'export-comps': {
                'description': 'Defines the set\'s policy filter, a logical expression which when applied to a set of routes returns a subset of these routes.', 'syntax':
                    'TODO' },
            'e-mail': {
                'description': 'The e-mail address of a person. This attribute is filtered from the default whois output when at least one of the objects returned by the query contains an abuse-mailbox attribute.',
                'syntax': 'TODO' },
            'fax-no': {
                'description': 'The fax number of a contact.',
                'syntax': 'TODO' },
            'filter': {
                'description': 'Defines the set\'s policy filter.',
                'syntax': 'TODO' },
            'filter-set': {
                'description': 'Defines the name of the filter.',
                'syntax': 'TODO' },
            'fingerpr': {
                'description': 'A fingerprint of a key certificate generated by the database.',
                'syntax': 'TODO' },
            'form': {
                'description': 'Specifies the identifier of a registered poem type.',
                'syntax': 'TODO' },
            'geoloc': {
                'description': 'The location coordinates for the resource.',
                'syntax': 'TODO' },
            'holes': {
                'description': 'Lists the component address prefixes that are not reachable through the aggregate route (perhaps that part of the address space is unallocated.',
                'syntax': 'TODO' },
            'ifaddr': {
                'description': 'Specifies an interface address within an Internet router.',
                'syntax': 'TODO' },
            'import': {
                'description': 'Specifies import policy expression.',
                'syntax': 'TODO' },
            'inet6num': {
                'description': 'Specifies a range of IPv6 addresses in prefix notation.',
                'syntax': 'TODO' },
            'inetnum': {
                'description': 'Specifies a range of IPv4 that inetnum object presents.  The ending address should be greater than the starting one.',
                'syntax': 'TODO' },
            'inet-rtr': {
                'description': 'Fully qualified DNS name of the inet-rtr without trailing \'.\'.',
                'syntax': 'TODO' },
            'inject': {
                'description': 'Specifies which routers perform the aggregation and when they perform it.',
                'syntax': 'TODO' },
            'interface': {
                'description': 'Specifies a multiprotocol interface address within an Internet router.',
                'syntax': 'TODO' },
            'irt': {
                'description': 'Specifies the name of the irt object. The name should start with the prefix \'IRT-\' reserved for this type of object.',
                'syntax': 'TODO' },
            'irt-nfy': {
                'description': 'Specifies the e-mail address to be notified when a reference to the irt object is added or removed.',
                'syntax': 'TODO' },
            'key-cert': {
                'description': 'Defines the public key stored in the database.',
                'syntax': 'TODO' },
            'language': {
                'description': 'Identifies the language.',
                'syntax': 'TODO' },
            'last-modified': {
                'description': 'This attributes reflects when the object was last changed in ISO8601 format (yyyy-MM-dd\'T\'HH:mm:ssZ.',
                'syntax': 'TODO' },
            'local-as': {
                'description': 'Specifies the autonomous system that operates the router.',
                'syntax': 'TODO' },
            'mbrs-by-ref': {
                'description': 'This attribute can be used in all \'set\' objects; it allows indirect population of a set. If this attribute is used, the set also includes objects of the corresponding type    (aut-num objects for as-set, for example) that are protected by one of these maintainers   and whose \'member-of:\' attributes refer to the name of the set. If the value of a \'mbrs-by-ref:\' attribute is ANY, any object of the corresponding type  referring to the set is a member of the set. If the \'mbrs-by-ref:\' attribute is missing, the set is defined explicitly by the \'members:\' attribute.',
                'syntax': 'TODO' },
            'members': {
                'description': 'Lists the members of the set.',
                'syntax': 'TODO' },
            'member-of': {
                'description': 'This attribute can be used in the route , aut-num and inet-rtr classes. The value of the \'member-of:\' attribute identifies a set object that this object wants to be a member of. This claim  however, should be acknowledged by a respective \'mbrs-by-ref:\' attribute in the referenced object.',
                'syntax': 'TODO' },
            'method': {
                'description': 'Defines the type of the public key.',
                'syntax': 'TODO' },
            'mntner': {
                'description': 'A unique identifier of the mntner object.',
                'syntax': 'TODO' },
            'mnt-by': {
                'description': 'Specifies the identifier of a registered mntner object used for authorisation of operations  performed with the object that contains this attribute.',
                'syntax': 'TODO' },
            'mnt-domains': {
                'description': 'Specifies the identifier of a registered mntner object used for reverse domain authorisation.  Protects domain objects. The authentication method of this maintainer object will be used for any encompassing reverse domain object.',
                'syntax': 'TODO' },
            'mnt-irt': {
                'description': 'May appear in an inetnum or inet6num object. It points to an irt object representing a Computer Security Incident Response Team (CSIRT that handles security incidents for  the address space specified by the inetnum or inet6num object.',
                'syntax': 'TODO' },
            'mnt-lower': {
                'description': 'Specifies the identifier of a registered mntner object used for hierarchical authorisation.  Protects creation of objects directly (one level below in the hierarchy of an object type. The authentication method of this maintainer object will then be used upon creation of any  object directly below the object that contains the \'mnt-lower:\' attribute.',
                'syntax': 'TODO' },
            'mnt-nfy': {
                'description': 'Specifies the e-mail address to be notified when an object protected by a mntner is successfully updated.',
                'syntax': 'TODO' },
            'mnt-ref': {
                'description': 'Specifies the maintainer objects that are entitled to add references to the organisation object from other objects.',
                'syntax': 'TODO' },
            'mnt-routes': null, // specified object specific table
            'mp-default': {
                'description': 'Specifies default multiprotocol routing policies.',
                'syntax': 'TODO' },
            'mp-export': {
                'description': 'Specifies a multiprotocol export policy expression.',
                'syntax': 'TODO' },
            'export-via': {
                'description': 'Specifies an export policy expression targeted at a non-adjacent network.',
                'syntax': 'TODO' },
            'mp-filter': {
                'description': 'Defines the set\'s multiprotocol policy filter.',
                'syntax': 'TODO' },
            'mp-import': {
                'description': 'Specifies multiprotocol import policy expression.',
                'syntax': 'TODO' },
            'import-via': {
                'description': 'Specifies an import policy expression targeted at a non-adjacent network.',
                'syntax': 'TODO' },
            'mp-members': {
                'description': 'Lists the multiprotocol members of the set.',
                'syntax': 'TODO' },
            'mp-peer': null,  // specified object specific table
            'mp-peering': {
                'description': ' Defines a multiprotocol peering that can be used for importing or exporting routes.',
                'syntax': 'TODO' },
            'netname': {
                'description': 'The name of a range of IP address space.',
                'syntax': 'TODO' },
            'nic-hdl': {
                'description': 'Specifies the NIC handle of a role or person object. When creating an object specify an \'AUTO\' NIC handle by setting the value of the attribute to \'AUTO-1\'  or AUTO-1. In such case the database will assign the NIC handle automatically.',
                'syntax': 'TODO' },
            'notify': {
                'description': 'Specifies the e-mail address to which notifications of changes to an object should be sent.  This attribute is filtered from the default whois output.',
                'syntax': 'TODO' },
            'nserver': {
                'description': 'Specifies the nameservers of the domain.',
                'syntax': 'TODO' },
            'org': {
                'description': 'Points to an existing organisation object representing the entity that holds the resource.',
                'syntax': 'TODO' },
            'org-name': {
                'description': 'Specifies the name of the organisation that this organisation object represents in the RIPE Database. This is an ASCII-only text attribute. The restriction is because this attribute is a look-up key and the whois protocol does not allow specifying character sets in queries.  The user can put the name of the organisation in non-ASCII character sets in the \'descr:\' attribute if required.',
                'syntax': 'TODO' },
            'org-type': {
                'description': 'Specifies the type of the organisation.',
                'syntax': 'TODO' },
            'organisation': {
                'description': 'Specifies the ID of an organisation object. When creating an object an \'AUTO\' ID by setting the value of the attribute to \'AUTO-1\' or \'AUTO-1\' so the database will assign the ID automatically.',
                'syntax': 'TODO' },
            'origin': {
                'description': 'Specifies the AS that originates the route. The corresponding aut-num object should be registered in the database.',
                'syntax': 'TODO' },
            'owner': {
                'description': 'Specifies the owner of the public key.',
                'syntax': 'TODO' },
            'peer': {
                'description': 'Details of any (interior or exterior router peerings.',
                'syntax': 'TODO' },
            'peering': {
                'description': 'Defines a peering that can be used for importing or exporting routes.',
                'syntax': 'TODO' },
            'peering-set': {
                'description': 'Specifies the name of the peering-set.',
                'syntax': 'TODO' },
            'person': {
                'description': 'Specifies the full name of an administrative other objects in the database.',
                'syntax': 'TODO' },
            'phone': {
                'description': 'Specifies a telephone number of the contact.',
                'syntax': 'TODO' },
            'ping-hdl': {
                'description': 'References a person or role capable of responding to queries concerning the IP address(es  specified in the \'pingable\' attribute.', 'syntax': 'TODO' },
            'pingable': {
                'description': 'Allows a network operator to advertise an IP address of a node that should be reachable from outside networks. This node can be used as a destination address for diagnostic tests. The IP address must be within the address range of the prefix containing this attribute.',
                'syntax': 'TODO' },
            'poem': {
                'description': 'Specifies the title of the poem.',
                'syntax': 'TODO' },
            'poetic-form': {
                'description': 'Specifies the poem type.',
                'syntax': 'TODO' },
            'ref-nfy': {
                'description': 'Specifies the e-mail address to be notified when a reference to the organisation object is added  or removed. This attribute is filtered from the default whois output when at least one of the  objects returned by the query contains an abuse-mailbox attribute.', 'syntax': 'TODO' },
            'remarks': {
                'description': 'Contains remarks.',
                'syntax': 'TODO' },
            'role': {
                'description': 'Specifies the full name of a role entity, e.g. RIPE DBM.',
                'syntax': 'TODO' },
            'route': {
                'description': 'Specifies the prefix of the interAS route. Together with the \'origin:\' attribute constitutes a primary key of the route object.',
                'syntax': 'TODO' },
            'route6': {
                'description': 'Specifies the IPv6 prefix of the interAS route. Together with the \'origin:\' attribute, constitutes a primary key of the route6 object.',
                'syntax': 'TODO' },
            'route-set': {
                'description': 'Specifies the name of the route set. It is a primary key for the route-set object.',
                'syntax': 'TODO' },
            'rtr-set': {
                'description': 'Defines the name of the rtr-set.',
                'syntax': 'TODO' },
            'signature': {
                'description': 'References a key-cert object representing a CSIRT public key used by the team to sign their correspondence.',
                'syntax': 'TODO' },
            'source': {
                'description': 'Specifies the registry where the object is registered. Should be \'RIPE\' for the RIPE Database.',
                'syntax': 'TODO' },
            'sponsoring-org': {
                'description': 'Points to an existing organisation object representing the sponsoring organisation responsible for the resource.',
                'syntax': 'TODO' },
            'status': {
                'description': 'Specifies the status of the resource.',
                'syntax': 'TODO' },
            'tech-c': {
                'description': 'References a technical contact.',
                'syntax': 'TODO' },
            'text': {
                'description': 'Text of the poem. Must be humorous, but not malicious or insulting.',
                'syntax': 'TODO' },
            'upd-to': {
                'description': 'Specifies the e-mail address to be notified when an object protected by a mntner is unsuccessfully updated.',
                'syntax': 'TODO' },
            'zone-c': {
                'description': 'References a zone contact.' ,
                'syntax': 'TODO' }
        };

        this._mntRoutesDoc = {
            'aut-num': {
                'description' : 'This attribute references a maintainer object which is used in ' +
                                'determining authorisation for the creation of route6 objects. ' +
                                'This entry is for the mnt-routes attribute of aut-num class. ' +
                                'After the reference to the maintainer, an optional list of ' +
                                'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
                                'follow. The default, when no additional set items are ' +
                                'specified, is \'ANY\' or all more specifics.',
                'syntax':'TODO'
            },
            'inet6num': {
                'description' : 'This attribute references a maintainer object which is used in ' +
                                'determining authorisation for the creation of route6 objects. ' +
                                'This entry is for the mnt-routes attribute of route6 and inet6num classes. ' +
                                'After the reference to the maintainer, an optional list of ' +
                                'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
                                'follow. The default, when no additional set items are ' +
                                'specified, is \'ANY\' or all more specifics.',
                'syntax':'TODO'
            },
            'inetnum': {
                'description' : 'This attribute references a maintainer object which is used in ' +
                                'determining authorisation for the creation of route objects. ' +
                                'After the reference to the maintainer, an optional list of ' +
                                'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
                                'follow. The default, when no additional set items are ' +
                                'specified, is \'ANY\' or all more specifics. Please refer to ' +
                                'RFC-2622 for more information.',
                'syntax':'TODO'
            },
            'route': {
                'description' : 'This attribute references a maintainer object which is used in ' +
                                'determining authorisation for the creation of route objects. ' +
                                'After the reference to the maintainer, an optional list of ' +
                                'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
                                'follow. The default, when no additional set items are ' +
                                'specified, is \'ANY\' or all more specifics. Please refer to ' +
                                'RFC-2622 for more information.',
                'syntax':'TODO'
            },
            'route6': {
                'description' :'This attribute references a maintainer object which is used in ' +
                                'determining authorisation for the creation of route6 objects. ' +
                                'This entry is for the mnt-routes attribute of route6 and inet6num classes. ' +
                                'After the reference to the maintainer, an optional list of ' +
                                'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
                                'follow. The default, when no additional set items are ' +
                                'specified, is \'ANY\' or all more specifics.',
                'syntax':'TODO'
            }
        };

        this._mpPeerDoc = {
            'inet-rtr': {
                'description': 'Details of any (interior or exterior) multiprotocol router peerings.',
                'syntax': 'TODO mp-peer attr of inet-rtr'
            },
            'peering-set': {
                'description': 'Defines a multiprotocol peering that can be used for importing or exporting routes.',
                'syntax': 'TODO'
            }
        };

    });
