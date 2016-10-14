package net.ripe.whois.aop.logging;

import net.ripe.whois.config.Constants;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Aspect for logging execution of service and repository Spring components.
 */
@Aspect
@Component
public class LoggingAspect {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingAspect.class);

    private final Environment environment;

    @Autowired
    public LoggingAspect(final Environment environment) {
        this.environment = environment;
    }

    @Pointcut("within(net.ripe.whois.repository..*) || within(net.ripe.whois.service..*) || within(net.ripe.whois.web.rest..*)")
    public void loggingPointcut() {}

    @AfterThrowing(pointcut = "loggingPointcut()", throwing = "t")
    public void logAfterThrowing(final JoinPoint joinPoint, final Throwable t) {
        if (environment.acceptsProfiles(Constants.SPRING_PROFILE_DEVELOPMENT)) {
            LOGGER.error("Exception in {}.{}() with cause = {}",
                    joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName(),
                    t.getCause(), t);
        } else {
            LOGGER.error("Exception in {}.{}() with cause = {}",
                    joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName(),
                    t.getCause());
        }
    }

    @Around("loggingPointcut()")
    public Object logAround(final ProceedingJoinPoint joinPoint) throws Throwable {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Enter: {}.{}() with argument[s] = {}",
                    joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName(),
                    Arrays.toString(joinPoint.getArgs()));
        }
        try {
            Object result = joinPoint.proceed();
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug("Exit: {}.{}() with result = {}",
                        joinPoint.getSignature().getDeclaringTypeName(),
                        joinPoint.getSignature().getName(), result);
            }
            return result;
        } catch (IllegalArgumentException e) {
            LOGGER.error("Illegal argument: {} in {}.{}()",
                    Arrays.toString(joinPoint.getArgs()),
                    joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName());

            throw e;
        }
    }
}
