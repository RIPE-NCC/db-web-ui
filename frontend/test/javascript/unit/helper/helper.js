
function expectGetLirs(withFlush) {
    inject(function(_$httpBackend_) {
        _$httpBackend_.expectGET('api/ba-apps/lirs').respond(function () {
            return [200, {
                response: {
                    status: 200,
                    results: []
                }
            }, {}];
        });

        if(withFlush === true) {
            _$httpBackend_.flush();
        }
    });
}

function expectGetOrganisations(withFlush) {
    inject(function(_$httpBackend_) {
        _$httpBackend_.expectGET('api/ba-apps/organisations').respond(function () {
            return [200, []];
        });

        if(withFlush === true) {
            _$httpBackend_.flush();
        }
    });
}
