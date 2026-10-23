-- Chạy file này trong Supabase → SQL Editor (sau schema.sql). Cây ngôi sao — issue 002.
-- Sao đã kiếm = tổng "số sao cao nhất mỗi bài" (đúng quy tắc: mỗi bài tối đa 3 sao). Sao trong hũ = đã kiếm − đã bón.
-- Mỗi lần bón tốn 1 sao. Cây ở stage -2..5; 7 ngày không bón thì tụt 1 stage (không dưới -2), KHÔNG hoàn sao.

create table if not exists public.plants (
  student_id   bigint primary key references public.students(id) on delete cascade,
  stage        int not null default 0 check (stage between -2 and 5),
  progress     int not null default 0,
  spent        int not null default 0,
  last_fed_at  timestamptz,
  decay_anchor timestamptz
);
alter table public.plants enable row level security;
revoke all on public.plants from anon, authenticated;

-- Hàm dùng chung: áp dụng héo, rồi (nếu p_feed) bón 1 sao. Không cấp quyền cho trình duyệt.
create or replace function public.garden_step(p_token uuid, p_feed boolean)
returns table (earned int, spent int, jar int, stage int, progress int, last_fed_at timestamptz, wilted int)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  -- PHẢI KHỚP window.GARDEN_STARS_PER_STAGE trong config.js (số sao cần bón để lên 1 stage).
  c_cost constant int := 1;
  sid bigint; pl public.plants; n int := 0; old_stage int; e int;
begin
  select id into sid from public.students where token = p_token;
  if sid is null then return; end if;

  insert into public.plants (student_id) values (sid) on conflict do nothing;
  select * into pl from public.plants where student_id = sid for update;

  -- Héo: mỗi 7 ngày liên tiếp không bón (tính từ lần bón cuối hoặc mốc đã tính) giảm 1 stage.
  old_stage := pl.stage;
  if pl.last_fed_at is not null then
    n := floor(extract(epoch from (now() - greatest(pl.last_fed_at, coalesce(pl.decay_anchor, pl.last_fed_at)))) / 604800)::int;
    if n > 0 then
      pl.stage := greatest(-2, pl.stage - n);
      pl.progress := 0;
      pl.decay_anchor := greatest(pl.last_fed_at, coalesce(pl.decay_anchor, pl.last_fed_at)) + n * interval '7 days';
    end if;
  end if;

  select coalesce(sum(m), 0)::int into e
  from (select max(r.stars) as m from public.results r where r.student_id = sid group by r.lesson_id) t;

  if p_feed and e - pl.spent > 0 and pl.stage < 5 then
    pl.spent := pl.spent + 1;
    pl.progress := pl.progress + 1;
    if pl.progress >= c_cost then pl.stage := pl.stage + 1; pl.progress := 0; end if;
    pl.last_fed_at := now();
    pl.decay_anchor := now();
  end if;

  update public.plants p set stage = pl.stage, progress = pl.progress, spent = pl.spent,
    last_fed_at = pl.last_fed_at, decay_anchor = pl.decay_anchor where p.student_id = sid;

  return query select e, pl.spent, greatest(e - pl.spent, 0), pl.stage, pl.progress, pl.last_fed_at, greatest(old_stage - pl.stage, 0) where true;
end $$;
revoke all on function public.garden_step(uuid, boolean) from public;

create or replace function public.get_garden(p_token uuid)
returns table (earned int, spent int, jar int, stage int, progress int, last_fed_at timestamptz, wilted int)
language sql security definer set search_path = public as $$ select * from public.garden_step(p_token, false) $$;

create or replace function public.feed_plant(p_token uuid)
returns table (earned int, spent int, jar int, stage int, progress int, last_fed_at timestamptz, wilted int)
language sql security definer set search_path = public as $$ select * from public.garden_step(p_token, true) $$;

revoke all on function public.get_garden(uuid), public.feed_plant(uuid) from public;
grant execute on function public.get_garden(uuid), public.feed_plant(uuid) to anon, authenticated;
