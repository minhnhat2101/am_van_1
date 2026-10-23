// Cấu hình Supabase. anon key là khoá công khai, được phép nằm ở đây.
// KHÔNG dán service_role key vào file này.
window.SUPABASE_URL = "https://suslquqzlmptkqbvpira.supabase.co";

// Cây ngôi sao (issue 002): số sao cần bón để cây lên 1 stage. Nhập số nguyên >= 1.
// Phải khớp với hằng số tương ứng trong supabase/garden.sql.
window.GARDEN_STARS_PER_STAGE = 1; // TODO: nhập giá trị

window.SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1c2xxdXF6bG1wdGtxYnZwaXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NDIzNjksImV4cCI6MjEwODMxODM2OX0.g1FeAgy31aLz8xpqiRms2Hi50dIFpQDAqJliXpRen5w";
