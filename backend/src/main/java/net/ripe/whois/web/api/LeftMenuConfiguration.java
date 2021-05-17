package net.ripe.whois.web.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LeftMenuConfiguration {

    @Value("${request.resources.url:}")
    private String requestResourcesUrl;
    @Value("${request.transfer.url:}")
    private String requestTransferUrl;
    @Value("${request.update.url:}")
    private String requestUpdateUrl;
    @Value("${ipv4.transfer.listing.service.url}")
    private String ipv4TransferListingServiceUrl;
    @Value("${rpki.dashboard.url:}")
    private String rpkiDashboardUrl;
    @Value("${open.acquisition.url:}") //we need it to be #/open-lir-org-change
    private String openAcquisitionUrl;

    public String getRequestResourcesUrl() {
        return requestResourcesUrl;
    }

    public String getRequestUpdateUrl() {
        return requestUpdateUrl;
    }

    public String getRequestTransferUrl() {
        return requestTransferUrl;
    }

    public String getIpv4TransferListingServiceUrl() {
        return ipv4TransferListingServiceUrl;
    }

    public String getRpkiDashboardUrl() {
        return rpkiDashboardUrl;
    }

    public String getOpenAcquisitionUrl() {
        return openAcquisitionUrl;
    }
}
