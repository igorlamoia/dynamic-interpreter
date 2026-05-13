create table users
(
    id              serial
        primary key,
    organization_id integer                      not null
        references organizations,
    role            dynamic_interpreter.userrole not null,
    email           varchar                      not null
        unique,
    password        varchar                      not null,
    name            varchar                      not null,
    avatar_url      varchar,
    bio             varchar
);

create table test_cases
(
    id              serial
        primary key,
    exercise_id     integer not null
        references exercises
            on delete cascade,
    label           varchar not null,
    input           varchar not null,
    expected_output varchar not null,
    order_index     integer not null
);

create table submissions
(
    id               serial
        primary key,
    exercise_id      integer                              not null
        references exercises,
    exercise_list_id integer                              not null
        references exercise_lists,
    class_id         integer                              not null
        references classes,
    student_id       integer                              not null
        references users,
    code_snapshot    varchar                              not null,
    status           dynamic_interpreter.submissionstatus not null,
    score            double precision,
    teacher_feedback varchar,
    submitted_at     timestamp                            not null
);

create index ix_submissions_exercise_list_class
    on submissions (exercise_list_id, class_id);

create index ix_submissions_student_id
    on submissions (student_id);


create table organizations
(
    id         serial
        primary key,
    name       varchar   not null,
    created_at timestamp not null
);

create table exercises
(
    id          serial
        primary key,
    teacher_id  integer   not null
        references users,
    title       varchar   not null,
    description varchar   not null,
    attachments varchar   not null,
    created_at  timestamp not null,
    updated_at  timestamp not null
);

create table exercise_lists
(
    id          serial
        primary key,
    teacher_id  integer   not null
        references users,
    title       varchar   not null,
    description varchar   not null,
    created_at  timestamp not null,
    updated_at  timestamp not null
);

create table exercise_list_items
(
    exercise_list_id integer          not null
        references exercise_lists
            on delete cascade,
    exercise_id      integer          not null
        references exercises
            on delete restrict,
    grade_weight     double precision not null,
    order_index      integer          not null,
    primary key (exercise_list_id, exercise_id)
);

create table classes
(
    id              serial
        primary key,
    organization_id integer                         not null
        references organizations,
    teacher_id      integer                         not null
        references users,
    name            varchar                         not null,
    description     varchar                         not null,
    access_code     varchar                         not null
        unique,
    created_at      timestamp                       not null,
    status          dynamic_interpreter.classstatus not null
);

create table class_members
(
    class_id   integer   not null
        references classes,
    student_id integer   not null
        references users,
    joined_at  timestamp not null,
    primary key (class_id, student_id)
);

create table class_exercise_lists
(
    exercise_list_id integer          not null
        references exercise_lists
            on delete cascade,
    class_id         integer          not null
        references classes
            on delete cascade,
    deadline         timestamp        not null,
    total_grade      double precision not null,
    min_required     integer          not null,
    published_at     timestamp        not null,
    updated_at       timestamp        not null,
    primary key (exercise_list_id, class_id)
);

create table alembic_version
(
    version_num varchar(32) not null
        constraint alembic_version_pkc
            primary key
);
