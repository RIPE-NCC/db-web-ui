import { footer } from './footer-menu.json';

export const resourcesMenuObject = {
    menu: {
        main: [
            {
                title: 'Overview',
                url: 'myresources/overview',
                id: 'myresources',
                icon: 'assets/icons/fa-sitemap.svg',
                active: () => location.href.includes('myresources/overview') || location.href.includes('myresources/detail'),
            },
            {
                title: 'IP Analyser',
                url: 'ip-analyser',
                id: 'ipanalyser',
                icon: 'assets/icons/fa-signal-bar.svg',
                active: () => location.href.includes('ip-analyser'),
            },
        ],
        footer: footer,
    },
};

export const getResourceMenu = (userLoggedIn: boolean) => {
    return {
        main: userLoggedIn ? resourcesMenuObject.menu.main : [],
        footer: footer,
    };
};
