import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObjectTypesEnum } from '../../../src/app/query/object-types.enum';
import { NameFormatterComponent } from '../../../src/app/shared/name-formatter.component';
import { SharedModule } from '../../../src/app/shared/shared.module';

describe('NameFormatterComponent', () => {
    let component: NameFormatterComponent;

    let fixture: ComponentFixture<NameFormatterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule],
        });
        fixture = TestBed.createComponent(NameFormatterComponent);
        component = fixture.componentInstance;
    });

    it('should format if type is INETNUM', () => {
        component.type = ObjectTypesEnum.INETNUM;
        component.name = '1.1.1.0-1.1.1.255';
        fixture.detectChanges();
        expect(component.formatted).toBe('1.1.1.0/24');
    });

    it('should set the name as formatted if type is not INETNUM', () => {
        component.type = ObjectTypesEnum.INET6NUM;
        component.name = 'not an inetnum';
        fixture.detectChanges();
        expect(component.formatted).toBe(component.name);
    });
});
