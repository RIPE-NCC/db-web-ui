// jsdom does not implement IntersectionObserver
if (!('IntersectionObserver' in globalThis)) {
    globalThis.IntersectionObserver = class {
        readonly root = null;
        readonly rootMargin = '';
        readonly thresholds = [];
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
            return [];
        }
    } as unknown as typeof IntersectionObserver;
}

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView ??= () => {};
