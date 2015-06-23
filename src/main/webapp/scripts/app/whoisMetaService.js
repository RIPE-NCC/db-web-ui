'use strict';

angular.module('dbWebApp')
    .service('WhoisMetaService', function () {

        this._getAttributeDocumentation = function (objectType, attrName) {
            var description = null;
            if (attrName === 'mp-peer') {
                description = this._mpPeerDoc[objectType];
            } else if (attrName === 'mnt-routes') {
                description = this._mntRoutesDoc[objectType];
            }
            if (! description) {
                description = this._attrDocumentation[attrName];
            }
            return description;
        };

        this._getMetaAttributesOnObjectType = function (objectTypeName, mandatoryOnly) {
            if (!objectTypeName) {
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
                return {
                    name: attr.name,
                    value: attr.value,
                    $$meta: {
                        $$idx: attr.$$meta.$$idx,
                        $$mandatory: attrMeta.mandatory,
                        $$multiple: attrMeta.multiple,
                        $$description: self._getAttributeDocumentation(objectTypeName, attr.name),
                        $$refs: attrMeta.refs
                    }
                };
            });

            return after;
        };

        this.getAddableAttributes = function (objectType) {
            return _.filter(this.getAllAttributesOnObjectType(objectType), function (attr) {
                return attr.$$meta.$$multiple;
            });
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
                        $$description: self._getAttributeDocumentation(objectTypeName, am.name),
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
                        $$description: self._getAttributeDocumentation(objectTypeName, x.name),
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
                    {name: 'as-block', mandatory: true, multiple: false, refs: []},
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
                    {name: 'as-set', mandatory: true, multiple: false, refs: []},
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
                    {name: 'aut-num', mandatory: true, multiple: false, refs: []},
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
                    {name: 'domain', mandatory: true, multiple: false, refs: []},
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
                    {name: 'filter-set', mandatory: true, multiple: false, refs: []},
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
                    {name: 'inet6num', mandatory: true, multiple: false, refs: []},
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
                    {name: 'inetnum', mandatory: true, multiple: false, refs: []},
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
                    {name: 'inet-rtr', mandatory: true, multiple: false, refs: []},
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
                    {name: 'irt', mandatory: true, multiple: false, refs: []},
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
                    {name: 'key-cert', mandatory: true, multiple: false, refs: []},
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
                    {name: 'mntner', mandatory: true, multiple: false, refs: []},
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
                    {name: 'organisation', mandatory: true, multiple: false, refs: []},
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
                    {name: 'peering-set', mandatory: true, multiple: false, refs: []},
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
                    {name: 'nic-hdl', mandatory: true, multiple: false, refs: []},
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
                    {name: 'poem', mandatory: true, multiple: false, refs: []},
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
                    {name: 'poetic-form', mandatory: true, multiple: false, refs: []},
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
                    {name: 'nic-hdl', mandatory: true, multiple: false, refs: []},
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
                    {name: 'route', mandatory: true, multiple: false, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'origin', mandatory: true, multiple: false, refs: ['AUT_NUM']},
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
                    {name: 'route6', mandatory: true, multiple: false, refs: []},
                    {name: 'descr', mandatory: true, multiple: true, refs: []},
                    {name: 'origin', mandatory: true, multiple: false, refs: ['AUT_NUM']},
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
                    {name: 'route-set', mandatory: true, multiple: false, refs: []},
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
                    {name: 'rtr-set', mandatory: true, multiple: false, refs: []},
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
            'abuse-mailbox': 'Specifies the e-mail address to which abuse complaints should be sent.  This attribute should only be used in the ROLE object. It will be deprecated from any other object.  Adding this attribute to a ROLE object will remove any query limits for the ROLE object. These ROLE objects are considered to include only commercial data.',
            'abuse-c': 'References an abuse contact.  This can only be a ROLE object containing an \'abuse-mailbox:\' attribute.  Making this reference will remove any query limits for the ROLE object. These ROLE objects are considered to include only commercial data.',
            'address': 'Full postal address of a contact',
            'admin-c': 'References an on-site administrative contact.',
            'aggr-bndry': 'Defines a set of ASes  which form the aggregation boundary.',
            'aggr-mtd': 'Specifies how the aggregate is generated.',
            'alias': 'The canonical DNS name for the router.',
            'assignment-size': 'Specifies the size of blocks assigned to end users from this aggregated inet6num assignment.',
            'as-block': 'Range of AS numbers.',
            'as-name': 'A descriptive name associated with an AS.',
            'as-set': 'Defines the name of the set.',
            'auth': 'Defines an authentication scheme to be used.',
            'author': 'References a poem author.',
            'aut-num': 'The autonomous system number.',
            'certif': 'Contains the public key.',
            'changed': 'Specifies who submitted the update. This attribute is filtered from the default whois output. This attribute is deprecated and will be removed in a next release.',
            'components': 'The \'components:\' attribute defines what component routes are used to form the aggregate.',
            'country': 'Identifies the country.',
            'created': 'This attributes reflects when the object was created in ISO8601 format (yyyy-MM-dd\'T\'HH:mm:ssZ.',
            'default': 'Specifies default routing policies.',
            'descr': 'A short decription related to the object.',
            'domain': 'Domain name.',
            'ds-rdata': 'DS records for this domain.',
            'encryption': 'References a key-cert object representing a CSIRT public key used  to encrypt correspondence sent to the CSIRT.',
            'export': 'Specifies an export policy expression.',
            'export-comps': 'Defines the set\'s policy filter, a logical expression which when applied to a set of routes returns a subset of these routes.',
            'e-mail': 'The e-mail address of a person. This attribute is filtered from the default whois output when at least one of the objects returned by the query contains an abuse-mailbox attribute.',
            'fax-no': 'The fax number of a contact.',
            'filter': 'Defines the set\'s policy filter.',
            'filter-set': 'Defines the name of the filter.',
            'fingerpr': 'A fingerprint of a key certificate generated by the database.',
            'form': 'Specifies the identifier of a registered poem type.',
            'geoloc': 'The location coordinates for the resource.',
            'holes': 'Lists the component address prefixes that are not reachable through the aggregate route (perhaps that part of the address space is unallocated.',
            'ifaddr': 'Specifies an interface address within an Internet router.',
            'import': 'Specifies import policy expression.',
            'inet6num': 'Specifies a range of IPv6 addresses in prefix notation.',
            'inetnum': 'Specifies a range of IPv4 that inetnum object presents.  The ending address should be greater than the starting one.',
            'inet-rtr': 'Fully qualified DNS name of the inet-rtr without trailing \'.\'.',
            'inject': 'Specifies which routers perform the aggregation and when they perform it.',
            'interface': 'Specifies a multiprotocol interface address within an Internet router.',
            'irt': 'Specifies the name of the irt object. The name should start with the prefix \'IRT-\' reserved for this type of object.',
            'irt-nfy': 'Specifies the e-mail address to be notified when a reference to the irt object is added or removed.',
            'key-cert': 'Defines the public key stored in the database.',
            'language': 'Identifies the language.',
            'last-modified': 'This attributes reflects when the object was last changed in ISO8601 format (yyyy-MM-dd\'T\'HH:mm:ssZ.',
            'local-as': 'Specifies the autonomous system that operates the router.',
            'mbrs-by-ref': 'This attribute can be used in all \'set\' objects; it allows indirect population of a set. If this attribute is used, the set also includes objects of the corresponding type    (aut-num objects for as-set, for example) that are protected by one of these maintainers   and whose \'member-of:\' attributes refer to the name of the set. If the value of a \'mbrs-by-ref:\' attribute is ANY, any object of the corresponding type  referring to the set is a member of the set. If the \'mbrs-by-ref:\' attribute is missing, the set is defined explicitly by the \'members:\' attribute.',
            'members': 'Lists the members of the set.',
            'member-of': 'This attribute can be used in the route , aut-num and inet-rtr classes. The value of the \'member-of:\' attribute identifies a set object that this object wants to be a member of. This claim  however, should be acknowledged by a respective \'mbrs-by-ref:\' attribute in the referenced object.',
            'method': 'Defines the type of the public key.',
            'mntner': 'A unique identifier of the mntner object.',
            'mnt-by': 'Specifies the identifier of a registered mntner object used for authorisation of operations  performed with the object that contains this attribute.',
            'mnt-domains': 'Specifies the identifier of a registered mntner object used for reverse domain authorisation.  Protects domain objects. The authentication method of this maintainer object will be used for any encompassing reverse domain object.',
            'mnt-irt': 'May appear in an inetnum or inet6num object. It points to an irt object representing a Computer Security Incident Response Team (CSIRT that handles security incidents for  the address space specified by the inetnum or inet6num object.',
            'mnt-lower': 'Specifies the identifier of a registered mntner object used for hierarchical authorisation.  Protects creation of objects directly (one level below in the hierarchy of an object type. The authentication method of this maintainer object will then be used upon creation of any  object directly below the object that contains the \'mnt-lower:\' attribute.',
            'mnt-nfy': 'Specifies the e-mail address to be notified when an object protected by a mntner is successfully updated.',
            'mnt-ref': 'Specifies the maintainer objects that are entitled to add references to the organisation object from other objects.',
            'mnt-routes': null, // specified object specific table
            'mp-default': 'Specifies default multiprotocol routing policies.',
            'mp-export': 'Specifies a multiprotocol export policy expression.',
            'export-via': 'Specifies an export policy expression targeted at a non-adjacent network.',
            'mp-filter': 'Defines the set\'s multiprotocol policy filter.',
            'mp-import': 'Specifies multiprotocol import policy expression.',
            'import-via': 'Specifies an import policy expression targeted at a non-adjacent network.',
            'mp-members': 'Lists the multiprotocol members of the set.',
            'mp-peer': null,  // specified object specific table
            'mp-peering': ' Defines a multiprotocol peering that can be used for importing or exporting routes.',
            'netname': 'The name of a range of IP address space.',
            'nic-hdl': 'Specifies the NIC handle of a role or person object. When creating an object specify an \'AUTO\' NIC handle by setting the value of the attribute to \'AUTO-1\'  or AUTO-1. In such case the database will assign the NIC handle automatically.',
            'notify': 'Specifies the e-mail address to which notifications of changes to an object should be sent.  This attribute is filtered from the default whois output.',
            'nserver': 'Specifies the nameservers of the domain.',
            'org': 'Points to an existing organisation object representing the entity that holds the resource.',
            'org-name': 'Specifies the name of the organisation that this organisation object represents in the RIPE Database. This is an ASCII-only text attribute. The restriction is because this attribute is a look-up key and the whois protocol does not allow specifying character sets in queries.  The user can put the name of the organisation in non-ASCII character sets in the \'descr:\' attribute if required.',
            'org-type': 'Specifies the type of the organisation.',
            'organisation': 'Specifies the ID of an organisation object. When creating an object an \'AUTO\' ID by setting the value of the attribute to \'AUTO-1\' or \'AUTO-1\' so the database will assign the ID automatically.',
            'origin': 'Specifies the AS that originates the route. The corresponding aut-num object should be registered in the database.',
            'owner': 'Specifies the owner of the public key.',
            'peer': 'Details of any (interior or exterior router peerings.',
            'peering': 'Defines a peering that can be used for importing or exporting routes.',
            'peering-set': 'Specifies the name of the peering-set.',
            'person': 'Specifies the full name of an administrative other objects in the database.',
            'phone': 'Specifies a telephone number of the contact.',
            'ping-hdl': 'References a person or role capable of responding to queries concerning the IP address(es  specified in the \'pingable\' attribute.',
            'pingable': 'Allows a network operator to advertise an IP address of a node that should be reachable from outside networks. This node can be used as a destination address for diagnostic tests. The IP address must be within the address range of the prefix containing this attribute.',
            'poem': 'Specifies the title of the poem.',
            'poetic-form': 'Specifies the poem type.',
            'ref-nfy': 'Specifies the e-mail address to be notified when a reference to the organisation object is added  or removed. This attribute is filtered from the default whois output when at least one of the  objects returned by the query contains an abuse-mailbox attribute.',
            'remarks': 'Contains remarks.',
            'role': 'Specifies the full name of a role entity, e.g. RIPE DBM.',
            'route': 'Specifies the prefix of the interAS route. Together with the \'origin:\' attribute constitutes a primary key of the route object.',
            'route6': 'Specifies the IPv6 prefix of the interAS route. Together with the \'origin:\' attribute, constitutes a primary key of the route6 object.',
            'route-set': 'Specifies the name of the route set. It is a primary key for the route-set object.',
            'rtr-set': 'Defines the name of the rtr-set.',
            'signature': 'References a key-cert object representing a CSIRT public key used by the team to sign their correspondence.',
            'source': 'Specifies the registry where the object is registered. Should be \'RIPE\' for the RIPE Database.',
            'sponsoring-org': 'Points to an existing organisation object representing the sponsoring organisation responsible for the resource.',
            'status': 'Specifies the status of the resource.',
            'tech-c': 'References a technical contact.',
            'text': 'Text of the poem. Must be humorous, but not malicious or insulting.',
            'upd-to': 'Specifies the e-mail address to be notified when an object protected by a mntner is unsuccessfully updated.',
            'zone-c': 'References a zone contact.'
        };

        this._mntRoutesDoc = {
            'aut-num': 'This attribute references a maintainer object which is used in ' +
            'determining authorisation for the creation of route6 objects. ' +
            'This entry is for the mnt-routes attribute of aut-num class. ' +
            'After the reference to the maintainer, an optional list of ' +
            'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
            'follow. The default, when no additional set items are ' +
            'specified, is \'ANY\' or all more specifics.',
            'inet6num': 'This attribute references a maintainer object which is used in ' +
            'determining authorisation for the creation of route6 objects. ' +
            'This entry is for the mnt-routes attribute of route6 and inet6num classes. ' +
            'After the reference to the maintainer, an optional list of ' +
            'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
            'follow. The default, when no additional set items are ' +
            'specified, is \'ANY\' or all more specifics.',
            'inetnum': 'This attribute references a maintainer object which is used in ' +
            'determining authorisation for the creation of route objects. ' +
            'After the reference to the maintainer, an optional list of ' +
            'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
            'follow. The default, when no additional set items are ' +
            'specified, is \'ANY\' or all more specifics. Please refer to ' +
            'RFC-2622 for more information.',
            'route': 'This attribute references a maintainer object which is used in ' +
            'determining authorisation for the creation of route objects. ' +
            'After the reference to the maintainer, an optional list of ' +
            'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
            'follow. The default, when no additional set items are ' +
            'specified, is \'ANY\' or all more specifics. Please refer to ' +
            'RFC-2622 for more information.',
            'route6': 'This attribute references a maintainer object which is used in ' +
            'determining authorisation for the creation of route6 objects. ' +
            'This entry is for the mnt-routes attribute of route6 and inet6num classes. ' +
            'After the reference to the maintainer, an optional list of ' +
            'prefix ranges inside of curly braces or the keyword \'ANY\' may ' +
            'follow. The default, when no additional set items are ' +
            'specified, is \'ANY\' or all more specifics.'

        };

        this._mpPeerDoc = {
            'inet-rtr': 'Details of any (interior or exterior) multiprotocol router peerings.',
            'peering-set': 'Defines a multiprotocol peering that can be used for importing or exporting routes.'

        };

    });
