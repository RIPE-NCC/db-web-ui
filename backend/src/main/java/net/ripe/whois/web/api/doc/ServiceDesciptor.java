package net.ripe.whois.web.api.doc;

import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

public class ServiceDesciptor {

    public ServiceDesciptor(String name, String path, List<RequestMethod> methods, List<String> produces, List<String> consumes) {
        this.name = name;
        this.path = path;
        this.methods = methods;
        this.produces = produces;
        this.consumes = consumes;
    }

    private String name;

    private String path;

    private List<RequestMethod> methods;

    private List<String> produces;

    private List<String> consumes;

    public String getPath() { return path; }

    public String getName() { return name; }

    public List<RequestMethod> getMethods() { return methods; }

    public List<String> getProduces() { return produces; }

    public List<String> getConsumes() { return consumes; }
}
