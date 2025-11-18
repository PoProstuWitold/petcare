package pl.witold.petcare;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.util.Arrays;

@SpringBootApplication
public class PetcareApplication {
    private static final Logger log = LoggerFactory.getLogger(PetcareApplication.class);

    public static void main(String[] args) {
        var app = new SpringApplication(PetcareApplication.class);
        Environment env = app.run(args).getEnvironment();
        
        logApplicationStartup(env);
    }

    private static void logApplicationStartup(Environment env) {
        String protocol = "http";
        if (env.getProperty("server.ssl.key-store") != null) {
            protocol = "https";
        }
        
        String serverPort = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "");
        String hostAddress = "localhost";
        
        log.info("""
                
                ╔══════════════════════════════════════════════════════════════╗
                ║                    🐾 PetCare Application 🐾                ║
                ╚══════════════════════════════════════════════════════════════╝
                
                Application '{}' is running! Access URLs:
                
                \tLocal: \t\t{}://localhost:{}{}
                \tExternal: \t{}://{}:{}{}
                \tProfile(s): \t{}
                \tSwagger UI: \t{}://localhost:{}{}/swagger-ui/index.html
                
                ═══════════════════════════════════════════════════════════════
                """,
                env.getProperty("spring.application.name"),
                protocol, serverPort, contextPath,
                protocol, hostAddress, serverPort, contextPath,
                Arrays.toString(env.getActiveProfiles().length == 0 
                    ? env.getDefaultProfiles() 
                    : env.getActiveProfiles()),
                protocol, serverPort, contextPath
        );
    }
}
