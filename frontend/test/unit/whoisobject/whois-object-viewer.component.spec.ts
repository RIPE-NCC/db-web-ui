import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { AttributeModule } from '../../../src/app/attribute/attribute.module';
import { CoreModule } from '../../../src/app/core/core.module';
import { PropertiesService } from '../../../src/app/properties.service';
import { SharedModule } from '../../../src/app/shared/shared.module';
import { UserInfoService } from '../../../src/app/userinfo/user-info.service';
import { WhoisObjectViewerComponent } from '../../../src/app/whois-object/whois-object-viewer.component';

describe('WhoisObjectViewerComponent', () => {
    let component: WhoisObjectViewerComponent;
    let fixture: ComponentFixture<WhoisObjectViewerComponent>;

    describe('with logged in user', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [SharedModule, CoreModule, NgSelectModule, AttributeModule, RouterTestingModule],
                declarations: [WhoisObjectViewerComponent],
                providers: [{ provide: UserInfoService, useValue: { isLogedIn: () => true, userLoggedIn$: of() } }, CookieService, PropertiesService],
            });

            fixture = TestBed.createComponent(WhoisObjectViewerComponent);
            component = fixture.componentInstance;
        });

        it('should create', () => {
            component.model = ripeWhoisObject;
            expect(component).toBeTruthy();
        });

        it('should show button Update object for RIPE whois object', () => {
            component.model = ripeWhoisObject;
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeTruthy();
        });

        it('should not show button Update object for GRS whois object', () => {
            component.model = grsWhoisObject;
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeFalsy();
        });
    });

    describe('without logged in user', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [SharedModule, CoreModule, NgSelectModule, AttributeModule, RouterTestingModule],
                declarations: [WhoisObjectViewerComponent],
                providers: [{ provide: UserInfoService, useValue: { isLogedIn: () => false, userLoggedIn$: of() } }, CookieService, PropertiesService],
            });

            fixture = TestBed.createComponent(WhoisObjectViewerComponent);
            component = fixture.componentInstance;
            component.model = ripeWhoisObject;
        });

        it('should not show button Update object for RIPE whois object', () => {
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeFalsy();
        });

        it('should not show button Update object for GRS whois object', () => {
            component.model = grsWhoisObject;
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeFalsy();
        });

        it('should not show button Update object for RIPE placeholder objects whois object', () => {
            // Placeholder objects => netname = "NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK"
            component.model = placeholderWhoisObject;
            component.ngOnChanges();
            fixture.detectChanges();
            expect(component.show.updateButton).toBeFalsy();
        });

        it('should contain href to modify page when linkable is true', async () => {
            component.model = whoisObject;
            component.linkable = true;
            component.ngOnChanges();
            component.show.updateButton = true;
            component.show.loginLink = false;
            fixture.detectChanges();
            await fixture.whenStable();
            const blueButtons = fixture.debugElement.queryAll(By.css('a[mat-flat-button=""]'));
            expect(blueButtons[0].nativeElement.getAttribute('href')).toBe('/webupdates/modify/ripe/inetnum/62.77.172.236%20-%2062.77.172.239');
        });

        it('should contain href when linkable is absent', async () => {
            component.model = whoisObject;
            component.ngOnChanges();
            component.show.updateButton = true;
            component.show.loginLink = false;
            fixture.detectChanges();
            await fixture.whenStable();
            const blueButtons = fixture.debugElement.queryAll(By.css('a[mat-flat-button=""]'));
            expect(blueButtons[0].nativeElement.getAttribute('href')).toBeNull();
        });
    });

    const ripeWhoisObject = {
        type: 'route',
        link: {
            type: 'locator',
            href: 'http://rest-prepdev.db.ripe.net/ripe/route/185.62.164.0/24AS12041',
        },
        source: {
            id: 'ripe',
        },
        'primary-key': {
            attribute: [
                {
                    name: 'route',
                    value: '185.62.164.0/24',
                },
                {
                    name: 'origin',
                    value: 'AS12041',
                },
            ],
        },
        attributes: {
            attribute: [
                {
                    name: 'route',
                    value: '185.62.164.0/24',
                },
                {
                    name: 'descr',
                    value: 'l.registry.qa',
                },
                {
                    name: 'origin',
                    value: 'AS12041',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/PV51549-MNT',
                    },
                    name: 'mnt-by',
                    value: 'PV51549-MNT',
                    'referenced-type': 'mntner',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'http://rest-prepdev.db.ripe.net/ripe/mntner/MAINT-AFILIAS',
                    },
                    name: 'mnt-by',
                    value: 'MAINT-AFILIAS',
                    'referenced-type': 'mntner',
                },
                {
                    name: 'created',
                    value: '2014-09-11T16:17:43Z',
                },
                {
                    name: 'last-modified',
                    value: '2014-09-11T16:19:36Z',
                },
                {
                    name: 'source',
                    value: 'RIPE',
                },
            ],
        },
        managed: false,
    };

    const grsWhoisObject = {
        type: 'route',
        link: {
            type: 'locator',
            href: 'http://rest-prepdev.db.ripe.net/radb-grs/route/185.62.164.0/22AS12041',
        },
        source: {
            id: 'radb-grs',
        },
        'primary-key': {
            attribute: [
                {
                    name: 'route',
                    value: '185.62.164.0/22',
                },
                {
                    name: 'origin',
                    value: 'AS12041',
                },
            ],
        },
        attributes: {
            attribute: [
                {
                    name: 'route',
                    value: '185.62.164.0/22',
                },
                {
                    name: 'descr',
                    value: 'Servers Australia',
                },
                {
                    name: 'origin',
                    value: 'AS12041',
                },
                {
                    name: 'notify',
                    value: 'net-support@ap.equinix.com',
                },
                {
                    name: 'notify',
                    value: 'ap-noc@ap.equinix.com',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'http://rest-prepdev.db.ripe.net/radb-grs/mntner/MAINT-AS17819',
                    },
                    name: 'mnt-by',
                    value: 'MAINT-AS17819',
                    'referenced-type': 'mntner',
                },
                {
                    name: 'source',
                    value: 'RADB-GRS',
                },
                {
                    name: 'remarks',
                    value: '****************************',
                },
                {
                    name: 'remarks',
                    value: '* THIS OBJECT IS MODIFIED',
                },
                {
                    name: 'remarks',
                    value: '* Please note that all data that is generally regarded as personal',
                },
                {
                    name: 'remarks',
                    value: '* data has been removed from this object.',
                },
                {
                    name: 'remarks',
                    value: '* To view the original object, please query the RADB Database at:',
                },
                {
                    name: 'remarks',
                    value: '* http://www.radb.net/',
                },
                {
                    name: 'remarks',
                    value: '****************************',
                },
            ],
        },
        managed: false,
    };

    const placeholderWhoisObject = {
        type: 'inetnum',
        link: {
            type: 'locator',
            href: 'https://rest-prepdev.db.ripe.net/ripe/inetnum/192.92.157.0 - 192.92.215.255',
        },
        source: {
            id: 'ripe',
        },
        'primary-key': {
            attribute: [
                {
                    name: 'inetnum',
                    value: '192.92.157.0 - 192.92.215.255',
                },
            ],
        },
        attributes: {
            attribute: [
                {
                    name: 'inetnum',
                    value: '192.92.157.0 - 192.92.215.255',
                },
                {
                    name: 'netname',
                    value: 'NON-RIPE-NCC-MANAGED-ADDRESS-BLOCK',
                },
                {
                    name: 'country',
                    value: 'EU',
                    comment: 'Country is really world wide',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/role/IANA1-RIPE',
                    },
                    name: 'admin-c',
                    value: 'IANA1-RIPE',
                    'referenced-type': 'role',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/role/IANA1-RIPE',
                    },
                    name: 'tech-c',
                    value: 'IANA1-RIPE',
                    'referenced-type': 'role',
                },
                {
                    name: 'status',
                    value: 'ALLOCATED UNSPECIFIED',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT',
                    },
                    name: 'mnt-by',
                    value: 'RIPE-NCC-HM-MNT',
                    'referenced-type': 'mntner',
                },
                {
                    name: 'created',
                    value: '2019-01-07T10:49:13Z',
                },
                {
                    name: 'last-modified',
                    value: '2019-01-07T10:49:13Z',
                },
                {
                    name: 'source',
                    value: 'RIPE',
                },
            ],
        },
    };

    const whoisObject = {
        type: 'inetnum',
        link: {
            type: 'locator',
            href: 'https://rest-prepdev.db.ripe.net/ripe/inetnum/62.77.172.236 - 62.77.172.239',
        },
        source: {
            id: 'ripe',
        },
        'primary-key': {
            attribute: [
                {
                    name: 'inetnum',
                    value: '62.77.172.236 - 62.77.172.239',
                },
            ],
        },
        attributes: {
            attribute: [
                {
                    name: 'inetnum',
                    value: '62.77.172.236 - 62.77.172.239',
                },
                {
                    name: 'netname',
                    value: 'SEVEN',
                },
                {
                    name: 'descr',
                    value: '***',
                },
                {
                    name: 'country',
                    value: 'IE',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/person/OR1578-RIPE',
                    },
                    name: 'admin-c',
                    value: 'OR1578-RIPE',
                    'referenced-type': 'person',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/person/OR1578-RIPE',
                    },
                    name: 'tech-c',
                    value: 'OR1578-RIPE',
                    'referenced-type': 'person',
                },
                {
                    name: 'status',
                    value: 'ASSIGNED PA',
                },
                {
                    name: 'notify',
                    value: '***@eircom.net',
                },
                {
                    link: {
                        type: 'locator',
                        href: 'https://rest-prepdev.db.ripe.net/ripe/mntner/TE-MNT',
                    },
                    name: 'mnt-by',
                    value: 'TE-MNT',
                    'referenced-type': 'mntner',
                },
                {
                    name: 'remarks',
                    value: '***',
                },
                {
                    name: 'created',
                    value: '2014-03-13T07:26:31Z',
                },
                {
                    name: 'last-modified',
                    value: '2014-03-13T07:26:31Z',
                },
                {
                    name: 'source',
                    value: 'RIPE',
                },
            ],
        },
        tags: {
            tag: [
                {
                    id: 'RIPE-USER-RESOURCE',
                },
            ],
        },
        'resource-holder': {
            key: 'ORG-EA29-RIPE',
            name: 'Echo Lima',
        },
        'abuse-contact': {
            key: 'ENA33-RIPE',
            email: 'wmsupport@eir.ie',
            suspect: false,
            'org-id': 'ORG-EA29-RIPE',
        },
        managed: false,
    };
});
