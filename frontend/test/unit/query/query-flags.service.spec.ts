import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IQueryFlag, QueryFlagsService } from '../../../src/app/query/query-flags.service';

describe('QueryFlagsService', () => {
    let queryFlagsService: QueryFlagsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QueryFlagsService],
        });
        httpMock = TestBed.inject(HttpTestingController);
        queryFlagsService = TestBed.inject(QueryFlagsService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(queryFlagsService).toBeTruthy();
    });

    it('should load FLAGS', () => {
        queryFlagsService.getFlags([]).subscribe((flags) => {
            expect(queryFlagsService.FLAGS).toEqual(mockAllFLAGS);
        });
        const request = httpMock.expectOne({ method: 'GET', url: 'api/metadata/help' });
        expect(request.request.method).toBe('GET');
        request.flush(mockAllFLAGS);
    });

    it('should detect multple flags', () => {
        queryFlagsService.getFlags(['-i', '-q', '--show-tag-info']).subscribe((flags) => {
            const queryFlags: IQueryFlag[] = [
                {
                    longFlag: '--inverse',
                    shortFlag: '-i',
                    description: 'Perform an inverse query.',
                },
                {
                    longFlag: '',
                    shortFlag: '-q',
                    description: '"sources"  see list-sources.\n"version"  see version.\n"types"    show all object types.',
                },
                {
                    longFlag: '--show-tag-info',
                    shortFlag: '',
                    description: 'Switches on tagging information.',
                },
            ];
            expect(flags).toEqual(queryFlags);
        });
        const request = httpMock.expectOne({ method: 'GET', url: 'api/metadata/help' });
        expect(request.request.method).toBe('GET');
        request.flush(mockAllFLAGS);
    });

    it('should return empty list if flag is not valid', () => {
        queryFlagsService.getFlags(['-zg']).subscribe((flags) => {
            expect(flags).toEqual([]);
        });
        const request = httpMock.expectOne({ method: 'GET', url: 'api/metadata/help' });
        expect(request.request.method).toBe('GET');
        request.flush(mockAllFLAGS);
    });

    it('should return just valid query flags', () => {
        queryFlagsService.getFlags(['-zg', '-i']).subscribe((flags) => {
            expect(flags).toEqual([
                {
                    longFlag: '--inverse',
                    shortFlag: '-i',
                    description: 'Perform an inverse query.',
                },
            ]);
        });
        const request = httpMock.expectOne({ method: 'GET', url: 'api/metadata/help' });
        expect(request.request.method).toBe('GET');
        request.flush(mockAllFLAGS);
    });

    it('should return just valid query flag from grouped flags', () => {
        queryFlagsService.getFlags(['-zb']).subscribe((flags) => {
            expect(flags).toEqual([
                {
                    longFlag: '--abuse-contact',
                    shortFlag: '-b',
                    description:
                        'Requests the "abuse-mailbox:" address related to the specified inetnum or inet6num object. Only specified object key and "abuse-mailbox:" attributes are shown.',
                },
            ]);
        });
        const request = httpMock.expectOne({ method: 'GET', url: 'api/metadata/help' });
        expect(request.request.method).toBe('GET');
        request.flush(mockAllFLAGS);
    });

    it('should return query flags for grouped flags', () => {
        queryFlagsService.getFlags(['-xdBr', '--sources']).subscribe((flags) => {
            expect(flags).toEqual([
                {
                    longFlag: '--exact',
                    shortFlag: '-x',
                    description: 'Requests that only an exact match on a prefix be performed. If no exact match is found no objects are returned.',
                },
                {
                    longFlag: '--reverse-domain',
                    shortFlag: '-d',
                    description:
                        'When used with hierarchical flags (like --one-less), both address and route object types and domain object types are returned.',
                },
                {
                    longFlag: '--no-filtering',
                    shortFlag: '-B',
                    description: 'Disables the filtering of "notify:" and "e-mail:" attributes.',
                },
                {
                    longFlag: '--no-referenced',
                    shortFlag: '-r',
                    description: 'Switches off referenced lookup for related information after retrieving the objects that match the query string.',
                },
                {
                    longFlag: '--sources',
                    shortFlag: '-s',
                    description: 'Specifies which sources and in which order are to be looked up when performing a query.',
                },
            ]);
        });
        const request = httpMock.expectOne({ method: 'GET', url: 'api/metadata/help' });
        expect(request.request.method).toBe('GET');
        request.flush(mockAllFLAGS);
    });

    it("shouldn't load FLAGS if they were already loaded", () => {
        queryFlagsService.FLAGS = mockAllFLAGS;
        queryFlagsService.getFlags(['-i']).subscribe((flags) => {
            expect(flags).toEqual([
                {
                    longFlag: '--inverse',
                    shortFlag: '-i',
                    description: 'Perform an inverse query.',
                },
            ]);
        });
        httpMock.expectNone({ method: 'GET', url: 'api/metadata/help' });
    });

    it('should add space behind -T flag', () => {
        expect(queryFlagsService.addSpaceBehindFlagT('--no-personal -Tmntner,organisation shryane-mnt')).toBe(
            '--no-personal -T mntner,organisation shryane-mnt',
        );
    });

    it('should not add space behind -T flag', () => {
        expect(queryFlagsService.addSpaceBehindFlagT('--no-personal -T mntner,organisation shryane-mnt')).toBe(
            '--no-personal -T mntner,organisation shryane-mnt',
        );
    });
});

