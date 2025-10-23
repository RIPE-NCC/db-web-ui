import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../src/app/shared/shared.module';
import { ModalAddAttributeComponent } from '../../../../src/app/updatesweb/modal-add-attribute.component';

describe('ModalAddAttributeComponent', () => {
    let componentFixture: ComponentFixture<ModalAddAttributeComponent>;
    let modalAddAttributeComponent: ModalAddAttributeComponent;
    let modalMock: any;
    beforeEach(() => {
        modalMock = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
        TestBed.configureTestingModule({
            imports: [FormsModule, SharedModule, ModalAddAttributeComponent],
            providers: [{ provide: NgbActiveModal, useValue: modalMock }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        componentFixture = TestBed.createComponent(ModalAddAttributeComponent);
        modalAddAttributeComponent = componentFixture.componentInstance;
    });

    it('should close the modal and return selected item when ok', async () => {
        modalAddAttributeComponent.items = [{ name: 'a' }, { name: 'b' }];
        componentFixture.detectChanges();
        modalAddAttributeComponent.selected = { name: 'b' };
        modalAddAttributeComponent.ok();

        expect(modalMock.close).toHaveBeenCalledWith({ name: 'b' });
    });

    it('should close the modal and return error when canceled', async () => {
        modalAddAttributeComponent.items = [{ name: 'a' }, { name: 'b' }];

        componentFixture.detectChanges();
        modalAddAttributeComponent.selected = 'b';
        modalAddAttributeComponent.cancel();

        expect(modalMock.dismiss).toHaveBeenCalled();
    });
});
