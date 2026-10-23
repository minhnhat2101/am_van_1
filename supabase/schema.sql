-- Chạy toàn bộ file này trong Supabase → SQL Editor.
-- Trình duyệt chỉ gọi được 2 hàm: login và save_result. Không đọc/ghi trực tiếp các bảng.

create extension if not exists unaccent with schema extensions;

create table if not exists public.students (
  id         bigint generated always as identity primary key,
  full_name  text not null,
  token      uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now()
);

create table if not exists public.results (
  id         bigint generated always as identity primary key,
  student_id bigint not null references public.students(id) on delete cascade,
  lesson_id  int  not null,
  score      int  not null,
  stars      int  not null,
  first_try  int  not null,
  total      int  not null,
  created_at timestamptz not null default now()
);
create index if not exists results_student_idx on public.results (student_id, created_at desc);

-- Bật RLS và không tạo policy nào: anon/authenticated không đọc được bảng.
alter table public.students enable row level security;
alter table public.results  enable row level security;
revoke all on public.students, public.results from anon, authenticated;

-- Chuẩn hoá tên: bỏ dấu, đ -> d, chữ thường, gộp khoảng trắng.
create or replace function public.norm_name(s text) returns text
language sql stable set search_path = public, extensions as $$
  select lower(regexp_replace(btrim(translate(extensions.unaccent(coalesce(s, '')), 'đĐ', 'dD')), '\s+', ' ', 'g'))
$$;

-- Đăng nhập bằng họ tên: trả về token + tên, hoặc không có dòng nào nếu không khớp.
create or replace function public.login(p_name text)
returns table (token uuid, full_name text)
language sql security definer set search_path = public, extensions as $$
  select s.token, s.full_name from public.students s
  where public.norm_name(s.full_name) = public.norm_name(p_name) and public.norm_name(p_name) <> ''
  limit 1
$$;

-- Lưu kết quả một lượt làm bài.
create or replace function public.save_result(p_token uuid, p_lesson int, p_score int, p_stars int, p_first_try int, p_total int)
returns boolean
language plpgsql security definer set search_path = public as $$
declare sid bigint;
begin
  select id into sid from public.students where token = p_token;
  if sid is null then return false; end if;
  if p_stars not between 1 and 3 or p_score < 0 or p_total < 1 or p_first_try not between 0 and p_total then return false; end if;
  insert into public.results (student_id, lesson_id, score, stars, first_try, total)
  values (sid, p_lesson, p_score, p_stars, p_first_try, p_total);
  return true;
end $$;

revoke all on function public.login(text), public.save_result(uuid,int,int,int,int,int) from public;
grant execute on function public.login(text), public.save_result(uuid,int,int,int,int,int) to anon, authenticated;

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

-- Danh sách học sinh (thay bằng danh sách thật):
-- insert into public.students (full_name) values ('Nguyen Van A'), ('Tran Thi B');

-- Xem báo cáo (chạy trong SQL Editor):
-- select s.full_name, r.lesson_id, r.score, r.stars, r.first_try, r.total, r.created_at
-- from public.results r join public.students s on s.id = r.student_id order by r.created_at desc;

-- Cây ngôi sao (issue 002): chạy thêm supabase/garden.sql (bảng plants, get_garden, feed_plant).
