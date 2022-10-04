import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '../../../src/app/core/core.module';
import { MailSentComponent } from '../../../src/app/fmp/mail-sent.component';
import { PropertiesService } from '../../../src/app/properties.service';
import { SharedModule } from '../../../src/app/shared/shared.module';

describe('MailSentComponent', () => {
    let component: MailSentComponent;
    let fixture: ComponentFixture<MailSentComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, CoreModule],
            declarations: [MailSentComponent],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (email: string) => 'test@work.net' } } } }, PropertiesService],
        });
        fixture = TestBed.createComponent(MailSentComponent);
        component = fixture.componentInstance;
    });

    it('should extract email from url params', () => {
        fixture.detectChanges();
        expect(component.email).toBe('test@work.net');
    });
});
