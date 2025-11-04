-- Users
create table if not exists users (
    id bigint generated always as identity primary key,
    full_name varchar(128) not null,
    username varchar(64) not null,
    email varchar(255) not null,
    password_hash varchar(60) not null
);
alter table users add constraint uk_users_username unique (username);
alter table users add constraint uk_users_email unique (email);

-- Roles (as element collection)
create table if not exists user_roles (
    user_id bigint not null,
    role varchar(32) not null,
    constraint fk_user_roles_user foreign key (user_id) references users (id)
);
create index if not exists ix_user_roles_user on user_roles(user_id);
