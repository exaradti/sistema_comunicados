create extension if not exists pgcrypto;

create table if not exists unidades (
  id bigserial primary key,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists setores (
  id bigserial primary key,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists funcionarios (
  id bigserial primary key,
  nome text not null,
  email text not null,
  setor_id bigint not null references setores(id),
  unidade_id bigint not null references unidades(id),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint funcionarios_email_chk check (position('@' in email) > 1)
);

create table if not exists comunicados (
  id bigserial primary key,
  titulo text not null,
  categoria text not null,
  conteudo text not null,
  setor_origem_id bigint not null references setores(id),
  responsavel_nome text not null,
  responsavel_email text not null,
  tipo_confirmacao text not null check (tipo_confirmacao in ('assinatura','email')),
  status text not null default 'rascunho' check (status in ('rascunho','aguardando_envio','enviado','parcialmente_confirmado','confirmado','fechado','cancelado')),
  hash_conteudo text not null,
  data_criacao timestamptz null,
  data_publicacao timestamptz null,
  data_fechamento timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comunicados_responsavel_email_chk check (position('@' in responsavel_email) > 1)
);

create table if not exists comunicado_destinatarios (
  id bigserial primary key,
  comunicado_id bigint not null references comunicados(id) on delete cascade,
  funcionario_id bigint not null references funcionarios(id),
  setor_id bigint not null references setores(id),
  unidade_id bigint not null references unidades(id),
  status text not null default 'pendente' check (status in ('pendente','enviado','visualizado','confirmado','expirado','erro_envio','cancelado')),
  metodo_confirmacao text not null check (metodo_confirmacao in ('assinatura','email')),
  token_confirmacao text null,
  token_expira_em timestamptz null,
  token_utilizado_em timestamptz null,
  data_envio_email timestamptz null,
  data_visualizacao timestamptz null,
  data_confirmacao timestamptz null,
  ip_confirmacao text null,
  user_agent_confirmacao text null,
  origem_destinatario text not null check (origem_destinatario in ('individual','selecao_manual','setor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comunicado_destinatarios_unique unique (comunicado_id, funcionario_id),
  constraint comunicado_destinatarios_token_unique unique (token_confirmacao)
);

create table if not exists comunicado_anexos (
  id bigserial primary key,
  comunicado_id bigint not null references comunicados(id) on delete cascade,
  nome_arquivo text not null,
  caminho_arquivo text not null,
  tipo_arquivo text not null,
  tamanho_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comunicado_assinaturas (
  id bigserial primary key,
  comunicado_destinatario_id bigint not null references comunicado_destinatarios(id) on delete cascade,
  nome_assinante text not null,
  assinatura_caminho text null,
  assinatura_base64 text null,
  data_assinatura timestamptz not null,
  ip_assinatura text null,
  user_agent_assinatura text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comunicado_assinaturas_destinatario_unique unique (comunicado_destinatario_id)
);

create table if not exists comunicado_historico (
  id bigserial primary key,
  comunicado_id bigint not null references comunicados(id) on delete cascade,
  acao text not null,
  descricao text not null,
  dados jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists idx_funcionarios_setor_id on funcionarios(setor_id);
create index if not exists idx_funcionarios_unidade_id on funcionarios(unidade_id);
create index if not exists idx_comunicados_setor_origem_id on comunicados(setor_origem_id);
create index if not exists idx_comunicados_status on comunicados(status);
create index if not exists idx_comunicado_destinatarios_comunicado_id on comunicado_destinatarios(comunicado_id);
create index if not exists idx_comunicado_destinatarios_funcionario_id on comunicado_destinatarios(funcionario_id);
create index if not exists idx_comunicado_destinatarios_status on comunicado_destinatarios(status);
create index if not exists idx_comunicado_destinatarios_token_confirmacao on comunicado_destinatarios(token_confirmacao);
create index if not exists idx_comunicado_historico_comunicado_id on comunicado_historico(comunicado_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_set_updated_at_unidades before update on unidades for each row execute function set_updated_at();
create or replace trigger trg_set_updated_at_setores before update on setores for each row execute function set_updated_at();
create or replace trigger trg_set_updated_at_funcionarios before update on funcionarios for each row execute function set_updated_at();
create or replace trigger trg_set_updated_at_comunicados before update on comunicados for each row execute function set_updated_at();
create or replace trigger trg_set_updated_at_comunicado_destinatarios before update on comunicado_destinatarios for each row execute function set_updated_at();
create or replace trigger trg_set_updated_at_comunicado_anexos before update on comunicado_anexos for each row execute function set_updated_at();
create or replace trigger trg_set_updated_at_comunicado_assinaturas before update on comunicado_assinaturas for each row execute function set_updated_at();

create or replace function validar_destinatarios_assinatura()
returns trigger as $$
declare
  v_tipo_confirmacao text;
  v_total bigint;
begin
  select tipo_confirmacao into v_tipo_confirmacao from comunicados where id = new.comunicado_id;
  if v_tipo_confirmacao = 'assinatura' then
    select count(*) into v_total from comunicado_destinatarios where comunicado_id = new.comunicado_id and id <> coalesce(new.id, 0);
    if v_total >= 1 then
      raise exception 'comunicado do tipo assinatura deve ter apenas 1 destinatário';
    end if;
    if new.metodo_confirmacao <> 'assinatura' then
      raise exception 'metodo_confirmacao deve ser assinatura';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_validar_destinatarios_assinatura
before insert or update on comunicado_destinatarios
for each row execute function validar_destinatarios_assinatura();

create or replace view vw_comunicados_resumo as
select
  c.*,
  count(cd.id) as total_destinatarios,
  count(cd.id) filter (where cd.status = 'confirmado') as total_confirmados
from comunicados c
left join comunicado_destinatarios cd on cd.comunicado_id = c.id
group by c.id;

create or replace view vw_destinatarios_pendentes as
select cd.*
from comunicado_destinatarios cd
where cd.status = 'pendente';

create or replace view vw_comunicados_por_unidade_destinatario as
select c.id, c.titulo, c.status, cd.unidade_id, count(*) as total_destinatarios
from comunicados c
join comunicado_destinatarios cd on cd.comunicado_id = c.id
group by c.id, c.titulo, c.status, cd.unidade_id;
