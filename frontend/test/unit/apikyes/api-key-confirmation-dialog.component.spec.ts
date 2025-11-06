import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ApiKeyConfirmationDialogComponent } from 'src/app/apikeys/api-key-confirmation-dialog/api-key-confirmation-dialog.component';

describe('ApiKeyConfirmationDialogComponent', () => {
    let component: ApiKeyConfirmationDialogComponent;
    let fixture: ComponentFixture<ApiKeyConfirmationDialogComponent>;

    beforeEach(waitForAsync(() => {
        void TestBed.configureTestingModule({
            imports: [MatDialogModule, ApiKeyConfirmationDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: { data: {} } }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ApiKeyConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should get Basic Authorization Header', () => {
        expect(component.getBasicAuthorizationHeader('username', 'password')).toEqual('Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });
});
