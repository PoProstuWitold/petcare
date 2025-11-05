package pl.witold.petcare.status;

import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class StatusService {

    private final Optional<DataSource> dataSource;

    public StatusService(Optional<DataSource> dataSource) {
        this.dataSource = dataSource;
    }

    public Map<String, Object> overall() {
        Map<String, Object> details = new LinkedHashMap<>();

        RuntimeMXBean mx = ManagementFactory.getRuntimeMXBean();
        details.put("uptime_ms", mx.getUptime());

        String dbStatus = "UNKNOWN";
        if (dataSource.isPresent()) {
            try (Connection c = dataSource.get().getConnection()) {
                dbStatus = c.isValid(1) ? "UP" : "DOWN";
            } catch (Exception e) {
                dbStatus = "DOWN";
                details.put("db_error", e.getClass().getSimpleName() + ": " + e.getMessage());
            }
        }
        details.put("db", dbStatus);

        String status = "UP";
        if ("DOWN".equals(dbStatus)) status = "DEGRADED";

        return Map.of(
                "status", status,
                "details", details
        );
    }

    public Map<String, Object> liveness() {
        return Map.of(
                "status", "UP",
                "details", Map.of(
                        "jvm_uptime_ms", ManagementFactory.getRuntimeMXBean().getUptime()
                )
        );
    }

    public Map<String, Object> readiness() {
        Map<String, Object> base = overall();
        String status = (String) base.get("status");
        return Map.of(
                "status", status,
                "details", base.get("details")
        );
    }
}
