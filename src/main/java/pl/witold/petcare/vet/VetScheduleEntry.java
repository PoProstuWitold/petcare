package pl.witold.petcare.vet;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Entity describing a single weekly schedule rule for a vet.
 * Example: every MONDAY 09:00–13:00 with 20-minute slots.
 */
@Getter
@Entity
@Table(name = "vet_schedule_entries")
public class VetScheduleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_profile_id", nullable = false)
    private VetProfile vetProfile;

    @Setter
    @Column(name = "day_of_week", nullable = false, length = 16)
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @Setter
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Setter
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Setter
    @Column(name = "slot_length_minutes", nullable = false)
    private Integer slotLengthMinutes;

    public VetScheduleEntry() {
        // for JPA
    }
}
