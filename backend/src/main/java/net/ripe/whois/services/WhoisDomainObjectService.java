package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.whois.web.api.OidcTokenExtractor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.Future;

@Service
public class WhoisDomainObjectService {

    private final OidcTokenExtractor oidcTokenExtractor;
    private final WhoisDomainObjectAsyncWorker whoisDomainObjectAsyncWorker;

    @Autowired
    public WhoisDomainObjectService(final WhoisDomainObjectAsyncWorker whoisDomainObjectAsyncWorker,
                                    final OidcTokenExtractor oidcTokenExtractor) {
        this.whoisDomainObjectAsyncWorker = whoisDomainObjectAsyncWorker;
        this.oidcTokenExtractor = oidcTokenExtractor;

    }

    public Future<ResponseEntity<String>> createDomainObjects(
            final String source,
            final List<WhoisObject> domainObjects,
            final String remoteAddress){
        return whoisDomainObjectAsyncWorker.createDomainObjectsAsync(source, domainObjects, remoteAddress, oidcTokenExtractor.extract());
    }
}