const mockAllFLAGS: IQueryFlag[] = [
    {
        longFlag: '--exact',
        shortFlag: '-x',
        description: 'Requests that only an exact match on a prefix be performed. If no exact match is found no objects are returned.',
    },
    {
        longFlag: '--one-less',
        shortFlag: '-l',
        description: 'Returns first level less specific inetnum, inet6num or route(6) objects, excluding exact matches.',
    },
    {
        longFlag: '--all-less',
        shortFlag: '-L',
        description: 'Returns all level less specific inetnum, inet6num or route(6) objects, including exact matches.',
    },
    {
        longFlag: '--one-more',
        shortFlag: '-m',
        description: 'Returns first level more specific inetnum, inet6num or route(6) objects, excluding exact matches.',
    },
    {
        longFlag: '--all-more',
        shortFlag: '-M',
        description: 'Returns all level more specific inetnum, inet6num or route(6) objects, excluding exact matches.',
    },
    {
        longFlag: '--no-irt',
        shortFlag: '-C',
        description: "Turns off '-c' or '--irt' flag. Related irt objects are not returned by default.",
    },
    {
        longFlag: '--irt',
        shortFlag: '-c',
        description:
            'Requests first level less specific inetnum or inet6num objects with the "mnt-irt:" attribute. Related irt objects are not returned by default.',
    },
    {
        longFlag: '--abuse-contact',
        shortFlag: '-b',
        description:
            'Requests the "abuse-mailbox:" address related to the specified inetnum or inet6num object. Only specified object key and "abuse-mailbox:" attributes are shown.',
    },
    {
        longFlag: '--reverse-domain',
        shortFlag: '-d',
        description: 'When used with hierarchical flags (like --one-less), both address and route object types and domain object types are returned.',
    },
    {
        longFlag: '--inverse',
        shortFlag: '-i',
        description: 'Perform an inverse query.',
    },
    {
        longFlag: '--brief',
        shortFlag: '-F',
        description: 'Produce output using short hand notation for attribute names.',
    },
    {
        longFlag: '--primary-keys',
        shortFlag: '-K',
        description:
            'Requests that only the primary keys of an object to be returned. The exceptions are set objects, where the (mp-)members attributes will also be returned. This flag does not apply to person and role objects.',
    },
    {
        longFlag: '--persistent-connection',
        shortFlag: '-k',
        description:
            "Requests a persistent connection. After returning the result the connection will not be closed by the server and a client may issue multiple queries on the same connection.\nNote, that server implements 'stop-and-wait' protocol, when no next query can be sent before receiving a reply for the previous one.\nExcept the first -k query, -k without an argument closes the persistent connection.",
    },
    {
        longFlag: '--no-grouping',
        shortFlag: '-G',
        description: 'Disables the grouping of objects by relevance.',
    },
    {
        longFlag: '--no-filtering',
        shortFlag: '-B',
        description: 'Disables the filtering of "notify:" and "e-mail:" attributes.',
    },
    {
        longFlag: '--valid-syntax',
        shortFlag: '',
        description: 'Returns only syntactically correct objects',
    },
    {
        longFlag: '--no-valid-syntax',
        shortFlag: '',
        description: 'Returns only syntactically incorrect objects',
    },
    {
        longFlag: '--no-tag-info',
        shortFlag: '',
        description: 'Switches off tagging information.',
    },
    {
        longFlag: '--show-tag-info',
        shortFlag: '',
        description: 'Switches on tagging information.',
    },
    {
        longFlag: '--filter-tag-include',
        shortFlag: '',
        description: 'Show only objects with given tag(s)',
    },
    {
        longFlag: '--filter-tag-exclude',
        shortFlag: '',
        description: 'Do not show objects with given tag(s)',
    },
    {
        longFlag: '--no-referenced',
        shortFlag: '-r',
        description: 'Switches off referenced lookup for related information after retrieving the objects that match the query string.',
    },
    {
        longFlag: '--no-personal',
        shortFlag: '',
        description: 'Filter PERSON and ROLE objects from results',
    },
    {
        longFlag: '--show-personal',
        shortFlag: '',
        description: 'Include PERSON and ROLE objects in results',
    },
    {
        longFlag: '--select-types',
        shortFlag: '-T',
        description: 'Select the types of objects to lookup in the query.',
    },
    {
        longFlag: '--all-sources',
        shortFlag: '-a',
        description: 'Specifies that the server should perform lookups in all available sources. See also the "-q sources" query.',
    },
    {
        longFlag: '--sources',
        shortFlag: '-s',
        description: 'Specifies which sources and in which order are to be looked up when performing a query.',
    },
    {
        longFlag: '--resource',
        shortFlag: '',
        description: 'Search all sources for resources and returns the authoritative one. Placeholders are omitted.',
    },
    {
        longFlag: '',
        shortFlag: '-q',
        description: '"sources"  see list-sources.\n"version"  see version.\n"types"    show all object types.',
    },
    {
        longFlag: '--list-sources',
        shortFlag: '',
        description:
            'Returns the current set of sources along with the information required for mirroring. See [REF], section 2.9 "Other server features" for more information.',
    },
    {
        longFlag: '--version',
        shortFlag: '',
        description: 'Displays the current version of the server.',
    },
    {
        longFlag: '--types',
        shortFlag: '',
        description: 'List of available RPSL object types.',
    },
    {
        longFlag: '--template',
        shortFlag: '-t',
        description: 'Requests a template for the specified object type.',
    },
    {
        longFlag: '--verbose',
        shortFlag: '-v',
        description: 'Requests a verbose template for the specified object type.',
    },
    {
        longFlag: '--client',
        shortFlag: '-V',
        description: 'Sends information about the client to the server.',
    },
    {
        longFlag: '--list-versions',
        shortFlag: '',
        description: 'Returns a list of historical versions of the object',
    },
    {
        longFlag: '--diff-versions',
        shortFlag: '',
        description: 'Returns a difference between two versions of the object',
    },
    {
        longFlag: '--show-version',
        shortFlag: '',
        description: 'Returns historical version of the object',
    },
];
