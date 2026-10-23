-- Chạy riêng file này nếu schema.sql đã chạy từ trước.
-- Số sao cao nhất của từng bài cho một học sinh.
create or replace function public.my_best(p_token uuid)
returns table (lesson_id int, stars int)
language sql security definer set search_path = public as $$
  select r.lesson_id, max(r.stars)::int from public.results r
  join public.students s on s.id = r.student_id
  where s.token = p_token group by r.lesson_id
$$;
revoke all on function public.my_best(uuid) from public;
grant execute on function public.my_best(uuid) to anon, authenticated;

