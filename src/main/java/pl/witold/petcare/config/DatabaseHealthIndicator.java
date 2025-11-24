package pl.witold.petcare.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.Map;

/**
 * Custom health indicator for database connectivity.
 * Provides detailed information about database connection status.
 */
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;

    public DatabaseHealthIndicator(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(1)) {
                DatabaseMetaData metaData = connection.getMetaData();
                return Health.up()
                        .withDetail("database", metaData.getDatabaseProductName())
                        .withDetail("version", metaData.getDatabaseProductVersion())
                        .withDetail("driver", metaData.getDriverName())
                        .withDetail("driverVersion", metaData.getDriverVersion())
                        .withDetail("url", metaData.getURL())
                        .withDetail("readOnly", metaData.isReadOnly())
                        .build();
            } else {
                return Health.down()
                        .withDetail("error", "Connection validation failed")
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", e.getClass().getSimpleName())
                    .withDetail("message", e.getMessage())
                    .build();
        }
    }
}

