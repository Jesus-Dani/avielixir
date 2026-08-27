-- Auto-create a customer row whenever a new auth user signs up, so the app
-- never has to race a client-side insert against RLS right after signup.
create function handle_new_auth_user() returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into customer (id, name) values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
