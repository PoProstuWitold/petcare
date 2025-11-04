package pl.witold.petcare.pet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pl.witold.petcare.user.User;

import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwnerOrderByNameAsc(User owner);
    @Query("""
           select p from Pet p join fetch p.owner o order by o.fullName, p.name
           """)
    List<Pet> findAllWithOwnerOrdered();
}
