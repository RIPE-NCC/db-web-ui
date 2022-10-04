import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { PropertiesService } from '../../../src/app/properties.service';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { IAttributeModel } from '../../../src/app/shared/whois-response-type.model';
import { LinkService } from '../../../src/app/updatesweb/link.service';
import { MessageStoreService } from '../../../src/app/updatesweb/message-store.service';
import { MntnerService } from '../../../src/app/updatesweb/mntner.service';
import { ScreenLogicInterceptorService } from '../../../src/app/updatesweb/screen-logic-interceptor.service';
import { UpdatesWebModule } from '../../../src/app/updatesweb/updateweb.module';

describe('ScreenLogicInterceptorService Person/Role', () => {
    let interceptor: ScreenLogicInterceptorService;
    let whoisResourcesService: WhoisResourcesService;
    let whoisMetaService: WhoisMetaService;

    let MockMntnerService = {
        isNccMntner: (mntnerKey: string) => {
            return _.includes(['RIPE-NCC-HM-MNT', 'RIPE-NCC-END-MNT', 'RIPE-NCC-LEGACY-MNT'], mntnerKey.toUpperCase());
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesWebModule],
            providers: [
                ScreenLogicInterceptorService,
                MessageStoreService,
                LinkService,
                WhoisMetaService,
                WhoisResourcesService,
                PropertiesService,
                {
                    provide: 'OrganisationHelperService',
                    useValue: { containsAbuseC: (attributes: any) => attributes, addAbuseC: (attributes: any) => attributes },
                },
                { provide: MntnerService, useValue: MockMntnerService },
                { provide: Router, useValue: { navigate: () => {}, events: of() } },
            ],
        });
        interceptor = TestBed.inject(ScreenLogicInterceptorService);
        whoisResourcesService = TestBed.inject(WhoisResourcesService);
        whoisMetaService = TestBed.inject(WhoisMetaService);
    });

    it('should set default nic-ndl before-edit person on Create operation', () => {
        const before = whoisResourcesService.validateAttributes(whoisMetaService.getMandatoryAttributesOnObjectType('person'));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit('Create', 'RIPE', 'person', before, errors, warnings, infos);

        const nicHdle = WhoisResourcesService.getAllAttributesOnName(after, 'nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('AUTO-1');
    });

    it('should NOT set default nic-ndl before-edit person on Modify operation', () => {
        let personSubject = _wrap('person', personAttributes);
        whoisResourcesService.setSingleAttributeOnName(personSubject, 'nic-hdl', 'SOME_NIC');

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit('Modify', 'RIPE', 'person', personSubject, errors, warnings, infos);

        const nicHdle = WhoisResourcesService.getAllAttributesOnName(after, 'nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('SOME_NIC');
    });

    it('should set default nic-ndl before-edit role on Create operation', () => {
        const before = whoisResourcesService.validateAttributes(whoisMetaService.getMandatoryAttributesOnObjectType('role'));

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit('Create', 'RIPE', 'role', before, errors, warnings, infos);

        const nicHdle = WhoisResourcesService.getAllAttributesOnName(after, 'nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('AUTO-1');
    });

    it('should NOT set default nic-ndl before-edit role on Modify operation', () => {
        const roleSubject = _wrap('person', roleAttributes);
        whoisResourcesService.setSingleAttributeOnName(roleSubject, 'nic-hdl', 'SOME_NIC');

        let errors: string[] = [];
        let warnings: string[] = [];
        let infos: string[] = [];
        const after = interceptor.beforeEdit('Modify', 'RIPE', 'person', roleSubject, errors, warnings, infos);

        const nicHdle = WhoisResourcesService.getAllAttributesOnName(after, 'nic-hdl');
        expect(nicHdle.length).toEqual(1);
        expect(nicHdle[0].name).toEqual('nic-hdl');
        expect(nicHdle[0].value).toEqual('SOME_NIC');
    });

    const _wrap = (type: string, attrs: IAttributeModel[]) => {
        return whoisResourcesService.wrapAndEnrichAttributes(type, attrs);
    };

    const personAttributes = [
        {
            name: 'person',
            value: 'Name Removed',
        },
        {
            name: 'address',
            value: 'The Netherlands',
        },
        {
            name: 'phone',
            value: '+31 20 ... ....',
        },
        {
            name: 'e-mail',
            value: '****@ripe.net',
        },
        {
            name: 'mnt-by',
            value: 'aardvark-mnt',
        },
        {
            name: 'nic-hdl',
            value: 'DW-RIPE',
        },
        {
            name: 'source',
            value: 'RIPE',
        },
    ];

    const roleAttributes = [
        {
            name: 'role',
            value: 'Name Removed',
        },
        {
            name: 'address',
            value: 'The Netherlands',
        },
        {
            name: 'phone',
            value: '+31 20 ... ....',
        },
        {
            name: 'e-mail',
            value: '****@ripe.net',
        },
        {
            name: 'mnt-by',
            value: 'aardvark-mnt',
        },
        {
            name: 'nic-hdl',
            value: 'DW-RIPE',
        },
        {
            name: 'source',
            value: 'RIPE',
        },
    ];
});
