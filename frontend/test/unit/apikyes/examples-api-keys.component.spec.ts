import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DOCUMENT_TYPE, ExamplesApiKeysComponent } from 'src/app/apikeys/examples-api-keys/examples-api-keys.component';
import { KeyType } from 'src/app/apikeys/utils';
import { PropertiesService } from '../../../src/app/properties.service';

describe('ExamplesApiKeysComponent', () => {
    let component: ExamplesApiKeysComponent;
    let fixture: ComponentFixture<ExamplesApiKeysComponent>;

    const mockDialog = {
        open: jasmine.createSpy('open'),
    };

    const mockOrg = {
        orgObjectId: 'ORG-123',
    } as any;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ExamplesApiKeysComponent, NoopAnimationsModule],
            providers: [
                { provide: MatDialog, useValue: mockDialog },
                { provide: PropertiesService, useValue: { REST_API_RIPE_URL: 'https://rest-prepdev.db.ripe.net/' } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ExamplesApiKeysComponent);
        component = fixture.componentInstance;
        component.selectedOrg = mockOrg;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call showExamples on ngOnChanges', () => {
        spyOn(component, 'showExamples');

        component.ngOnChanges();

        expect(component.showExamples).toHaveBeenCalled();
    });

    it('should return all formats for MAINTAINER', () => {
        component.selectedKeyType = KeyType.MAINTAINER;

        const result = component.getDocFormatNames();

        expect(result).toEqual(Object.values(DOCUMENT_TYPE).map((d) => d.name));
    });

    it('should return IP analyser formats', () => {
        component.selectedKeyType = KeyType.IP_ANALYSER;

        const result = component.getDocFormatNames();

        expect(result).toEqual(component.ipAnalyzerDocFormats.map((d) => d.name));
    });

    it('should return MY_RESOURCES formats', () => {
        component.selectedKeyType = KeyType.MY_RESOURCES;

        const result = component.getDocFormatNames();

        expect(result).toEqual(component.myResourcesDocFormats.map((d) => d.name));
    });

    it('should set default doc type if current is invalid', () => {
        component.selectedKeyType = KeyType.IP_ANALYSER;
        component.selectedDocType = 'INVALID';

        component.showExamples();

        expect(component.docFormatOptions).toContain(component.selectedDocType);
    });

    it('should set docTypeForView correctly', () => {
        component.selectedKeyType = KeyType.MAINTAINER;
        component.selectedDocType = 'JSON';

        component.showExamples();

        expect(component.docTypeForView).toBe('application/json');
    });

    it('should generate MAINTAINER curl commands', () => {
        component.selectedKeyType = KeyType.MAINTAINER;
        component.selectedDocType = 'JSON';

        component.showExamples();

        expect(component.readAnObject).toContain('Accept: application/json');
        expect(component.createAnObject).toContain('Content-type: application/json');
        expect(component.updateAnObject).toContain('PUT');
        expect(component.deleteAnObject).toContain('DELETE');
    });

    it('should generate IP analyser URLs with org id', () => {
        component.selectedKeyType = KeyType.IP_ANALYSER;
        component.selectedDocType = 'JSON';

        component.showExamples();

        expect(component.ipv4Analyser).toContain('ORG-123');
        expect(component.ipv6Analyser).toContain('ORG-123');
        expect(component.ipv4Analyser).toContain('application/json');
    });

    it('should generate MY_RESOURCES URLs', () => {
        component.selectedKeyType = KeyType.MY_RESOURCES;
        component.selectedDocType = 'JSON';

        component.showExamples();

        expect(component.allResourcesMyResources).toContain('ORG-123');
        expect(component.asnsMyResources).toContain('asns');
        expect(component.ipv4MyResources).toContain('ipv4');
        expect(component.ipv6MyResources).toContain('ipv6');
    });

    it('should fallback to first format if selectedDocType is not allowed', () => {
        component.selectedKeyType = KeyType.MY_RESOURCES;
        component.selectedDocType = 'PLAIN TEXT'; // not an option for My Resources

        component.showExamples();

        expect(component.selectedDocType).toBe(component.docFormatOptions[0]);
    });
});
