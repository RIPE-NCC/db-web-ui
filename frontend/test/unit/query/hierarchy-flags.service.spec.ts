import { HierarchyFlagsService } from '../../../src/app/query/hierarchy-flags.service';

describe('HierarchyFlagsService', () => {
    it('should convert short flag to long', () => {
        expect(HierarchyFlagsService.shortHierarchyFlagToLong('No')).toBe('');
        expect(HierarchyFlagsService.shortHierarchyFlagToLong('l')).toBe('one-less');
        expect(HierarchyFlagsService.shortHierarchyFlagToLong('L')).toBe('all-less');
        expect(HierarchyFlagsService.shortHierarchyFlagToLong('m')).toBe('one-more');
        expect(HierarchyFlagsService.shortHierarchyFlagToLong('M')).toBe('all-more');
        expect(HierarchyFlagsService.shortHierarchyFlagToLong('x')).toBe('exact');
        expect(HierarchyFlagsService.shortHierarchyFlagToLong('z')).toBeUndefined();
    });

    it('should convert long flag to short', () => {
        expect(HierarchyFlagsService.longHierarchyFlagToShort('')).toBe('No');
        expect(HierarchyFlagsService.longHierarchyFlagToShort('one-less')).toBe('l');
        expect(HierarchyFlagsService.longHierarchyFlagToShort('all-less')).toBe('L');
        expect(HierarchyFlagsService.longHierarchyFlagToShort('one-more')).toBe('m');
        expect(HierarchyFlagsService.longHierarchyFlagToShort('all-more')).toBe('M');
        expect(HierarchyFlagsService.longHierarchyFlagToShort('exact')).toBe('x');
        expect(HierarchyFlagsService.longHierarchyFlagToShort('blah')).toBeUndefined();
    });

    it('should give id of short flag', () => {
        expect(HierarchyFlagsService.idHierarchyFlagFromShort('No')).toBe(0);
        expect(HierarchyFlagsService.idHierarchyFlagFromShort('l')).toBe(1);
        expect(HierarchyFlagsService.idHierarchyFlagFromShort('L')).toBe(2);
        expect(HierarchyFlagsService.idHierarchyFlagFromShort('m')).toBe(3);
        expect(HierarchyFlagsService.idHierarchyFlagFromShort('M')).toBe(4);
        expect(HierarchyFlagsService.idHierarchyFlagFromShort('x')).toBe(5);
        expect(HierarchyFlagsService.idHierarchyFlagFromShort('z')).toBeUndefined();
    });
});
