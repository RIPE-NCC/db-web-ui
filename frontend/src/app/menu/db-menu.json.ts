import { footer } from './footer-menu.json';

export const dbMenuObject = {
    menu: {
        main: [
            {
                title: 'Query Database',
                url: 'query',
                id: 'query',
                icon: 'assets/icons/fa-database.svg',
                active: () => location.href.includes('query') || location.href.includes('lookup'),
            },
            {
                title: 'Full Text Search',
                url: 'fulltextsearch',
                id: 'fulltextsearch',
                icon: 'assets/icons/fa-magnifying-glass.svg',
            },
            {
                title: 'Syncupdates',
                url: 'syncupdates',
                id: 'syncupdates',
                icon: 'assets/icons/fa-arrows-rotate.svg',
            },
            {
                title: 'Create an Object',
                url: 'webupdates/select',
                id: 'select',
                icon: 'assets/icons/fa-layer-plus.svg',
                active: () => location.href.includes('webupdates/select'),
            },
            {
                title: 'API Keys',
                url: 'api-keys',
                id: 'api-keys',
                icon: 'assets/icons/fa-key.svg',
            },
            {
                title: 'Test Database',
                url: 'https://apps-test.db.ripe.net/db-web-ui/query',
                id: 'test-database',
                external: true,
                icon: 'assets/icons/fa-graduation-cap.svg',
            },
        ],
        footer: footer,
    },
};
