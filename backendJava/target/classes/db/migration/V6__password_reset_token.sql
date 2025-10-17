create table if not exists password_reset_tokens (
  id               bigserial primary key,
  user_id          bigint not null references users(id) on delete cascade,
  token_hash       varchar(64) not null,
  expires_at       timestamp not null,
  used             boolean not null default false,
  created_at       timestamp not null default now(),
  unique (token_hash)
);

create index if not exists ix_prt_user on password_reset_tokens(user_id);
