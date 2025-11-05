package pl.witold.petcare.pet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwnerId(Long ownerId);

    @Query("""
        select p from Pet p join fetch p.owner o where p.id = :id
        """)
    Optional<Pet> findByIdWithOwner(@Param("id") Long id);

    @Query("""
        select p from Pet p join fetch p.owner o
        """)
    List<Pet> findAllWithOwner();

    @Query("""
        select p from Pet p join fetch p.owner o where o.id = :ownerId
        """)
    List<Pet> findByOwnerIdWithOwner(@Param("ownerId") Long ownerId);
}
