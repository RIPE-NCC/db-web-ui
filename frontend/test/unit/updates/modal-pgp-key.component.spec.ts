import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ModalPGPKeyComponent } from 'src/app/updatesweb/modal-pgp-key.component';
import { CoreModule } from '../../../src/app/core/core.module';

describe('ModalPGPKeyComponent', () => {
    let component: ModalPGPKeyComponent;
    let fixture: ComponentFixture<ModalPGPKeyComponent>;
    let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

    beforeEach(async () => {
        mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

        await TestBed.configureTestingModule({
            imports: [FormsModule, MatButtonModule, CoreModule],
            declarations: [],
            providers: [{ provide: NgbActiveModal, useValue: mockActiveModal }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalPGPKeyComponent);
        component = fixture.componentInstance;

        component.pgpCtrl = {
            valueChanges: of('test'),
            control: { setValue: jasmine.createSpy('setValue') },
        } as unknown as NgModel;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set validPgp to true on valueChanges', async () => {
        component.validPgp = false;
        component.ngAfterViewInit();
        component.pgpCtrl.valueChanges?.subscribe();
        await fixture.whenStable();
        expect(component.validPgp).toBeTrue();
    });

    describe('verifyPGP', () => {
        it('should return true for valid PGP key', () => {
            component.pgpKey = `${component['PGP_HEADER']}abc${component['PGP_FOOTER']}`;
            expect(component['verifyPGP'](component.pgpKey.trim())).toBeTrue();
        });

        it('should return false for invalid PGP key', () => {
            component.pgpKey = 'invalid key - without header and footer';
            expect(component['verifyPGP'](component.pgpKey.trim())).toBeFalse();
        });
    });

    describe('submit()', () => {
        it('should close modal if PGP is valid', () => {
            component.pgpKey = `${component['PGP_HEADER']}abc${component['PGP_FOOTER']}`;
            component.submit();
            expect(mockActiveModal.close).toHaveBeenCalledWith(component.pgpKey);
            expect(component.validPgp).toBeTrue();
        });

        it('should set validPgp to false if PGP is invalid', () => {
            component.pgpKey = 'invalid key - without header and footer';
            component.submit();
            expect(mockActiveModal.close).not.toHaveBeenCalled();
            expect(component.validPgp).toBeFalse();
        });

        it('should close modal if X509 is valid', () => {
            component.pgpKey = `${component['X509_HEADER']}abc${component['X509_FOOTER']}`;
            component.submit();
            expect(mockActiveModal.close).toHaveBeenCalledWith(component.pgpKey);
            expect(component.validPgp).toBeTrue();
        });

        it('should set validPgp to false if X509 is invalid', () => {
            component.pgpKey = 'invalid key - without header and footer';
            component.submit();
            expect(mockActiveModal.close).not.toHaveBeenCalled();
            expect(component.validPgp).toBeFalse();
        });
    });

    describe('cancel()', () => {
        it('should dismiss modal', () => {
            component.cancel();
            expect(mockActiveModal.dismiss).toHaveBeenCalled();
        });
    });
});
