create table if not exists pets (
    id bigint generated always as identity primary key,
    owner_id bigint not null,
    name varchar(64) not null,
    species varchar(32) not null,
    breed varchar(64),
    date_of_birth date,
    notes varchar(512),
    constraint fk_pets_owner foreign key (owner_id) references users (id)
);

create index if not exists ix_pets_owner on pets(owner_id);