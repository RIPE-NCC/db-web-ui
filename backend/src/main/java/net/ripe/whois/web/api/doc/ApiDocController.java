package net.ripe.whois.web.api.doc;

import com.google.common.base.CaseFormat;
import freemarker.cache.ClassTemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.TemplateException;
import net.ripe.db.whois.api.rest.client.RestClientException;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.reflections.Reflections;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.lang.reflect.AnnotatedElement;
import java.util.*;

import static java.util.Arrays.asList;
import static java.util.Arrays.stream;
import static java.util.Comparator.comparing;
import static org.apache.commons.lang.CharEncoding.UTF_8;
import static org.apache.commons.lang.StringUtils.*;

@RestController
@RequestMapping("/api/doc")
@SuppressWarnings("UnusedDeclaration")
public class ApiDocController {

    @RequestMapping(value = "/**", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity generateApiDoc() {
        try {
            return new ResponseEntity<>(createHtml(createServiceDescriptorModel()), HttpStatus.OK);

        } catch (RestClientException | TemplateException | IOException e) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // returns POJO model with service descriptions for use with Freemarker
    private Map<String, Object> createServiceDescriptorModel() {

        final Map<String, Object> model = new HashMap<>();
        model.put("appName", "db-web-ui");

        final List<ServiceDesciptor> services = new ArrayList<>();
        model.put("services", services);

        // discover all Ripe classes annotated with RestController
        new Reflections("net.ripe.whois").getTypesAnnotatedWith(RestController.class).stream()
            .sorted(comparing(Class::getSimpleName))
            .forEach(controllerClass -> {

                final String basePath = getMappedPath(getRequestMapping(controllerClass).get());

                // get RequestMapping instances for methods annotated with RequestMapping
                stream(controllerClass.getDeclaredMethods()).map(this::getRequestMapping).filter(Optional::isPresent).map(Optional::get).forEach(
                    mapping -> { // use flatMap in JDK 9
                        services.add(new ServiceDesciptor(
                            getFriendlyName(controllerClass),
                            basePath + getMappedPath(mapping),
                            asList(mapping.method()),
                            asList(mapping.produces()),
                            asList(mapping.consumes())));
                    });
            });
        return model;
    }

    private String getMappedPath(RequestMapping mapping) {
        return stream(mapping.value()).filter(p -> !p.equals("/**")).findFirst().orElse("");
    }

    private Optional<RequestMapping> getRequestMapping(AnnotatedElement element) {
        return stream(element.getDeclaredAnnotations())
            .filter(e -> e.toString().contains("RequestMapping"))
            .map(e -> (RequestMapping) e).findFirst();
    }

    // e.g.
    // if restControllerClass.getSimpleName().equals("DnsCheckerController")
    // then "dns checker" is returned.
    @NotNull
    private String getFriendlyName(Class restControllerClass) {

        final String shortName = substringBefore(restControllerClass.getSimpleName(), "Controller");
        return CaseFormat.UPPER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, shortName).replace('_', ' ');
    }

    // mvc: creates a HTML page (view) using the specified POJO model and Freermarker template: templates/api-doc.ftl
    private String createHtml(Map<String, Object> model) throws IOException, TemplateException {

        initLogging();

        final Configuration cfg = new Configuration(Configuration.VERSION_2_3_23);
        cfg.setTemplateLoader(new ClassTemplateLoader(getClass(), "/templates"));

        final Writer stringWriter = new StringWriter();
        cfg.getTemplate("api-doc.ftl", Locale.US, UTF_8).process(model, stringWriter);
        return stringWriter.toString();
    }

    private void initLogging() {

        if (!LogManager.getRootLogger().getAllAppenders().hasMoreElements()) {
            BasicConfigurator.configure(); // suppress error message if no log4.xml file is found
        }
        LogManager.getLogger("freemarker.cache").setLevel(Level.ERROR); // defaults to DEBUG otherwise (too verbose)
        LogManager.getLogger("org.reflections.Reflections").setLevel(Level.ERROR); // defaults to INFO otherwise (too verbose)
    }
}
