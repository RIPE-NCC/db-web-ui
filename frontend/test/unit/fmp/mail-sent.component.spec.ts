import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MailSentComponent } from '../../../src/app/fmp/mail-sent.component';
import { PropertiesService } from '../../../src/app/properties.service';

describe('MailSentComponent', () => {
    let component: MailSentComponent;
    let fixture: ComponentFixture<MailSentComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MailSentComponent],
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
