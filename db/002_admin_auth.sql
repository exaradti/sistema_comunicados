create extension if not exists "uuid-ossp";

alter table funcionarios
    alter column email set not null;

do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'funcionarios_email_unique'
    ) then
        alter table funcionarios
            add constraint funcionarios_email_unique unique (email);
    end if;
end $$;

create index if not exists idx_funcionarios_setor on funcionarios(setor_id);
create index if not exists idx_funcionarios_unidade on funcionarios(unidade_id);
create index if not exists idx_destinatarios_token on comunicado_destinatarios(token_confirmacao);

create table if not exists usuarios_admin (
    id uuid primary key default uuid_generate_v4(),
    nome text not null,
    email text not null unique,
    senha_hash text not null,
    ativo boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists perfis_admin (
    id uuid primary key default uuid_generate_v4(),
    nome text not null unique,
    descricao text,
    ativo boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists usuarios_admin_perfis (
    id uuid primary key default uuid_generate_v4(),
    usuario_admin_id uuid not null references usuarios_admin(id) on delete cascade,
    perfil_admin_id uuid not null references perfis_admin(id) on delete cascade,
    created_at timestamptz default now(),
    unique(usuario_admin_id, perfil_admin_id)
);

create table if not exists usuarios_admin_setores (
    id uuid primary key default uuid_generate_v4(),
    usuario_admin_id uuid not null references usuarios_admin(id) on delete cascade,
    setor_id bigint not null references setores(id) on delete cascade,
    created_at timestamptz default now(),
    unique(usuario_admin_id, setor_id)
);

create table if not exists usuarios_admin_unidades (
    id uuid primary key default uuid_generate_v4(),
    usuario_admin_id uuid not null references usuarios_admin(id) on delete cascade,
    unidade_id bigint not null references unidades(id) on delete cascade,
    created_at timestamptz default now(),
    unique(usuario_admin_id, unidade_id)
);

create or replace function fn_set_updated_at_admin()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_admin_updated_usuarios on usuarios_admin;
create trigger trg_admin_updated_usuarios
before update on usuarios_admin
for each row execute function fn_set_updated_at_admin();

drop trigger if exists trg_admin_updated_perfis on perfis_admin;
create trigger trg_admin_updated_perfis
before update on perfis_admin
for each row execute function fn_set_updated_at_admin();

insert into perfis_admin (nome, descricao)
values ('super_admin', 'Acesso total ao sistema')
on conflict (nome) do nothing;

insert into usuarios_admin (nome, email, senha_hash)
values (
    'Administrador',
    'admin@admin.com',
    '$2a$10$Q7xasJtU1x7H0YF9A4sN1eWvY0d6Vd2hA4mU3z8lU5Y3BqCw3v0q2'
)
on conflict (email) do nothing;

insert into usuarios_admin_perfis (usuario_admin_id, perfil_admin_id)
select u.id, p.id
from usuarios_admin u
join perfis_admin p on p.nome = 'super_admin'
where u.email = 'admin@admin.com'
on conflict do nothing;

drop view if exists vw_comunicados_resumo;
create view vw_comunicados_resumo as
select
    c.id,
    c.titulo,
    c.categoria,
    c.tipo_confirmacao,
    c.status,
    count(distinct cd.id) as total_destinatarios,
    count(distinct cd.id) filter (where cd.status = 'confirmado') as total_confirmados,
    count(distinct ca.id) as total_assinaturas
from comunicados c
left join comunicado_destinatarios cd on cd.comunicado_id = c.id
left join comunicado_assinaturas ca on ca.comunicado_destinatario_id = cd.id
group by c.id, c.titulo, c.categoria, c.tipo_confirmacao, c.status;
