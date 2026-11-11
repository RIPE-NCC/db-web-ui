import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ModalPGPKeyComponent } from 'src/app/updatesweb/modal-pgp-key.component';
import type { MockedObject } from 'vitest';

describe('ModalPGPKeyComponent', () => {
    let component: ModalPGPKeyComponent;
    let fixture: ComponentFixture<ModalPGPKeyComponent>;
    let mockActiveModal: MockedObject<NgbActiveModal>;

    beforeEach(async () => {
        mockActiveModal = {
            close: vi.fn().mockName('NgbActiveModal.close'),
            dismiss: vi.fn().mockName('NgbActiveModal.dismiss'),
        } as any;

        await TestBed.configureTestingModule({
            imports: [FormsModule, MatButtonModule, FormsModule],
            providers: [{ provide: NgbActiveModal, useValue: mockActiveModal }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalPGPKeyComponent);
        component = fixture.componentInstance;

        component.pgpCtrl = {
            valueChanges: of('test'),
            control: { setValue: vi.fn().mockName('setValue') },
        } as unknown as NgModel;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set validPgp to true on valueChanges', async () => {
        component.validPgp = false;
        component.ngAfterViewInit();
        component.pgpCtrl.control.setValue('test');
        await fixture.whenStable();
        expect(component.validPgp).toBe(true);
    });

    describe('verifyPGP', () => {
        it('should return true for valid PGP key', () => {
            component.pgpKey = `${component['PGP_HEADER']}abc${component['PGP_FOOTER']}`;
            expect(component['verifyPGP'](component.pgpKey.trim())).toBe(true);
        });

        it('should return false for invalid PGP key', () => {
            component.pgpKey = 'invalid key - without header and footer';
            expect(component['verifyPGP'](component.pgpKey.trim())).toBe(false);
        });
    });

    describe('submit()', () => {
        it('should close modal if PGP is valid', () => {
            component.pgpKey = `${component['PGP_HEADER']}abc${component['PGP_FOOTER']}`;
            component.submit();
            expect(mockActiveModal.close).toHaveBeenCalledWith(component.pgpKey);
            expect(component.validPgp).toBe(true);
        });

        it('should set validPgp to false if PGP is invalid', () => {
            component.pgpKey = 'invalid key - without header and footer';
            component.submit();
            expect(mockActiveModal.close).not.toHaveBeenCalled();
            expect(component.validPgp).toBe(false);
        });

        it('should close modal if X509 is valid', () => {
            component.pgpKey = `${component['X509_HEADER']}abc${component['X509_FOOTER']}`;
            component.submit();
            expect(mockActiveModal.close).toHaveBeenCalledWith(component.pgpKey);
            expect(component.validPgp).toBe(true);
        });

        it('should set validPgp to false if X509 is invalid', () => {
            component.pgpKey = 'invalid key - without header and footer';
            component.submit();
            expect(mockActiveModal.close).not.toHaveBeenCalled();
            expect(component.validPgp).toBe(false);
        });
    });

    describe('cancel()', () => {
        it('should dismiss modal', () => {
            component.cancel();
            expect(mockActiveModal.dismiss).toHaveBeenCalled();
        });
    });
});
