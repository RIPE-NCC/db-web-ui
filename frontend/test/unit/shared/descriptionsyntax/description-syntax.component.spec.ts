import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DescriptionSyntaxComponent } from '../../../../src/app/shared/descriptionsyntax/description-syntax.component';

describe('DescriptionSyntaxComponent', () => {
    let component: DescriptionSyntaxComponent;
    let fixture: ComponentFixture<DescriptionSyntaxComponent>;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(DescriptionSyntaxComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        component.showComponent = true;
        component.objectType = 'inetnum';
        component.attrName = 'mnt-by';
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
