-- Ahenk v56 — Admin denetim kaydı (accountability). Admin hassas veriye (mesaj
-- içeriği) eriştiğinde KİM, NE ZAMAN, KİME baktığı loglanır. Yalnız service_role.
create table if not exists admin_audit (
  id          bigint generated always as identity primary key,
  admin_id    uuid references profiles(id) on delete set null,
  action      text not null,         -- ör: 'view_messages'
  target_user uuid,                  -- incelenen kullanıcı
  meta        text,                  -- ek bilgi (member_no, sebep vb.)
  created_at  timestamptz default now()
);
create index if not exists idx_admin_audit_created on admin_audit(created_at desc);

alter table admin_audit enable row level security;
-- Politika yok → yalnız service_role (admin API) yazar/okur.
