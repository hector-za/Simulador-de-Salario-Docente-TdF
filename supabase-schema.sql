-- Ejecutar este script UNA VEZ en Supabase: panel del proyecto > SQL Editor > New query > pegar y correr.

-- Tabla de perfiles: una fila por cada usuario registrado, con su estado de suscripción.
create table if not exists perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  estado_suscripcion text not null default 'inactivo', -- 'activo' | 'inactivo'
  mercadopago_suscripcion_id text,
  creado_en timestamp with time zone default now()
);

-- Cada vez que alguien se registra (auth.users), se crea automáticamente
-- su fila en "perfiles" con estado "inactivo", lista para cuando se suscriba.
create or replace function crear_perfil_nuevo_usuario()
returns trigger as $$
begin
  insert into public.perfiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute procedure crear_perfil_nuevo_usuario();

-- Seguridad a nivel de fila: cada usuario solo puede leer su propia fila.
-- El backend (API routes) usa la "service role key", que no pasa por estas
-- reglas, así que puede leer y escribir cualquier fila sin problema.
alter table perfiles enable row level security;

create policy "Cada usuario ve solo su propio perfil"
  on perfiles for select
  using (auth.uid() = id);
