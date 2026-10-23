# Góc âm vần lớp 1

Web luyện chính tả phân biệt âm – vần cho học sinh lớp 1, dựa trên tài liệu "Bài tập chính tả (phân biệt âm – vần)" của cô Ngọc Ánh. Dùng được trên điện thoại, máy tính bảng và máy tính (chuột hoặc cảm ứng).

## Mục tiêu
- Giúp học sinh lớp 1 phân biệt các cặp âm/vần dễ nhầm (c/k, g/gh, ng/ngh) qua các trò chơi ngắn, có hình ảnh.
- Cho học sinh lớp 1/4 đăng nhập bằng họ tên để lưu kết quả; cô giáo xem được tiến bộ của từng em.
- Học sinh lớp khác vẫn chơi tự do, không lưu dữ liệu.

## Chức năng
- **Màn giới thiệu:** hai nút "Học sinh lớp 1/4" (nhập họ tên không dấu để đăng nhập) và "Học sinh khác" (vào thẳng, không lưu).
- **6 bài**, mỗi bài gồm nhiều trò chơi: điền chữ vào chỗ trống, chọn từ viết đúng, nối từ với hình, phân loại vào giỏ, lật thẻ ghép đôi, tìm từ viết đúng, sắp xếp từ thành câu (kéo vào ô, bấm "Kiểm tra", từ sai tự trả về).
- Kéo thả (chuột/cảm ứng) hoặc chạm; có âm thanh và đọc to.
- Chấm điểm, xếp 1–3 sao cho mỗi bài. Học sinh đăng nhập thấy sao cao nhất của riêng mình (lấy từ Supabase, đổi máy vẫn thấy); học sinh khác lưu sao trên máy đang dùng.
- Đăng nhập lớp 1/4: cuối mỗi bài lưu điểm, số sao, số câu đúng ngay lần đầu lên Supabase. Có nút "Đăng xuất".

## Cấu trúc
| File | Vai trò |
|---|---|
| `index.html`, `style.css` | Giao diện |
| `app.js` | Toàn bộ logic: trò chơi, kéo thả, đăng nhập, lưu kết quả |
| `data.js` | Nội dung bài tập (thêm bài: sao chép một khối trong `LESSONS`) |
| `config.js` | Cấu hình Supabase (URL + anon key) |
| `supabase/schema.sql` | Tạo bảng và hàm cho cơ sở dữ liệu (chạy một lần) |
| `supabase/my_best.sql` | Chỉ hàm `my_best`, dùng nếu đã chạy `schema.sql` bản cũ |
| `supabase/students.sql` | Danh sách học sinh (nằm trong `.gitignore`, chỉ có trên máy tạo) |
| `img/`, `intro.webp`, `intro-pc.webp` | Hình minh hoạ và ảnh nền (dọc 1080×1920, ngang 1920×1080) |

Web tĩnh, không cần build, chạy trực tiếp bằng cách mở `index.html` hoặc dùng GitHub Pages.

## Thiết lập lưu dữ liệu (Supabase)
1. Tạo project Supabase, chạy toàn bộ `supabase/schema.sql` trong SQL Editor.
2. Thêm danh sách học sinh: chạy `supabase/students.sql` (file này chứa tên thật nên nằm trong `.gitignore`, không đưa lên GitHub). Cú pháp: `insert into public.students (full_name) values ('Nguyen Van A'), ...;`
3. Điền `SUPABASE_URL` và `SUPABASE_ANON_KEY` vào `config.js`. Chỉ dùng anon key, **không** dùng `service_role key`.

Cơ chế: các bảng bị khoá bằng RLS; trình duyệt chỉ gọi được ba hàm `login(p_name)`, `save_result(...)` và `my_best(p_token)`. Tên được chuẩn hoá (bỏ dấu, không phân biệt hoa thường) trước khi so khớp. Đăng nhập chỉ bằng họ tên nên phù hợp để theo dõi học tập, không phải bảo mật cao.

Xem kết quả (SQL Editor):
```sql
select s.full_name, r.lesson_id, r.score, r.stars, r.first_try, r.total, r.created_at
from public.results r join public.students s on s.id = r.student_id
order by r.created_at desc;
```

## Triển khai
GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root. Mỗi lần `git push` lên `main`, trang tự cập nhật.

## Lưu ý dữ liệu trẻ em
Chỉ lưu họ tên, điểm và số sao. Cần xin phép nhà trường và phụ huynh trước khi dùng thật. Họ tên trong danh sách không được trùng nhau.
