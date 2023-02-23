import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { IAttributeModel, IWhoisLinkModel } from './whois-response-type.model';

@Injectable()
export class WhoisMetaService {
    public refs: string[] = [];

    public objectTypesMap = {
        'as-block': {
            attributes: [
                { name: 'as-block', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: false, refs: ['MNTNER'] },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'as-block',
        },
        'as-set': {
            attributes: [
                { name: 'as-set', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'members', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mbrs-by-ref', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'as-set',
        },
        'aut-num': {
            attributes: [
                { name: 'aut-num', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'as-name', mandatory: true, multiple: false, refs: this.refs, searchable: true },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs, searchable: true },
                { name: 'member-of', mandatory: false, multiple: true, refs: ['AS-SET', 'ROUTE-SET', 'RTR-SET'] },
                { name: 'import-via', mandatory: false, multiple: true, refs: this.refs },
                { name: 'import', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mp-import', mandatory: false, multiple: true, refs: this.refs },
                { name: 'export-via', mandatory: false, multiple: true, refs: this.refs },
                { name: 'export', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mp-export', mandatory: false, multiple: true, refs: this.refs },
                { name: 'default', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mp-default', mandatory: false, multiple: true, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: false, refs: ['ORGANISATION'] },
                { name: 'sponsoring-org', mandatory: false, multiple: false, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'abuse-c', mandatory: false, multiple: false, refs: ['ROLE'] },
                { name: 'status', mandatory: false, multiple: false, refs: this.refs, isEnum: true },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'aut-num',
        },
        domain: {
            attributes: [
                { name: 'domain', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'zone-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'nserver', mandatory: true, multiple: true, refs: this.refs },
                { name: 'ds-rdata', mandatory: false, multiple: true, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'domain',
        },
        'filter-set': {
            attributes: [
                { name: 'filter-set', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'filter', mandatory: false, multiple: false, refs: this.refs },
                { name: 'mp-filter', mandatory: false, multiple: false, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'filter-set',
        },
        'inet-rtr': {
            attributes: [
                { name: 'inet-rtr', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'alias', mandatory: false, multiple: true, refs: this.refs },
                { name: 'local-as', mandatory: true, multiple: false, refs: this.refs },
                { name: 'ifaddr', mandatory: true, multiple: true, refs: this.refs },
                { name: 'interface', mandatory: false, multiple: true, refs: this.refs },
                { name: 'peer', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mp-peer', mandatory: false, multiple: true, refs: this.refs },
                { name: 'member-of', mandatory: false, multiple: true, refs: ['AS-SET', 'ROUTE-SET', 'RTR-SET'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'inet-rtr',
        },
        inet6num: {
            attributes: [
                { name: 'inet6num', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'netname', mandatory: true, multiple: false, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'country', mandatory: true, multiple: true, refs: this.refs, isEnum: true },
                { name: 'geofeed', mandatory: false, multiple: false, refs: this.refs },
                { name: 'geoloc', mandatory: false, multiple: false, refs: this.refs },
                { name: 'language', mandatory: false, multiple: true, refs: this.refs, isEnum: true },
                { name: 'org', mandatory: false, multiple: false, refs: ['ORGANISATION'] },
                { name: 'sponsoring-org', mandatory: false, multiple: false, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'abuse-c', mandatory: false, multiple: false, refs: ['ROLE'] },
                { name: 'status', mandatory: true, multiple: false, refs: this.refs, isEnum: true },
                { name: 'assignment-size', mandatory: false, multiple: false, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-domains', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-irt', mandatory: false, multiple: true, refs: ['IRT'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'inet6num',
        },
        inetnum: {
            attributes: [
                { name: 'inetnum', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'netname', mandatory: true, multiple: false, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'country', mandatory: true, multiple: true, refs: this.refs, isEnum: true },
                { name: 'geofeed', mandatory: false, multiple: false, refs: this.refs },
                { name: 'geoloc', mandatory: false, multiple: false, refs: this.refs },
                { name: 'language', mandatory: false, multiple: true, refs: this.refs, isEnum: true },
                { name: 'org', mandatory: false, multiple: false, refs: ['ORGANISATION'] },
                { name: 'sponsoring-org', mandatory: false, multiple: false, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'abuse-c', mandatory: false, multiple: false, refs: ['ROLE'] },
                { name: 'status', mandatory: true, multiple: false, refs: this.refs, isEnum: true },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-domains', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-irt', mandatory: false, multiple: true, refs: ['IRT'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'inetnum',
        },
        irt: {
            attributes: [
                { name: 'irt', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'address', mandatory: true, multiple: true, refs: this.refs },
                { name: 'phone', mandatory: false, multiple: true, refs: this.refs },
                { name: 'fax-no', mandatory: false, multiple: true, refs: this.refs },
                { name: 'e-mail', mandatory: true, multiple: true, refs: this.refs },
                { name: 'abuse-mailbox', mandatory: false, multiple: true, refs: this.refs },
                { name: 'signature', mandatory: false, multiple: true, refs: ['KEY-CERT'] },
                { name: 'encryption', mandatory: false, multiple: true, refs: ['KEY-CERT'] },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'auth', mandatory: true, multiple: true, refs: ['KEY-CERT'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'irt-nfy', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'irt',
        },
        'key-cert': {
            attributes: [
                { name: 'key-cert', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'method', mandatory: false, multiple: false, refs: this.refs },
                { name: 'owner', mandatory: false, multiple: true, refs: this.refs, searchable: true },
                { name: 'fingerpr', mandatory: false, multiple: false, refs: this.refs },
                { name: 'certif', mandatory: true, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'admin-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'key-cert',
        },
        mntner: {
            attributes: [
                { name: 'mntner', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs, searchable: true },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'upd-to', mandatory: true, multiple: true, refs: this.refs },
                { name: 'mnt-nfy', mandatory: false, multiple: true, refs: this.refs },
                { name: 'auth', mandatory: true, multiple: true, refs: ['KEY-CERT'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'abuse-mailbox', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'mntner',
        },
        organisation: {
            attributes: [
                { name: 'organisation', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'org-name', mandatory: true, multiple: false, refs: this.refs, searchable: true },
                { name: 'org-type', mandatory: true, multiple: false, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'address', mandatory: true, multiple: true, refs: this.refs },
                { name: 'country', mandatory: false, multiple: false, refs: this.refs, isEnum: true },
                { name: 'phone', mandatory: false, multiple: true, refs: this.refs },
                { name: 'fax-no', mandatory: false, multiple: true, refs: this.refs },
                { name: 'e-mail', mandatory: true, multiple: true, refs: this.refs },
                { name: 'geoloc', mandatory: false, multiple: false, refs: this.refs },
                { name: 'language', mandatory: false, multiple: true, refs: this.refs, isEnum: true },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'abuse-c', mandatory: false, multiple: false, refs: ['ROLE'] },
                { name: 'ref-nfy', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-ref', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'abuse-mailbox', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'organisation',
        },
        'peering-set': {
            attributes: [
                { name: 'peering-set', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'peering', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mp-peering', mandatory: false, multiple: true, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'peering-set',
        },
        person: {
            attributes: [
                { name: 'person', mandatory: true, multiple: false, refs: this.refs, searchable: true },
                { name: 'address', mandatory: true, multiple: true, refs: this.refs },
                { name: 'phone', mandatory: true, multiple: true, refs: this.refs },
                { name: 'fax-no', mandatory: false, multiple: true, refs: this.refs },
                { name: 'e-mail', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'nic-hdl', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'person',
        },
        poem: {
            attributes: [
                { name: 'poem', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'form', mandatory: true, multiple: false, refs: ['POETIC-FORM'] },
                { name: 'text', mandatory: true, multiple: true, refs: this.refs },
                { name: 'author', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: false, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            // description: undefined,
            name: 'poem',
        },
        'poetic-form': {
            attributes: [
                { name: 'poetic-form', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'poetic-form',
        },
        role: {
            attributes: [
                { name: 'role', mandatory: true, multiple: false, refs: this.refs, searchable: true },
                { name: 'address', mandatory: true, multiple: true, refs: this.refs },
                { name: 'phone', mandatory: false, multiple: true, refs: this.refs },
                { name: 'fax-no', mandatory: false, multiple: true, refs: this.refs },
                { name: 'e-mail', mandatory: true, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'admin-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'tech-c', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'nic-hdl', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'abuse-mailbox', mandatory: false, multiple: false, refs: this.refs, searchable: true },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'role',
        },
        route: {
            attributes: [
                { name: 'route', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'origin', mandatory: true, multiple: false, primaryKey: true, refs: ['AUT-NUM'] },
                { name: 'pingable', mandatory: false, multiple: true, refs: this.refs },
                { name: 'ping-hdl', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'holes', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'member-of', mandatory: false, multiple: true, refs: ['AS-SET', 'ROUTE-SET', 'RTR-SET'] },
                { name: 'inject', mandatory: false, multiple: true, refs: this.refs },
                { name: 'aggr-mtd', mandatory: false, multiple: false, refs: this.refs },
                { name: 'aggr-bndry', mandatory: false, multiple: false, refs: this.refs },
                { name: 'export-comps', mandatory: false, multiple: false, refs: this.refs },
                { name: 'components', mandatory: false, multiple: false, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'route',
        },
        'route-set': {
            attributes: [
                { name: 'route-set', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'members', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mp-members', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mbrs-by-ref', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            // description: undefined,
            name: 'route-set',
        },
        route6: {
            attributes: [
                { name: 'route6', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'origin', mandatory: true, multiple: false, primaryKey: true, refs: ['AUT-NUM'] },
                { name: 'pingable', mandatory: false, multiple: true, refs: this.refs },
                { name: 'ping-hdl', mandatory: false, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'holes', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'member-of', mandatory: false, multiple: true, refs: ['AS-SET', 'ROUTE-SET', 'RTR-SET'] },
                { name: 'inject', mandatory: false, multiple: true, refs: this.refs },
                { name: 'aggr-mtd', mandatory: false, multiple: false, refs: this.refs },
                { name: 'aggr-bndry', mandatory: false, multiple: false, refs: this.refs },
                { name: 'export-comps', mandatory: false, multiple: false, refs: this.refs },
                { name: 'components', mandatory: false, multiple: false, refs: this.refs },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-routes', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'route6',
        },
        'rtr-set': {
            attributes: [
                { name: 'rtr-set', mandatory: true, multiple: false, primaryKey: true, refs: this.refs },
                { name: 'descr', mandatory: false, multiple: true, refs: this.refs },
                { name: 'members', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mp-members', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mbrs-by-ref', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'remarks', mandatory: false, multiple: true, refs: this.refs },
                { name: 'org', mandatory: false, multiple: true, refs: ['ORGANISATION'] },
                { name: 'tech-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'admin-c', mandatory: true, multiple: true, refs: ['PERSON', 'ROLE'] },
                { name: 'notify', mandatory: false, multiple: true, refs: this.refs },
                { name: 'mnt-by', mandatory: true, multiple: true, refs: ['MNTNER'] },
                { name: 'mnt-lower', mandatory: false, multiple: true, refs: ['MNTNER'] },
                { name: 'created', mandatory: false, multiple: false, refs: this.refs },
                { name: 'last-modified', mandatory: false, multiple: false, refs: this.refs },
                { name: 'source', mandatory: true, multiple: false, refs: this.refs },
            ],
            name: 'rtr-set',
        },
    };

    public getAttributeShortDescription(objectType: string, attrName: string) {
        let short = this._getDocumentationForAttribute(objectType, attrName, 'short');
        if (_.isUndefined(short)) {
            short = this._getDocumentationForAttribute(objectType, attrName, 'description');
        }
        return short;
    }

    public getAttributeDescription(objectType: string, attrName: string) {
        return this._getDocumentationForAttribute(objectType, attrName, 'description');
    }

    public getAttributeSyntax(objectType: string, attrName: string) {
        return this._getDocumentationForAttribute(objectType, attrName, 'syntax');
    }

    public getMetaAttributesOnObjectType(objectTypeName: string, mandatoryOnly: boolean) {
        const objectTypeLowerCase = objectTypeName.toLowerCase();
        if (!objectTypeName || !this.objectTypesMap[objectTypeLowerCase]) {
            return [];
        }
        if (mandatoryOnly === false) {
            return this.objectTypesMap[objectTypeLowerCase].attributes;
        }
        return this.objectTypesMap[objectTypeLowerCase].attributes.filter((attr: any) => {
            return attr.mandatory === mandatoryOnly;
            // return attr.$$meta.$$mandatory === mandatoryOnly;
        });
    }

    public findMetaAttributeOnObjectTypeAndName(objectTypeName: string, attributeName: string) {
        const objectTypeLowerCase = objectTypeName.toLowerCase();
        if (!objectTypeName || !this.objectTypesMap[objectTypeLowerCase]) {
            return undefined;
        }
        return _.find(this.objectTypesMap[objectTypeLowerCase].attributes, (attr: IAttributeModel) => {
            return attr.name === attributeName;
        });
    }

    public getObjectTypes() {
        const keys: string[] = [];
        for (const key in this.objectTypesMap) {
            keys.push(key);
        }
        return keys;
    }

    public getObjectTypesMap() {
        return this.objectTypesMap;
    }

    public isExistingObjectTypes(objectType: string): boolean {
        if (objectType) {
            return this.objectTypesMap[objectType.toLowerCase()] !== undefined;
        }
        return false;
    }

    public enrichAttributesWithMetaInfo(objectTypeName: string, attrs: IAttributeModel[]) {
        if (_.isUndefined(objectTypeName) || _.isUndefined(attrs)) {
            return attrs;
        }
        const attrsMeta = this.getMetaAttributesOnObjectType(objectTypeName, false);

        const enrichedAttrs: IAttributeModel[] = [];
        let i = 0;
        attrs.forEach((attr) => {
            attr.$$id = 'attr-' + i;
            i++;
            const attrMeta = _.find(attrsMeta, (am: IAttributeModel) => {
                return am.name === attr.name;
            });
            if (!_.isUndefined(attrMeta)) {
                if (!_.isUndefined(attr.$$meta)) {
                    enrichedAttrs.push(attr);
                } else {
                    let value = attr.value;
                    if (attr.comment && attr.comment !== '') {
                        if (attr.value && attr.value.trim().length > 0) {
                            value += ' ';
                        }
                        value += '# ' + attr.comment;
                    }
                    enrichedAttrs.push(
                        this.wrapMetaInAttribute(this, objectTypeName, attr.name, value, attr.comment, attr.link, attr['referenced-type'], attrMeta, undefined),
                    );
                }
            }
        });

        return enrichedAttrs;
    }

    public getAllAttributesOnObjectType(objectTypeName: string): IAttributeModel[] {
        if (objectTypeName === null) {
            return [];
        }

        // enrich with order info
        let idx = 0;
        return _.map(this.getMetaAttributesOnObjectType(objectTypeName, false), (meta: any) => {
            const wrapped = this.wrapMetaInAttribute(this, objectTypeName, meta.name, undefined, undefined, undefined, undefined, meta, idx);
            idx++;
            return wrapped;
        });
    }

    public getMandatoryAttributesOnObjectType(objectTypeName: string) {
        if (objectTypeName === null) {
            return [];
        }
        // enrich with order info
        let idx = 0;
        return _.map(this.getMetaAttributesOnObjectType(objectTypeName, true), (meta: any) => {
            const wrapped = this.wrapMetaInAttribute(this, objectTypeName, meta.name, '', undefined, undefined, undefined, meta, idx);
            idx++;
            return wrapped;
        });
    }

    private _getDocumentationForAttribute(objectType: string, attrName: string, docKind: string) {
        let doc;
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

        if (doc === null) {
            console.info('objectType, attrName, docKind', objectType, attrName, docKind);
        } else if (!_.isUndefined(doc)) {
            return this.lookupDefaultText(doc, objectType, attrName, docKind);
        } else {
            console.warn('No documentation for objectType:', objectType, 'attrName:', attrName);
        }
        return doc;
    }

    private lookupDefaultText(doc: any, objectType: string, attrName: string, docKind: string) {
        // only for organisation on abuse-c field is shown bell icon
        if (attrName === 'abuse-c' && objectType === 'organisation' && docKind === 'short') {
            return doc[docKind].substring(0, doc[docKind].length - 1) + ` or click the "bell" icon to create one.`;
        }
        return doc[docKind];
    }

    private wrapMetaInAttribute(
        self: any,
        objectTypeName: string,
        attrName: string,
        attrValue: string,
        attrComment: string,
        attrLink: IWhoisLinkModel,
        reffedAttrType: string,
        metaAttribute: any,
        idx?: number,
    ) {
        return {
            $$meta: {
                $$idx: idx,
                $$isEnum: metaAttribute.isEnum,
                $$mandatory: metaAttribute.mandatory,
                $$multiple: metaAttribute.multiple,
                $$primaryKey: metaAttribute.primaryKey,
                $$refs: metaAttribute.refs,
            },
            comment: attrComment,
            link: attrLink,
            name: attrName,
            'referenced-type': reffedAttrType,
            value: attrValue,
        };
    }

    // Structure below holds syntax that occur more than once
    private _shared = {
        alias: {
            syntax: `Domain name as specified in RFC 1034 (point 5.2.1.2) with or without trailing dot (\".\").  The total length should not exceed 254 characters (octets).`,
        },
        asNumber: {
            syntax: 'An "AS" string followed by an integer in the range from 0 to 4294967295',
        },
        email: {
            syntax: 'An e-mail address as defined in RFC 2822.',
        },
        freeForm: {
            syntax: `A sequence of ASCII characters.`,
        },
        generated: {
            syntax: 'Attribute generated by server.',
        },
        irt: {
            syntax:
                'An <strong>irt</strong> name is made up of letters, digits, the underscore "_" and minus "-"' +
                ' characters; it must start with "irt-", and the last character of a name must be a letter or a digit.',
        },
        keyCert: {
            syntax: `PGPKEY-&lt;id&gt;<br>` + `&lt;id&gt; is the PGP key ID of the public key in 8-digit hexadecimal format without the 0x prefix.`,
        },
        nicHandle: {
            syntax:
                'From 2 to 4 characters optionally followed by up to 6 digits optionally followed by a source' +
                ' specification. The first digit must not be "0".  Source specification starts with "-" followed by' +
                ' source name up to 9-character length.',
        },
        organisationName: {
            syntax: `A list of 1 to 30 words separated by white space. A word is made up of letters, digits and the following characters:<br>
             <span class='fraction'>][)(._"*@,&:!'\`+/-</span><br>
            A word may have up to 64 characters and is not case sensitive. Each word can have any combination of the above characters with no restriction on the start or end of a word.`,
        },
        organisation: {
            syntax: `The \"ORG-\" string followed by 2 to 4 characters, followed by up to 5 digits followed by a source specification. The first digit must not be \"0\". Source specification starts with \"-\" followed by source name up to 9-character length.`,
        },
        objectName: {
            syntax:
                'Made up of letters, digits, the underscore "_" and minus "-" characters; the first' +
                ' character of a name must be a letter, and the last character of a name must be a letter or a digit.' +
                '  The following words are reserved by RPSL, and they can not be used as names:<br>' +
                '&emsp;"any as-any rs-any peeras and or not atomic from to at action accept announce except refine' +
                ' networks into inbound outbound."<br>' +
                'Names starting with certain prefixes are reserved for certain object types. Names starting with' +
                ' "as-" are reserved for as set names. Names starting with "rs-" are reserved for route set names.' +
                ' Names starting with "rtrs-" are reserved for router set names. Names starting with "fltr-" are' +
                ' reserved for filter set names. Names starting with "prng-" are reserved for peering set names.' +
                ' Names starting with "irt-" are reserved for irt names.',
        },
        inet: {
            syntax:
                `&lt;protocol&gt; afi &lt;afi&gt; &lt;ipv4- or ipv6 address&gt; &lt;options&gt;` +
                `</br>` +
                `| &lt;protocol&gt; &lt;inet-rtr-name&gt; &lt;options&gt;` +
                `</br>` +
                `| &lt;protocol&gt; &lt;rtr-set-name&gt; &lt;options&gt;` +
                `</br>` +
                `| &lt;protocol&gt; &lt;peering-set-name&gt; &lt;options&gt;`,
        },
        phone: {
            syntax:
                'Contact telephone number. Can take one of the forms:' +
                '<br>' +
                '<br>' +
                '+&lt;integer-list&gt;' +
                '<br>' +
                "+&lt;integer-list&gt; '(' &lt;integer-list&gt; ')' &lt;integer-list&gt;" +
                '<br>' +
                '+&lt;integer-list&gt; ext. &lt;integer list&gt;' +
                '<br>' +
                "+&lt;integer-list&gt; '(' integer list ')' &lt;integer-list&gt; ext. &lt;integer-list&gt;",
        },
        poeticForm: {
            syntax: 'FORM-&lt;string&gt;' + '<br>' + `&lt;string&gt; can include alphanumeric characters, and \"_\" and \"-\" characters.`,
        },
    };

    private _attrDocumentation = {
        'abuse-mailbox': {
            description: `Specifies the e-mail address to which abuse complaints should be sent. This attribute should only be used in the <strong>role</strong> object. It will be deprecated from any other object. Adding this attribute to a <strong>role</strong> object, then referencing it in an \"abuse-c:\" attribute of an <strong>organisation</strong> object, will remove any query limits for the <strong>role</strong> object. These <strong>role</strong> objects are considered to include only commercial data.`,
            short: 'Specifies the e-mail address for abuse complaints.',
            syntax: this._shared.email.syntax,
        },
        'abuse-c': {
            description: `References an abuse contact. This can only be a <strong>role</strong> object containing an \"abuse-mailbox:\" attribute. Making this reference will remove any query limits for the <strong>role</strong> object. These <strong>role</strong> objects are considered to include only commercial data.`,
            short: 'Enter the nic-handle of your abuse-c <strong>role</strong> object.',
            syntax: this._shared.nicHandle.syntax,
        },
        address: {
            description: 'Full postal address of a contact.',
            // short: undefined,
            syntax: this._shared.freeForm.syntax,
        },
        'admin-c': {
            description: 'References an on-site administrative contact.',
            short: 'Nic-handle of an administrative contact.',
            syntax: this._shared.nicHandle.syntax,
        },
        'aggr-bndry': {
            description: 'Defines a set of ASes, which form the aggregation boundary.',
            // short: undefined,
            syntax: '[&lt;as-expression&gt;]',
        },
        'aggr-mtd': {
            description: 'Specifies how the aggregate is generated.',
            short: 'Specifies how the aggregate is generated, e.g. inbound',
            syntax: 'inbound | outbound [&lt;as-expression&gt;]',
        },
        alias: {
            description: 'The canonical DNS name for the router.',
            // short: undefined,
            syntax: this._shared.alias.syntax,
        },
        'assignment-size': {
            description: 'Specifies the size of blocks assigned to end users from this aggregated' + ' <strong>inet6num</strong>' + ' assignment.',
            short: 'Prefix size as a numeric value, e.g. 48',
            syntax: 'Specifies a numeric value.',
        },
        'as-block': {
            description: 'Range of AS numbers.',
            // short: undefined,
            syntax: '&lt;as-number&gt; - &lt;as-number&gt;',
        },
        'as-name': {
            description: 'A descriptive name associated with an AS.',
            // short: undefined,
            syntax: this._shared.objectName.syntax,
        },
        'as-set': {
            description: 'Defines the name of the set.',
            // short: undefined,
            syntax:
                `An <strong>as-set</strong> name is made up of letters, digits, the underscore "_" and minus "-" characters; it must start with \"as-\", and the last character of a name must be a letter or a digit.<br>` +
                `An <strong>as-set</strong> name can also be hierarchical. A hierarchical set name is a sequence of set names and AS numbers separated by colons ":". The first element of the name must be an AS number followed by a colon and ending with a name (example: AS3333:AS-TEST). At least one component of such a name must be an actual set name (i.e. start with \"as-\"). All the set name components of a hierarchical <strong>as-name</strong> have to be <strong>as-set</strong> names. The total length should not exceed 80 characters (octets). Only as-sets with a hierarchical name can be created.`,
        },
        auth: {
            description: 'Defines the authentication scheme to be used.',
            short: 'Defines the authentication scheme, e.g. SSO user@example.net',
            syntax: `<table>
                    <tr>
                        <th>auth-scheme</th>
                        <th>scheme-info</th>
                        <th>Description</th>
                    </tr>
                    <tr><br></tr>
                    <tr>
                        <td>MD5-PW</td>
                        <td>encrypted password, produced using the FreeBSD crypt_md5 algorithm</td>
                        <td>We strongly advise phrases longer than 8 characters to be used, avoiding the use of words or combinations of words found in any dictionary of any language.</td>
                    </tr>
                    <tr><br></tr>
                    <tr>
                        <td>PGPKEY&#8209;&lt;id&gt;</td>
                        <td></td>
                        <td>Strong scheme of authentication. &lt;id&gt; is the PGP key ID to be used for authentication. This string is the same one that is used in the corresponding <strong>key-cert</strong> object's <strong>key-cert</strong>: attribute.</td>
                    </tr>
                    <tr><br></tr>
                    <tr>
                        <td>X509&#8209;&lt;nnn&gt;</td>
                        <td></td>
                        <td>Strong scheme of authentication. &lt;nnn&gt; is the index number of the corresponding <strong>key-cert</strong> object's <strong>key-cert</strong>: attribute (X509-nnn).</td>
                    </tr>
                    <tr><br></tr>
                    <tr>
                        <td>SSO</td>
                        <td>username</td>
                        <td>The username is the same as one used for a RIPE NCC Access account. This must be a valid username and is checked against the RIPE NCC Access user list.</td>
                    </tr>
                </table>`,
        },
        author: {
            description: 'References a poem author.',
            // short: undefined,
            syntax: this._shared.nicHandle.syntax,
        },
        'aut-num': {
            description: 'The autonomous system number.',
            // short: undefined,
            syntax: this._shared.asNumber.syntax,
        },
        certif: {
            description: 'Contains the public key.',
            // short: undefined,
            syntax: `The value of the public key should be supplied either using multiple \"certif:\" attributes, or in one \"certif:\" attribute. In the first case, this is easily done by exporting the key from your local key ring in ASCII armored format and prepending each line of the key with the string \"certif:\". In the second case, line continuation should be used to represent an ASCII armored format of the key. All the lines of the exported key must be included; also the begin and end markers and the empty line which separates the header from the key body.`,
        },
        changed: {
            description: `Specifies who submitted the update, and when the object was updated. This attribute is filtered from the default whois output. This attribute is deprecated and will be removed in a next release.`,
            // short: undefined,
            syntax: `An e-mail address as defined in RFC 2822, followed by a date in the format YYYYMMDD.`,
        },
        components: {
            description: `The \"components:\" attribute defines what component routes are used to form the aggregate.`,
            short: 'Defines what component routes are used to form the aggregate.',
            syntax: '',
        }, // no documentation available
        country: {
            description: 'Identifies the country.',
            short: 'Identifies the country as a two-letter ISO 3166 code, e.g. NL',
            syntax: 'Valid two-letter ISO 3166 country code.',
        },
        created: {
            description: `This attributes reflects when the object was created in <a href="https://en.wikipedia.org/wiki/ISO_8601" target="_blank">ISO 8601 format</a> (yyyy-MM-dd\"T\'HH:mm:ssZ).`,
            short: 'Value will be generated by the server.',
            syntax: this._shared.generated.syntax,
        },
        default: {
            description: 'Specifies default routing policies.',
            // short: undefined,
            syntax: 'to &lt;peering&gt; [action &lt;action&gt;] [networks &lt;filter&gt;]',
        },
        descr: {
            description: 'A short description related to the object.',
            // short: undefined,
            syntax: this._shared.freeForm.syntax,
        },
        domain: {
            description: 'Domain name.',
            short: 'The reverse domain name, e.g. 5.2.0.192.in-addr.arpa',
            syntax:
                'Domain name as specified in RFC 1034 (point 5.2.1.2) with or without trailing dot (".").  The total' +
                ' length should not exceed 254 characters (octets).',
        },
        'ds-rdata': {
            description: 'DS records for this domain.',
            // short: undefined,
            syntax:
                '&lt;Keytag&gt; &lt;Algorithm&gt; &lt;Digest type&gt; &lt;Digest&gt;' +
                '<br>' +
                '<br>' +
                'Keytag is represented by an unsigned decimal integer (0-65535).' +
                '<br>' +
                '<br>' +
                'Algorithm is represented by an unsigned decimal integer (0-255).' +
                '<br>' +
                '<br>' +
                'Digest type is represented by a unsigned decimal integer (0-255).' +
                '<br>' +
                '<br>' +
                'Digest is a digest in hexadecimal representation (case insensitive). Its length varies for various' +
                ' digest types.' +
                '<br>' +
                'For digest type SHA-1 digest is represented by 20 octets (40 characters,' +
                ' plus possible spaces).' +
                '<br>' +
                '<br>' +
                'For more details, see RFC4034.',
        },
        encryption: {
            description: 'References a <strong>key-cert</strong> object representing a CSIRT public key used to encrypt correspondence sent to the CSIRT.',
            short: 'A reference to a CSIRT <strong>key-cert</strong> object',
            syntax: this._shared.keyCert.syntax,
        },
        export: {
            description: 'Specifies an export policy expression.',
            // short: undefined,
            syntax:
                '[protocol &lt;protocol-1&gt;] [into &lt;protocol-1&gt;]' +
                '<br>' +
                ' to &lt;peering-1&gt; [action &lt;action-1&gt;]' +
                '<br>' +
                '    .' +
                '<br>' +
                '    .' +
                '<br>' +
                '    .' +
                '<br>' +
                ' to &lt;peering-N&gt; [action &lt;action-N&gt;]' +
                '<br>' +
                ' announce &lt;filter&gt;',
        },
        'export-comps': {
            description: `Defines the set\'s policy filter, a logical expression which when applied to a set of routes returns a subset of these routes.`,
            short: `Defines the set\'s policy filter.`,
            syntax: '',
        }, // no syntax available
        'e-mail': {
            description: `The e-mail address of a person, role, organisation or irt team. This attribute is filtered from the default whois output when at least one of the objects returned by the query contains an abuse-mailbox attribute.`,
            short: 'The e-mail address of a contact person.',
            syntax: this._shared.email.syntax,
        },
        'fax-no': {
            description: 'The fax number of a contact.',
            short: 'Fax number with country code, e.g. +44 161 715 1234.',
            syntax: this._shared.phone.syntax,
        },
        filter: {
            description: `Defines the set\'s policy filter.`,
            // short: undefined,
            syntax:
                'Logical expression which when applied to a set of routes returns a subset of these routes. Please' +
                ' refer to RFC 2622 for more information.',
        },
        'filter-set': {
            description: 'Defines the name of the filter.',
            // short: undefined,
            syntax:
                `A <strong>filter-set</strong> name is made up of letters, digits, the underscore "_" and minus "-" characters; it must start with \"fltr-\", and the last character of a name must be a letter or a digit.` +
                `<br>` +
                `A <strong>filter-set</strong> name can also be hierarchical. A hierarchical set name is a sequence of set names and AS numbers separated by colons \":\". At least one component of such a name must be an actual set name (i.e. start with \"fltr-\"). All the set name components of a hierarchical <strong>filter-name</strong> have to be <strong>filter-set</strong> names. The total length should not exceed 80 characters (octets).`,
        },
        fingerpr: {
            description: 'A fingerprint of a key certificate generated by the database.',
            // short: undefined,
            syntax: this._shared.generated.syntax,
        },
        form: {
            description: 'Specifies the identifier of a registered poem type.',
            // short: undefined,
            syntax: this._shared.poeticForm.syntax,
        },
        geofeed: {
            description: 'A URL referencing a CSV file containing geolocation data for the resource.',
            syntax: 'Geofeed is a self-published format for IP geolocation data. A URL referencing a CSV file containing geolocation data for the resource. The URL must be valid and it must specify the HTTPS protocol.',
        },
        geoloc: {
            description: `The location coordinates for the resource.`,
            syntax: 'Location coordinates of the resource, in decimal degrees notation. Format is latitude followed by longitude, separated by a space. Latitude ranges from [-90,+90] and longitude from [-180,+180]',
        },
        holes: {
            description:
                'Lists the component address prefixes that are not reachable through the aggregate route (perhaps that part of the address space is unallocated).',
            short: 'Lists the component address prefixes that are not reachable through the aggregate route.',
            syntax: 'An address prefix is represented as an IPv4 address followed by the character slash "/" followed by an integer in the range from 0 to 32. The following are valid address prefixes: 128.9.128.5/32, 128.9.0.0/16, 0.0.0.0/0; and the following address prefixes are invalid: 0/0, 128.9/16 since 0 or 128.9 are not strings containing four integers.',
        },
        ifaddr: {
            description: 'Specifies an interface address within an Internet router.',
            // short: undefined,
            syntax: '&lt;ipv4-address&gt; masklen &lt;integer&gt; [action &lt;action&gt;]',
        },
        import: {
            description: 'Specifies import policy expression.',
            // short: undefined,
            syntax:
                '[protocol &lt;protocol-1&gt;] [into &lt;protocol-1&gt;]' +
                '<br>' +
                'from &lt;peering-1&gt; [action &lt;action-1&gt;]' +
                '<br>' +
                '   .' +
                '<br>' +
                '   .' +
                '<br>' +
                '   .' +
                '<br>' +
                'from &lt;peering-N&gt; [action &lt;action-N&gt;]' +
                '<br>' +
                'accept &lt;filter&gt;',
        },
        inet6num: {
            description: 'Specifies the range of IPv6 addresses in prefix notation.',
            // short: undefined,
            syntax: '&lt;ipv6-address&gt;/&lt;prefix&gt;',
        },
        inetnum: {
            description:
                'Specifies a range of IPv4 that the <strong>inetnum</strong> object presents. The ending address should be greater than the starting one.',
            short: 'Specifies the range of IPv4 addresses in dash or CIDR notation.',
            syntax: '&lt;ipv4-address&gt;-&lt;ipv4-address&gt;',
        },
        'inet-rtr': {
            description: 'Fully qualified DNS name of the inet-rtr without trailing dot.',
            // short: undefined,
            syntax: `Domain name as specified in RFC 1034 (point 5.2.1.2) with or without trailing dot (\".\"). The total length should not exceed 254 characters (octets).`,
        },
        inject: {
            description: 'Specifies which routers perform the aggregation and when they perform it.',
            short: 'Specifies which routers perform the aggregation.',
            syntax: '',
        }, // no syntax available
        interface: {
            description: 'Specifies a multiprotocol interface address within an Internet router.',
            short: 'Specifies a multiprotocol interface address.',
            syntax:
                'afi &lt;afi&gt; &lt;ipv4-address&gt; masklen &lt;integer&gt; [action &lt;action&gt;]' +
                '<br>' +
                'afi &lt;afi&gt; &lt;ipv6-address&gt; masklen &lt;integer&gt; [action &lt;action&gt;]' +
                '<br>' +
                '[tunnel &lt;remote-endpoint-address&gt;,&lt;encapsulation&gt;]',
        },
        irt: {
            description: `Specifies the name of the <strong>irt</strong> object. The name should start with the prefix \"IRT-\" reserved for this type of object.`,
            short: `Specifies the name of the irt <strong>object</strong>, must start with \"IRT-\"`,
            syntax: this._shared.irt.syntax,
        },
        'irt-nfy': {
            description: 'Specifies the e-mail address to be notified when a reference to the <strong>irt</strong> object is added or' + ' removed.',
            short: 'Notification e-mail address when a reference to the <strong>irt</strong> object is added or' + ' removed.',
            syntax: this._shared.email.syntax,
        },
        'key-cert': {
            description: 'Defines the public key stored in the database.',
            short: 'Defines the public key, e.g. PGPKEY-<id>',
            syntax: this._shared.keyCert.syntax,
        },
        language: {
            description: 'Identifies the language.',
            short: 'Identifies the language as a two-letter ISO 639-1 code, e.g. NL.',
            syntax: `Valid two-letter <a href="https://en.wikipedia.org/wiki/ISO_639-1" target="_blank">ISO 639-1 language code</a>.`,
        },
        'last-modified': {
            description: `This attributes reflects when the object was last changed in <a href="https://en.wikipedia.org/wiki/ISO_8601" target="_blank">ISO 8601 format</a> (yyyy-MM-dd\"T\'HH:mm:ssZ).`,
            short: 'Value will be generated by the server.',
            syntax: this._shared.generated.syntax,
        },
        'local-as': {
            description: 'Specifies the autonomous system that operates the router.',
            // short: undefined,
            syntax: this._shared.asNumber.syntax,
        },
        'mbrs-by-ref': {
            description: `This attribute can be used in all <strong>set</strong> objects; it allows indirect population of a set. If this attribute is used, the set also includes objects of the corresponding type (<strong>aut-num</strong> objects for <strong>as-set</strong>, for example) that are protected by one of these maintainers and whose \"member-of:\" attributes refer to the name of the set. If the value of a \"mbrs-by-ref:\" attribute is ANY, any object of the corresponding type  referring to the set is a member of the set. If the \"mbrs-by-ref:\" attribute is missing, the set is defined explicitly by the \"members:\" attribute.`,
            short: 'Enter a mntner-name or ANY',
            syntax: '&lt;mntner-name&gt; | ANY',
        },
        members: {
            description: 'Lists the members of the set.',
            // short: undefined,
            syntax: '',
        }, // no syntax available
        'member-of': {
            description:
                'This attribute can be used in the <strong>route</strong> , <strong>aut-num</strong> and' +
                ' <strong>inet-rtr</strong>' +
                ' classes. The value' +
                ' of the' +
                ' "member-of:" attribute identifies a set object that this object wants to be a member of. This claim,' +
                ' however, should be acknowledged by a respective "mbrs-by-ref:" attribute in the referenced object.',
            short: 'Identifies a set object that this object wants to be a member of.',
            syntax: '',
        }, // no syntax available
        method: {
            description: 'Defines the type of the public key.',
            short: 'Value will be generated by the server.',
            syntax: 'Currently, only PGP keys are supported.',
        },
        mntner: {
            description: 'A unique identifier of the <strong>mntner</strong> object.',
            short: 'A unique identifier of the <strong>mntner</strong> object, e.g. EXAMPLE-MNT',
            syntax: this._shared.objectName.syntax,
        },
        'mnt-by': {
            description: `Specifies the identifier of a registered <strong>mntner</strong> object used for authorisation of operations performed with the object that contains this attribute.`,
            short: 'Specifies one or more <strong>maintainer</strong> objects used for authorisation.',
            syntax: this._shared.objectName.syntax,
        },
        'mnt-domains': {
            description: `Specifies the identifier of a registered <strong>mntner</strong> object used for reverse domain authorisation. Protects <strong>domain</strong> objects. The authentication method of this <strong>maintainer</strong> object will be used for any encompassing <strong>reverse domain</strong> object.`,
            short: 'Specifies the <strong>mntner</strong> object used for reverse domain authorisation.',
            syntax: this._shared.objectName.syntax,
        },
        'mnt-irt': {
            description:
                'May appear in an <strong>inetnum</strong> or <strong>inet6num</strong> object. It points to an irt object representing a Computer Security Incident Response Team (CSIRT) that handles security incidents for the address space specified by the <strong>inetnum</strong> or <strong>inet6num</strong> object.',
            short: 'Specifies the IRT object used for CSIRT security incidents.',
            syntax: this._shared.irt.syntax,
        },
        'mnt-lower': {
            description: `Specifies the identifier of a registered <strong>mntner</strong> object used for hierarchical authorisation. Protects creation of objects directly (one level) below in the hierarchy of an object type. The authentication method of this <strong>mntner</strong> object will then be used upon creation of any object directly below the object that contains the \"mnt-lower:\" attribute.  <a href="/docs/19.Database-Support/03-Database-Security.html#maintainers" target="_blank">Learn more.</a>`,
            short: 'Specifies the <strong>mntner</strong> object used for hierarchical authorisation.',
            syntax: this._shared.objectName.syntax,
        },
        'mnt-nfy': {
            description: 'Specifies the e-mail address to be notified when an object protected by a' + ' <strong>mntner</strong> is' + ' successfully updated.',
            short: 'Notification e-mail address when the object is successfully updated.',
            syntax: this._shared.email.syntax,
        },
        'mnt-ref': {
            description:
                'Specifies the <strong>mntner</strong> objects that are entitled to add references to the <strong>organisation</strong> object from other objects.',
            short: 'Specifies a <strong>mntner</strong> that may add references to the <strong>organisation</strong> object from other objects.',
            syntax: this._shared.objectName.syntax,
        },
        // "mnt-routes": null, // specified object specific table. Check _mntRoutesDoc
        'mp-default': {
            description: 'Specifies default multiprotocol routing policies.',
            // short: undefined,
            syntax: 'to &lt;peering&gt; [action &lt;action&gt;] [networks &lt;filter&gt;]',
        },
        'mp-export': {
            description: 'Specifies a multiprotocol export policy expression.',
            // short: undefined,
            syntax:
                '[protocol &lt;protocol-1&gt;] [into &lt;protocol-1&gt;]' +
                '<br>' +
                'afi &lt;afi-list&gt; to &lt;peering-1&gt; [action &lt;action-1&gt;]' +
                '<br>' +
                '.' +
                '<br>' +
                '.' +
                '<br>' +
                '.' +
                '<br>' +
                ' to &lt;peering-N&gt; [action &lt;action-N&gt;] announce &lt;filter&gt;',
        },
        'export-via': {
            description: 'Specifies an export policy expression targeted at a non-adjacent network.',
            // short: undefined,
            syntax:
                '[protocol &lt;protocol-1&gt;] [into &lt;protocol-2&gt;]' +
                '<br>' +
                'afi &lt;afi-list&gt;' +
                '<br>' +
                '&lt;peering-1&gt;' +
                '<br>' +
                'to &lt;peering-2&gt; [action &lt;action-1&gt;; &lt;action-2&gt;; ... &lt;action-N&gt;;]' +
                '<br>' +
                '.' +
                '<br>' +
                '.' +
                '<br>' +
                '.' +
                '<br>' +
                '&lt;peering-3&gt;' +
                '<br>' +
                'to &lt;peering-M&gt; [action &lt;action-1&gt;; &lt;action-2&gt;; ... &lt;action-N&gt;;]' +
                '<br>' +
                'announce &lt;filter&gt;',
        },
        'mp-filter': {
            description: "Defines the set's multiprotocol policy filter.",
            // short: undefined,
            syntax:
                'Logical expression which when applied to a set of multiprotocol routes returns a subset of these' +
                ' routes. Please refer to RPSLng Internet Draft for more information.',
        },
        'mp-import': {
            description: 'Specifies multiprotocol import policy expression.',
            // short: undefined,
            syntax:
                '[protocol &lt;protocol-1&gt;] [into &lt;protocol-1&gt;]' +
                '<br>' +
                'afi &lt;afi-list&gt;' +
                '<br>' +
                'from &lt;peering-1&gt; [action &lt;action-1&gt;]' +
                '<br>' +
                '.' +
                '<br>' +
                '.' +
                '<br>' +
                '.' +
                '<br>' +
                'from &lt;peering-N&gt; [action &lt;action-N&gt;]' +
                '<br>' +
                'accept (&lt;filter&gt;|&lt;filter&gt; except &lt;importexpression&gt;|' +
                '<br>' +
                '        &lt;filter&gt; refine &lt;importexpression&gt;)' +
                '<br>',
        },
        'import-via': {
            description: 'Specifies an import policy expression targeted at a non-adjacent network.',
            // short: undefined,
            syntax:
                '[protocol &lt;protocol-1&gt;] [into &lt;protocol-2&gt;]' +
                '<br>' +
                'afi &lt;afi-list&gt;' +
                '<br>' +
                '&lt;peering-1&gt;' +
                '<br>' +
                'from &lt;peering-2&gt; [action &lt;action-1&gt;; &lt;action-2&gt;; ... &lt;action-N&gt;;]' +
                '<br>' +
                '    .' +
                '<br>' +
                '    .' +
                '<br>' +
                '    .' +
                '<br>' +
                '&lt;peering-3&gt;' +
                '<br>' +
                'from &lt;peering-M&gt; [action &lt;action-1&gt;; &lt;action-2&gt;; ... &lt;action-N&gt;;]' +
                '<br>' +
                'accept (&lt;filter&gt;|&lt;filter&gt; except &lt;importexpression&gt;|' +
                '<br>' +
                '        &lt;filter&gt; refine &lt;importexpression&gt;)',
        },
        'mp-members': {
            description: 'Lists the multiprotocol members of the set.',
            // short: undefined,
            syntax: '',
        }, // no syntax available
        // "mp-peer": null,  // specified object specific table check _mpPeerDoc
        'mp-peering': {
            description: 'Defines a multiprotocol peering that can be used for importing or exporting routes.',
            // short: undefined,
            syntax: '&lt;as-expression&gt; [&lt;mp-router-expression-1&gt;] [at &lt;mp-router-expression-2&gt;] | &lt;peering-set-name&gt;',
        },
        netname: {
            description: 'The name of the range of IP address space.',
            // short: undefined,
            syntax: `Made up of letters, digits, the underscore \"_\" and minus \"-\" characters; the first character of a name must be a letter, and the last character of a name must be a letter or a digit.`,
        },
        'nic-hdl': {
            description: `Specifies the NIC handle of a <strong>role</strong> or <strong>person</strong> object. When creating an object, one can also specify an \"AUTO\" NIC handle by setting the value of the attribute to \"AUTO-1\" or AUTO-1&lt;Initials&gt;. In such case the database will assign the NIC handle automatically.`,
            short: `Leave value at \"AUTO-1\" to generate a unique NIC handle`,
            syntax: `From 2 to 4 characters optionally followed by up to 6 digits optionally followed by a source specification. The first digit must not be \"0\". Source specification starts with \"-\" followed by source name up to 9-character length.`,
        },
        notify: {
            description:
                'Specifies the e-mail address to which notifications of changes to an object should be sent. This' +
                ' attribute is filtered from the default whois output.',
            short: 'Notification e-mail address where changes to an object should be sent.',
            syntax: this._shared.email.syntax,
        },
        nserver: {
            description: 'Specifies the nameservers of the domain.',
            short: 'Specifies the nameserver of the domain. Include this attribute at least twice.',
            syntax: `Nameserver name as specified in RFC 1034 with or without trailing dot (\".\"). The total length should not exceed 254 characters (octets). The nameserver name may be optionally followed by IPv4 address in decimal dotted quad form (e.g. 192.0.2.1) or IPv6 address in lowercase canonical form (Section 2.2.1, RFC 4291). The nameserver name may be followed by an IP address only when the name is inside of the domain being delegated.`,
        },
        org: {
            description: 'Points to an existing <strong>organisation</strong> object representing the entity that holds the resource.',
            short: 'Reference to an <strong>organisation</strong> object representing the holder of the resource.',
            syntax: this._shared.organisation.syntax,
        },
        'org-name': {
            description: `Specifies the name of the organisation that this <strong>organisation</strong> object represents in the RIPE Database. This is an ASCII-only text attribute.
                The restriction is because this attribute is a look-up key and the whois protocol does not allow specifying character sets in queries.
                The user can put the name of the organisation in non-ASCII character sets in the \"descr:\" attribute if required.`,
            short: 'Specifies the name of the organisation in ASCII-only.',
            syntax: this._shared.organisationName.syntax,
        },
        'org-type': {
            description: 'Specifies the type of the organisation.',
            short: 'Specifies the type of the organisation, e.g. LIR or OTHER.',
            syntax: ``,
        },
        organisation: {
            description: `Specifies the ID of an <strong>organisation</strong> object. When creating an object, one has to specify an \"AUTO\" ID by setting the value of the attribute to \"AUTO-1\" or \"AUTO-1\"&lt;letterCombination&gt;, so the database will assign the ID automatically.`,
            short: `Leave value at \"AUTO-1\" to generate a unique org-id.`,
            syntax: this._shared.organisation.syntax,
        },
        origin: {
            description: `Specifies the AS that originates the route. The corresponding <strong>aut-num</strong> object should be registered in the database.`,
            short: 'Specifies the AS that originates the route.',
            syntax: this._shared.asNumber.syntax,
        },
        owner: {
            description: 'Specifies the owner of the public key.',
            short: 'Value will be generated by the server.',
            syntax: this._shared.generated.syntax,
        },
        peer: {
            description: 'Details of any (interior or exterior) router peerings.',
            // short: undefined,
            syntax:
                `&lt;protocol&gt; &lt;ipv4-address&gt; &lt;options&gt;` +
                `</br>` +
                `| &lt;protocol&gt; &lt;inet-rtr-name&gt; &lt;options&gt;` +
                `</br>` +
                `| &lt;protocol&gt; &lt;rtr-set-name&gt; &lt;options&gt;` +
                `</br>` +
                `| &lt;protocol&gt; &lt;peering-set-name&gt; &lt;options&gt;`,
        },
        peering: {
            description: 'Defines a peering that can be used for importing or exporting routes.',
            // short: undefined,
            syntax: '&lt;peering&gt;',
        },
        'peering-set': {
            description: 'Specifies the name of the peering-set.',
            // short: undefined,
            syntax:
                'A <strong>peering-set</strong> name is made up of letters, digits, the underscore "_" and minus "-"' +
                ' characters; it must start with "prng-", and the last character of a name must be a letter or a' +
                ' digit.' +
                '<br>' +
                'A <strong>peering-set</strong> name can also be hierarchical.  A hierarchical set name is a' +
                ' sequence of set names' +
                ' and AS numbers separated by colons ":".  At least one component of such a name must be an actual set' +
                ' name (i.e. start with "prng-").  All the set name components of a hierarchical' +
                ' <strong>peering-set</strong> name' +
                ' have to be <strong>peering-set</strong> names. The total length should not exceed 80 characters' +
                ' (octets).',
        },
        person: {
            description: 'Specifies the full name of an administrative, technical or zone contact person for other objects in the database.',
            short: 'Specifies the full name of a contact, e.g. John Smith.',
            syntax: '',
        },
        phone: {
            description: 'Specifies a telephone number of the contact.',
            short: 'Phone number with country code, e.g. +44 161 715 1234.',
            syntax: this._shared.phone.syntax,
        },
        'ping-hdl': {
            description:
                'References a <strong>person</strong> or <strong>role</strong> capable of responding to queries' +
                ' concerning the IP' +
                ' address(es)' +
                ' specified in the "pingable:" attribute.',
            short: `References a <strong>person</strong> or <strong>role</strong> related to the \"pingable:\" attribute.`,
            syntax: this._shared.nicHandle.syntax,
        },
        pingable: {
            description:
                'Allows a network operator to advertise an IP address of a node that should be reachable from outside networks. This node can be used as a destination address for diagnostic tests. The IP address must be within the address range of the prefix containing this attribute.',
            short: 'Specifies an IP address that should be reachable from outside networks.',
            syntax: 'A single IPv4 address in decimal dotted quad form (e.g. 192.0.2.1) in case of a <strong>route</strong> object, or an IPv6 address in lowercase canonical form (e.g. 2001:db8::8:800:200c:417a) in case of a <strong>route6</strong> object.',
        },
        poem: {
            description: 'Specifies the title of the poem.',
            // short: undefined,
            syntax: `POEM-&lt;string&gt;<br>
                &lt;string&gt; can include alphanumeric characters, and \"_\" and "-" characters.`,
        },
        'poetic-form': {
            description: 'Specifies the poem type.',
            // short: undefined,
            syntax: this._shared.poeticForm.syntax,
        },
        prefix: {
            description: 'Specifies an IPv4 or IPv6 prefix for which Reverse DNS is requested. One or multiple reverse domains will be created automatically.',
            short: 'Specifies an IPv4 or IPv6 prefix for which Reverse DNS is requested.',
            syntax: 'Specify a prefix in Classless Inter-Domain Routing (CIDR) notation (e.g. 192.168.2.0/24 or 2001:db8::/32) or in range (e.g. 192.168.2.0 - 192.168.2.255)',
        },
        'ref-nfy': {
            description:
                'Specifies the e-mail address to be notified when a reference to the <strong>organisation</strong> object is added or' +
                ' removed. This attribute is filtered from the default whois output when at least one of the objects' +
                ' returned by the query contains an <strong>abuse-mailbox</strong> attribute.',
            short: 'Notification e-mail address when a reference to the <strong>organisation</strong> object is' + ' added or removed.',
            syntax: this._shared.email.syntax,
        },
        remarks: {
            description: 'Contains remarks.',
            short: 'Any free-form comments about the object.',
            syntax: this._shared.freeForm.syntax,
        },
        role: {
            description: 'Specifies the full name of a role entity, e.g. RIPE DBM.',
            // short: undefined,
            syntax: this._shared.organisationName.syntax,
        },
        route: {
            description:
                'Specifies the prefix of the interAS route. Together with the "origin:" attribute constitutes a primary key of the <strong>route</strong> object',
            short: 'Specifies the prefix of the interAS route.',
            syntax:
                'An address prefix is represented as an IPv4 address followed by the character slash "/" followed by' +
                ' an integer in the range from 0 to 32. The following are valid address prefixes: 192.0.2.5/32,' +
                ' 192.0.2.0/24, 0.0.0.0/0; and the following address prefixes are invalid: 0/0, 192.0.2/24 since 0 or' +
                ' 192.0.2 are not strings containing four integers.',
        },
        route6: {
            description: `Specifies the IPv6 prefix of the interAS route. Together with the \"origin:\" attribute, constitutes a primary key of the <strong>route6</strong> object.`,
            short: 'Specifies the IPv6 prefix of the interAS route.',
            syntax: `&lt;ipv6-address&gt;/&lt;prefix&gt;`,
        },
        'route-set': {
            description: 'Specifies the name of the route set. It is a primary key for the <strong>route-set</strong> object.',
            short: `Specifies the name of the route set, must start with \"rs-\"`,
            syntax:
                `An <strong>route-set</strong> name is made up of letters, digits, the underscore "_" and minus "-" characters. It must start with \"rs-\", and the last character of a name must be a letter or a digit.` +
                `<br>` +
                `A <strong>route-set</strong> name can also be hierarchical. A hierarchical set name is a sequence of set names and AS numbers separated by colons \":\".  At least one component of such a name must be an actual set name (i.e. start with \"rs-\"). All the set name components of a hierarchical <strong>route-name</strong> have to be <strong>route-set</strong> names. The total length should not exceed 80 characters (octets).`,
        },
        'rtr-set': {
            description: 'Defines the name of the rtr-set.',
            short: `Defines the name of the rtr-set.`,
            syntax:
                `A <strong>router-set</strong> name is made up of letters, digits, the underscore \"_\" and minus \"-\" characters. It must start with \"rtrs-\", and the last character of a name must be a letter or a digit.
                A <strong>router-set</strong> name can also be hierarchical. A hierarchical set name is a sequence of set names and AS numbers separated by colons \":\".  At least one component of such a name must` +
                `be an actual set name (i.e. start with \"rtrs-\").  All the set name components of a hierarchical <strong>router-set</strong> name have to be <strong>router-set</strong> names. The total length should not exceed 80 characters (octets).`,
        },
        signature: {
            description: 'References a <strong>key-cert</strong> object representing a CSIRT public key used by the team to sign their correspondence.',
            short: 'References a CSIRT <strong>key-cert</strong> object.',
            syntax: this._shared.keyCert.syntax,
        },
        source: {
            description: 'Specifies the registry where the object is registered. Should be "RIPE" for the RIPE Database.',
            short: `Should be \"RIPE\" for the RIPE Database.`,
            syntax: `Made up of letters, digits, the underscore \"_\" and minus \"-\" characters; The first character of a registry name must be a letter, and the last character of a registry name must be a letter or a digit.`,
        },
        // Status -> search _statusDoc
        'sponsoring-org': {
            description: 'Points to an existing <strong>organisation</strong> object representing the sponsoring organisation responsible for the resource.',
            short: 'Reference to an <strong>organisation</strong> object representing the sponsor.',
            syntax: this._shared.organisation.syntax,
        },
        'tech-c': {
            description: 'References a technical contact.',
            short: 'Nic-handle of a technical contact.',
            syntax: this._shared.nicHandle.syntax,
        },
        text: {
            description: 'Text of the poem. Must be humorous, but not malicious or insulting.',
            short: 'Text of the poem.',
            syntax: this._shared.freeForm.syntax,
        },
        'upd-to': {
            description:
                'Specifies the e-mail address to be notified when an object protected by a' + ' <strong>mntner</strong> is' + ' unsuccessfully updated.',
            short: 'Notification e-mail address when the object is unsuccessfully updated.',
            syntax: this._shared.email.syntax,
        },
        'zone-c': {
            description: 'References a zone contact.',
            short: 'Nic-handle of a zone contact.',
            syntax: this._shared.nicHandle.syntax,
        },
    };

    private _statusDoc = {
        'aut-num': {
            short: 'Value will be generated by the server',
            description: 'Specifies the status of the resource.',
            syntax: 'Status can have one of these values:' + '<br>' + '<ul>' + '<li>ASSIGNED</li>' + '<li>LEGACY</li>' + '<li>OTHER</li>' + '</ul>',
        },
        inet6num: {
            description: 'Specifies the status of the resource.',
            // short: undefined,
            syntax:
                'Status can have one of these values:' +
                '<br>' +
                '<ul>' +
                '<li>ALLOCATED-BY-RIR</li>' +
                '<li>ALLOCATED-BY-LIR</li>' +
                '<li>AGGREGATED-BY-LIR</li>' +
                '<li>ASSIGNED</li>' +
                '<li>ASSIGNED ANYCAST</li>' +
                '<li>ASSIGNED PI</li>' +
                '</ul>',
        },
        inetnum: {
            description: 'Specifies the status of the resource.',
            // short: undefined,
            syntax:
                'Status can have one of these values:' +
                '<br>' +
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
                '</ul>',
        },
    };

    private _mntRoutesDoc = {
        domain: {
            description: '',
            short: '',
            syntax: '',
        },
        inet6num: {
            description:
                `This attribute references a <strong>maintainer</strong> object which is used in determining authorisation for the creation of <strong>route6</strong> objects. This entry is for the mnt-routes attribute of <strong>route6</strong> and <strong>inet6num</strong> classes.` +
                ` After the reference to the maintainer, an optional list of prefix ranges inside of curly braces or the keyword \"ANY\" may follow. The default, when no additional set items are specified, is \"ANY\" or all more specifics. <a href="/docs/19.Database-Support/03-Database-Security.html#maintainers" target="_blank">Learn more.</a>`,
            short: 'References a <strong>mntner</strong> used in determining authorisation for the creation of' + ' <strong>route6</strong> objects.',
            syntax: '&lt;mnt-name&gt; [ { list of &lt;ipv6-address&gt;/&lt;prefix&gt; } | ANY ]',
        },
        inetnum: {
            description:
                `This attribute references a <strong>maintainer</strong> object which is used in determining authorisation for the creation of <strong>route</strong> objects. After the reference to the maintainer, an optional list of` +
                ` prefix ranges inside of curly braces or the keyword \"ANY\" may follow. The default, when no additional set items are specified, is \"ANY\" or all more specifics. Please refer to` +
                ` <a href="/docs/19.Database-Support/03-Database-Security.html#maintainers" target="_blank">Learn more.</a>`,
            short: 'References a <strong>mntner</strong> used in determining authorisation for the creation of' + ' <strong>route</strong> objects.',
            syntax: '&lt;mnt-name&gt; [ { list of &lt;address-prefix-range&gt; } | ANY ]',
        },
        route: {
            description:
                `This attribute references a <strong>maintainer</strong> object which is used in determining authorisation for the creation of <strong>route</strong> objects. After the reference to the maintainer, an optional list of` +
                ` prefix ranges inside of curly braces or the keyword "ANY" may follow. The default, when no additional set items are specified, is "ANY" or all more specifics. Please refer to` +
                ` <a href="/docs/19.Database-Support/03-Database-Security.html#maintainers" target="_blank">Learn more.</a>`,
            short: 'References a <strong>mntner</strong> used in determining authorisation for the creation of' + ' <strong>route</strong> objects.',
            syntax: '&lt;mnt-name&gt; [ { list of &lt;address-prefix-range&gt; } | ANY ]',
        },
        route6: {
            description:
                `This attribute references a <strong>maintainer</strong> object which is used in determining authorisation for the creation of <strong>route6</strong> objects. This entry is for the mnt-routes attribute of <strong>route6</strong> and <strong>inet6num</strong> classes.` +
                ` After the reference to the maintainer, an optional list of prefix ranges inside of curly braces or the keyword \"ANY\" may follow. The default, when no additional set items are` +
                ` specified, is \"ANY\" or all more specifics. Please refer to <a href="/docs/19.Database-Support/03-Database-Security.html#maintainers" target="_blank">Learn more.</a>`,
            short: 'References a <strong>mntner</strong> used in determining authorisation for the creation of <strong>route6</strong> objects.',
            syntax: '&lt;mnt-name&gt; [ { list of &lt;ipv6-address&gt;/&lt;prefix&gt; } | ANY ]',
        },
    };

    private _mpPeerDoc = {
        'inet-rtr': {
            description: 'Details of any (interior or exterior) multiprotocol router peerings.',
            // short: undefined,
            syntax: this._shared.inet.syntax,
        },
        'peering-set': {
            description: 'Defines a multiprotocol peering used for importing or exporting routes.',
            // short: undefined,
            syntax: 'afi &lt;afi&gt; &lt;peering&gt;',
        },
    };
}
