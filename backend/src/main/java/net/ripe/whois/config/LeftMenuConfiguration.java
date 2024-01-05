package net.ripe.whois.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "classpath:menu.properties", ignoreResourceNotFound = true)
public class LeftMenuConfiguration {

    @Value("${request.resources.url:}")
    private String requestResourcesUrl;
    @Value("${request.transfer.url:}")
    private String requestTransferUrl;
    @Value("${request.update.url:}")
    private String requestUpdateUrl;
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

    public String getRpkiDashboardUrl() {
        return rpkiDashboardUrl;
    }

    public String getOpenAcquisitionUrl() {
        return openAcquisitionUrl;
    }
}
