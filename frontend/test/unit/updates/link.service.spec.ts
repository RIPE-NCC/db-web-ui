import { TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { LinkService } from '../../../src/app/updatesweb/link.service';
import { UpdatesWebModule } from '../../../src/app/updatesweb/updateweb.module';

describe('LinkService', () => {
    let linkService: LinkService;
    const source: string = 'TEST';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UpdatesWebModule],
            providers: [LinkService],
        });
        linkService = TestBed.inject(LinkService);
    });

    it('should be linkService defined', () => {
        expect(_.isUndefined(linkService)).toBeFalse();
        expect(_.isUndefined(linkService.getModifyUrl)).toBeFalse();
        expect(_.isFunction(linkService.getModifyUrl)).toBeTruthy();
    });

    it('should create a display link for object', () => {
        expect(linkService.getModifyUrl(source, 'mntner', 'TEST-MNT')).toBe('webupdates/display/TEST/mntner/TEST-MNT');
    });

    it('should create an href link for object', () => {
        expect(linkService.getLink(source, 'mntner', 'TEST-MNT')).toBe(`<a target="_blank" href="webupdates/display/TEST/mntner/TEST-MNT">TEST-MNT</a>`);
    });

    it('should create mntner links from one end mntner', () => {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, 'MNT1')).toBe(
            `<a target="_blank" href="webupdates/display/TEST/mntner/MNT1">MNT1</a>`,
        );
    });

    it('should create mntner links from one ripe and one end mntner', () => {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, 'TEST-NCC-MNT, MNT1')).toBe(
            `<a target="_blank" href="webupdates/display/TEST/mntner/MNT1">MNT1</a>`,
        );
    });

    it('should create mntner links from one ripe and two end mntners', () => {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, 'TEST-NCC-MNT, MNT1, MNT2')).toBe(
            `<a target="_blank" href="webupdates/display/TEST/mntner/MNT1">MNT1</a> or ` +
                `<a target="_blank" href="webupdates/display/TEST/mntner/MNT2">MNT2</a>`,
        );
    });

    it('should create mntner links from one ripe and three end mntners', () => {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, 'TEST-NCC-MNT, MNT1, MNT2, MNT3')).toBe(
            `<a target="_blank" href="webupdates/display/TEST/mntner/MNT1">MNT1</a>, ` +
                `<a target="_blank" href="webupdates/display/TEST/mntner/MNT2">MNT2</a> or ` +
                `<a target="_blank" href="webupdates/display/TEST/mntner/MNT3">MNT3</a>`,
        );
    });

    it('should create mntner links from only one ripe mntner', () => {
        expect(linkService.filterAndCreateTextWithLinksForMntners(source, 'TEST-NCC-MNT')).toBe(
            `<a target="_blank" href="webupdates/display/TEST/mntner/TEST-NCC-MNT">TEST-NCC-MNT</a>`,
        );
    });
});
