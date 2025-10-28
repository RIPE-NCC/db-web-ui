import { Location } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { AttributeMetadataService } from '../../../src/app/attribute/attribute-metadata.service';
import { JsUtilService } from '../../../src/app/core/js-utils.service';
import { PrefixService } from '../../../src/app/domainobject/prefix.service';
import { PropertiesService } from '../../../src/app/properties.service';
import { WhoisMetaService } from '../../../src/app/shared/whois-meta.service';
import { WhoisResourcesService } from '../../../src/app/shared/whois-resources.service';
import { IAttributeModel } from '../../../src/app/shared/whois-response-type.model';

describe('AttributeMetadataService', () => {
    let MockPropertiesService = {
        isNccMntner: (mntnerKey: string) => {
            return _.includes(['RIPE-NCC-HM-MNT', 'RIPE-NCC-END-MNT', 'RIPE-NCC-LEGACY-MNT'], mntnerKey.toUpperCase());
        },
        isNccHmMntner: (mntnerKey: string) => {
            return _.includes(['RIPE-NCC-HM-MNT'], mntnerKey.toUpperCase());
        },
    };
    let MockWhoisResourcesService = {
        isNccMntner: (mntnerKey: string) => {
            return _.includes(['RIPE-NCC-HM-MNT', 'RIPE-NCC-END-MNT', 'RIPE-NCC-LEGACY-MNT'], mntnerKey.toUpperCase());
        },
        isNccHmMntner: (mntnerKey: string) => {
            return _.includes(['RIPE-NCC-HM-MNT'], mntnerKey.toUpperCase());
        },
        isComaintained: (attributes: IAttributeModel[]) => {
            return _.some(attributes, (attr) => {
                if (attr.name.toUpperCase() === 'MNT-BY') {
                    return MockPropertiesService.isNccMntner(attr.value);
                } else {
                    return false;
                }
            });
        },
        isComaintainedWithNccHmMntner: (attributes: IAttributeModel[]) => {
            return _.some(attributes, (attr) => {
                if (attr.name.toUpperCase() === 'MNT-BY') {
                    return MockPropertiesService.isNccHmMntner(attr.value);
                } else {
                    return false;
                }
            });
        },
    };
    let attributeMetadataService: AttributeMetadataService;
    let httpMock: HttpTestingController;
    const VALID_PREFIX = '22.22.0.0/22';
    const objectType = 'prefix';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                AttributeMetadataService,
                JsUtilService,
                PrefixService,
                WhoisMetaService,
                { provide: WhoisResourcesService, useValue: MockWhoisResourcesService },
                { provide: Location, useValue: {} },
                { provide: PropertiesService, useValue: MockPropertiesService },
                { provide: 'ModalService', useValue: {} },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        attributeMetadataService = TestBed.inject(AttributeMetadataService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(attributeMetadataService).toBeTruthy();
    });

    it('should not crash', () => {
        const attributes = attributeMetadataService.determineAttributesForNewObject(objectType);
        expect(!!attributes).toBeTruthy();
        expect(attributes.length).toBe(9);
    });

    it('should create metadata for NOT co-maintained inetnum object with netname NOT read only', () => {
        const attributes = [{ name: 'mnt-by', value: 'SOME-MNT' }];
        const type = 'inetnum';
        const metaData = attributeMetadataService.getAllMetadata(type);
        const isReadOnly = metaData.netname.readOnly(type, attributes);
        expect(isReadOnly).toBeFalse();
    });

    it('should create metadata for co-maintained inetnum object with netname read only', () => {
        const attributes = [{ name: 'mnt-by', value: 'RIPE-NCC-HM-MNT' }];
        const type = 'inetnum';
        const metaData = attributeMetadataService.getAllMetadata(type);
        const isReadOnly = metaData.netname.readOnly(type, attributes);
        expect(isReadOnly).toBeTruthy();
    });

    it('should create metadata for NOT co-maintained inet6num object with netname NOT read only', () => {
        const attributes = [{ name: 'mnt-by', value: 'SOME-MNT' }];
        const type = 'inet6num';
        const metaData = attributeMetadataService.getAllMetadata(type);
        const isReadOnly = metaData.netname.readOnly(type, attributes);
        expect(isReadOnly).toBeFalse();
    });

    it('should create metadata for co-maintained inet6num object with netname read only', () => {
        const attributes = [{ name: 'mnt-by', value: 'RIPE-NCC-HM-MNT' }];
        const type = 'inet6num';
        const metaData = attributeMetadataService.getAllMetadata(type);
        const isReadOnly = metaData.netname.readOnly(type, attributes);
        expect(isReadOnly).toBeTruthy();
    });

    it('should create metadata for co-maintained inetnum object with org read only', () => {
        const attributes = [
            { name: 'mnt-by', value: 'RIPE-NCC-HM-MNT' },
            { name: 'org', value: 'ORG-TEST19-RIPE' },
        ];
        const type = 'inetnum';
        const metaData = attributeMetadataService.getAllMetadata(type);
        const isReadOnly = metaData.org.readOnly(type, attributes);
        expect(isReadOnly).toBeTruthy();
    });

    it('should create metadata for NOT co-maintained inetnum object with org NOT read only', () => {
        const attributes = [{ name: 'org', value: 'ORG-TEST19-RIPE' }];
        const type = 'inetnum';
        const metaData = attributeMetadataService.getAllMetadata(type);
        const isReadOnly = metaData.org.readOnly(type, attributes);
        expect(isReadOnly).toBeFalse();
    });

    it('should create metadata for co-maintained inet6num object with org read only', () => {
        const attributes = [
            { name: 'mnt-by', value: 'RIPE-NCC-HM-MNT' },
            { name: 'org', value: 'ORG-TEST19-RIPE' },
        ];
        const type = 'inet6num';
        const metaData = attributeMetadataService.getAllMetadata(type);
        const isReadOnly = metaData.org.readOnly(type, attributes);
        expect(isReadOnly).toBeTruthy();
    });

    it('should create metadata for NOT co-maintained inet6num object with org NOT read only', () => {
        const attributes = [{ name: 'org', value: 'ORG-TEST19-RIPE' }];
        const type = 'inet6num';
        const metaData = attributeMetadataService.getAllMetadata(type);
        const isReadOnly = metaData.org.readOnly(type, attributes);
        expect(isReadOnly).toBeFalse();
    });

    it('should be able to calculate validity of an attribute', () => {
        let isInvalid;
        const attributes = attributeMetadataService.determineAttributesForNewObject(objectType);
        const attributePk = attributes[0];
        const attribute = attributes[4];

        expect(attributePk.name).toBe('prefix');
        expect(attribute.name).toBe('admin-c');

        attributePk.value = '';
        isInvalid = attributeMetadataService.isInvalid(objectType, attributes, attributePk);
        expect(isInvalid).toBeTruthy();

        // attributePk.value = VALID_PREFIX;
        // isInvalid = attributeMetadataService.isInvalid(objectType, attributes, attributePk);
        // expect(isInvalid).toBeFalse();

        // attribute.value = "";
        // isInvalid = attributeMetadataService.isInvalid(objectType, attributes, attribute);
        // expect(isInvalid).toBeFalse();

        attribute.value = 'could be anything';
        isInvalid = attributeMetadataService.isInvalid(objectType, attributes, attribute);
        expect(isInvalid).toBeFalse();
    });

    xit('should be able to calculate hidden state of an attribute with no dependencies', () => {
        const attributes = attributeMetadataService.determineAttributesForNewObject(objectType);
        const attribute = attributes[0];

        expect(attribute.name).toBe('prefix');
        const isHidden = attributeMetadataService.isHidden(objectType, attributes, attribute);
        expect(isHidden).toBeFalse();
    });

    xit('should be able to calculate hidden state of an attribute with dependencies', () => {
        let isHidden;
        const attributes = attributeMetadataService.determineAttributesForNewObject(objectType);
        let attrPrefix = attributes[0],
            attrNs1 = attributes[1],
            attrNs2 = attributes[2],
            attrToTest = attributes[4];

        expect(attrPrefix.name).toBe('prefix');
        expect(attrNs1.name).toBe('nserver');
        expect(attrNs2.name).toBe('nserver');
        expect(attrToTest.name).toBe('admin-c');

        attrPrefix.value = '';
        attrNs1.value = 'ns1.nowhere.com'; // a valid host name
        attrNs2.value = 'ns2.nowhere.com'; // a valid host name
        isHidden = attributeMetadataService.isHidden(objectType, attributes, attrToTest);
        expect(isHidden).toBeTruthy();

        attrPrefix.value = VALID_PREFIX;
        isHidden = attributeMetadataService.isHidden(objectType, attributes, attrToTest);
        expect(isHidden).toBeFalse();
    });
});
