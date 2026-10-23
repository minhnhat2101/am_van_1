/* Dữ liệu bài tập – chép từ "CÔ ÁNH – BT PHÂN BIỆT CHÍNH TẢ".
   Thêm bài mới: copy một khối trong LESSONS và sửa lại (id mới không trùng id cũ).
   week: số tuần học mà bài thuộc về (lịch tuần cấu hình ở SCHOOL_YEAR trong config.js).

   Câu điền chỗ trống (kind:"fill"):
     t   : chuỗi có dấu "_" tại mỗi chỗ trống
     a   : mảng đáp án, mỗi phần tử ứng với một "_" theo thứ tự
     o   : các lựa chọn hiển thị
     img : ảnh minh họa (không bắt buộc)
     big : true nếu là câu dài (hiện lựa chọn là từ)
   Chọn từ viết đúng (kind:"pick"): o = [đáp án đúng, từ sai], img tùy chọn
   Sắp xếp câu (kind:"order"): tokens = các mảnh câu, a = câu hoàn chỉnh */
var LESSONS = [
  {
    id: 1, week: 7, title: "c hoặc k", pair: ["c", "k"],
    q: [
      { kind: "fill", img: "s1_a1", t: "con _ua", a: ["c"] },
      { kind: "fill", img: "s1_a2", t: "cái _éo", a: ["k"] },
      { kind: "fill", img: "s1_a3", t: "_á heo", a: ["c"] },
      { kind: "fill", img: "s1_a4", t: "_ính cận", a: ["k"] },
      { kind: "fill", img: "s1_a5", t: "_ửa hàng", a: ["c"] },
      { kind: "fill", img: "s1_a6", t: "_ẹo mút", a: ["k"] },
      { kind: "fill", img: "s1_a7", t: "que _em", a: ["k"] },
      { kind: "fill", img: "s1_a8", t: "_úp vàng", a: ["c"] },
      { kind: "pick", img: "s1_b1", o: ["cụ già", "kụ già"] },
      { kind: "pick", o: ["cột điện", "kột điện"] },
      { kind: "pick", o: ["máy cày", "máy kày"] },
      { kind: "pick", img: "s1_b2", o: ["cào cào", "kào kào"] },
      { kind: "fill", big: true, t: "Bé Hà bị _ thị.", a: ["cận"], o: ["cận", "kận"] },
      { kind: "fill", big: true, t: "Ngày Tết, mẹ muối rất nhiều củ _.", a: ["kiệu"], o: ["kiệu", "ciệu"] },
      { kind: "fill", big: true, t: "Chị cho bé một chiếc vòng hạt _.", a: ["cườm"], o: ["cườm", "kườm"] }
    ]
  },
  {
    id: 2, week: 7, title: "c hoặc k", pair: ["c", "k"],
    q: [
      { kind: "fill", img: "s2_a1", t: "_im _ương", a: ["k", "c"] },
      { kind: "fill", img: "s2_a2", t: "_ánh _ổng", a: ["c", "c"] },
      { kind: "fill", img: "s2_a3", t: "_ền _ền", a: ["k", "k"] },
      { kind: "fill", img: "s2_a4", t: "_õng bé", a: ["c"] },
      { kind: "fill", img: "s2_a5", t: "_ẹp tóc", a: ["k"] },
      { kind: "fill", img: "s2_a6", t: "hài _ịch", a: ["k"] },
      { kind: "fill", img: "s2_a7", t: "cái _ìm", a: ["k"] },
      { kind: "fill", img: "s2_a8", t: "con _óc", a: ["c"] },
      { kind: "pick", img: "s2_b1", o: ["con cáo", "con káo"] },
      { kind: "pick", o: ["cung điện", "kung điện"] },
      { kind: "pick", o: ["dòng kênh", "dòng cênh"] },
      { kind: "pick", img: "s2_b2", o: ["thanh kiếm", "thanh ciếm"] },
      { kind: "order", tokens: ["cảm cúm.", "Bé Thu", "bị"], a: "Bé Thu bị cảm cúm." },
      { kind: "order", tokens: ["mua", "Mẹ", "que kem.", "bé", "cho"], a: "Mẹ mua cho bé que kem." }
    ]
  },
  {
    id: 3, week: 7, title: "g hoặc gh", pair: ["g", "gh"],
    q: [
      { kind: "fill", img: "s3_a1", t: "_à mái", a: ["g"] },
      { kind: "fill", img: "s3_a2", t: "_i chép", a: ["gh"] },
      { kind: "fill", img: "s3_a3", t: "_õ cửa", a: ["g"] },
      { kind: "fill", img: "s3_a4", t: "con _ấu", a: ["g"] },
      { kind: "fill", img: "s3_a5", t: "đinh _im", a: ["gh"] },
      { kind: "fill", img: "s3_a6", t: "_ốc cây", a: ["g"] },
      { kind: "fill", img: "s3_a7", t: "bé _ái", a: ["g"] },
      { kind: "fill", img: "s3_a8", t: "_ế nệm", a: ["gh"] },
      { kind: "pick", img: "s3_b1", o: ["gặm nhấm", "ghặm nhấm"] },
      { kind: "pick", o: ["gói ghém", "gói gém"] },
      { kind: "pick", o: ["gồ ghề", "gồ gề"] },
      { kind: "pick", img: "s3_b2", o: ["gớm ghiếc", "gớm giếc"] },
      { kind: "fill", big: true, t: "Cơn bão đã làm cây cối bị _ đổ.", a: ["gãy"], o: ["gãy", "ghãy"] },
      { kind: "fill", big: true, t: "Con đường này rất _.", a: ["gồ ghề"], o: ["gồ ghề", "gồ gề"] },
      { kind: "fill", big: true, t: "Bé ra bưu điện _ thư cho bà.", a: ["gửi"], o: ["gửi", "ghửi"] }
    ]
  },
  {
    id: 4, week: 7, title: "g hoặc gh", pair: ["g", "gh"],
    q: [
      { kind: "fill", img: "s4_a1", t: "_ào khóc", a: ["g"] },
      { kind: "fill", img: "s4_a2", t: "_é thăm", a: ["gh"] },
      { kind: "fill", img: "s4_a3", t: "_ẹ đỏ", a: ["gh"] },
      { kind: "fill", img: "s4_a4", t: "_ội đầu", a: ["g"] },
      { kind: "fill", img: "s4_a5", t: "_ầm bàn", a: ["g"] },
      { kind: "fill", img: "s4_a6", t: "_e thuyền", a: ["gh"] },
      { kind: "fill", img: "s4_a7", t: "_en tị", a: ["gh"] },
      { kind: "fill", img: "s4_a8", t: "_áo nước", a: ["g"] },
      { kind: "pick", img: "s4_b1", o: ["gọi điện", "ghọi điện"] },
      { kind: "pick", o: ["gần gũi", "gần ghũi"] },
      { kind: "pick", o: ["gập ghềnh", "ghập ghềnh"] },
      { kind: "pick", img: "s4_b2", o: ["gõ trống", "ghõ trống"] },
      { kind: "order", tokens: ["gáy", "Chú", "vang.", "gà trống"], a: "Chú gà trống gáy vang." },
      { kind: "order", tokens: ["học sinh", "cẩn thận.", "bài", "Các bạn", "ghi chép"], a: "Các bạn học sinh ghi chép bài cẩn thận." }
    ]
  },
  {
    id: 5, week: 7, title: "ng hoặc ngh", pair: ["ng", "ngh"],
    q: [
      { kind: "fill", img: "s5_a1", t: "_ồi bệt", a: ["ng"] },
      { kind: "fill", img: "s5_a2", t: "củ _ệ", a: ["ngh"] },
      { kind: "fill", img: "s5_a3", t: "bắp _ô", a: ["ng"] },
      { kind: "fill", img: "s5_a4", t: "suy _ĩ", a: ["ngh"] },
      { kind: "fill", img: "s5_a5", t: "tháp _iêng", a: ["ngh"] },
      { kind: "fill", img: "s5_a6", t: "_ã ngửa", a: ["ng"] },
      { kind: "fill", img: "s5_a7", t: "_e nhạc", a: ["ngh"] },
      { kind: "fill", img: "s5_a8", t: "_ăn kéo", a: ["ng"] },
      { kind: "pick", img: "s5_b1", o: ["cưỡi ngựa", "cưỡi nghựa"] },
      { kind: "pick", o: ["chìm nghỉm", "chìm ngỉm"] },
      { kind: "pick", o: ["rau ngót", "rau nghót"] },
      { kind: "pick", img: "s5_b2", o: ["cá ngừ", "cá nghừ"] },
      { kind: "fill", big: true, t: "Bọn trẻ _ im nghe bà kể chuyện.", a: ["ngồi"], o: ["ngồi", "nghồi"] },
      { kind: "fill", big: true, t: "Đi qua _ tư là về tới nhà của Nga.", a: ["ngã"], o: ["ngã", "nghã"] },
      { kind: "fill", big: true, t: "Hoa bưởi toả hương thơm _.", a: ["ngát"], o: ["ngát", "nghát"] }
    ]
  },
  {
    id: 6, week: 7, title: "ng hoặc ngh", pair: ["ng", "ngh"],
    q: [
      { kind: "fill", img: "s6_a1", t: "ống _iệm", a: ["ngh"] },
      { kind: "fill", img: "s6_a2", t: "_ôi sao", a: ["ng"] },
      { kind: "fill", img: "s6_a3", t: "mắc _ẹn", a: ["ngh"] },
      { kind: "fill", img: "s6_a4", t: "_ân hàng", a: ["ng"] },
      { kind: "fill", img: "s6_a5", t: "_iên cứu", a: ["ngh"] },
      { kind: "fill", img: "s6_a6", t: "thiên _a", a: ["ng"] },
      { kind: "fill", img: "s6_a7", t: "_èo khổ", a: ["ngh"] },
      { kind: "fill", img: "s6_a8", t: "bí _ô", a: ["ng"] },
      { kind: "pick", img: "s6_b1", o: ["tai nghe", "tai nge"] },
      { kind: "pick", o: ["nghiền nát", "ngiền nát"] },
      { kind: "pick", o: ["nghề nghiệp", "ngề ngiệp"] },
      { kind: "pick", img: "s6_b2", o: ["ăn ngon", "ăn nghon"] },
      { kind: "order", tokens: ["bé", "hát ru", "Mẹ", "ngủ."], a: "Mẹ hát ru bé ngủ." },
      { kind: "order", tokens: ["đứng nghiêm.", "phải", "bé", "chào cờ", "Khi"], a: "Khi chào cờ bé phải đứng nghiêm." }
    ]
  }
];
