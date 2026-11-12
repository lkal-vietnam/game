# Hướng dẫn thiết kế NPC

Tài liệu này dành cho người thiết kế nhân vật phụ (NPC) cho game: các tu sĩ, thương nhân, sư phụ, kẻ thù mà người chơi gặp trong mỗi kiếp. Không cần biết lập trình. Mỗi NPC là một khối chữ viết theo khuôn ở mục 4; gửi lại cho người quản lý dự án để đưa vào game.

## 1. Game là gì

- **Thể loại:** tu tiên pha hiện đại. Linh khí quay trở lại giữa thời đại có tàu điện, điện thoại, nhà cao tầng.
- **Ba con đường tu luyện:** tu tiên (hấp thụ linh khí, dùng pháp thuật), dị năng (thức tỉnh năng lực riêng nhờ dị hạch), thể tu (rèn thân thể).
- **Người chơi** sống từng kiếp. Mỗi kiếp sinh ra là một phàm nhân 12 tuổi ở một nơi ngẫu nhiên, tu luyện, đi khắp thế giới tìm kỳ ngộ, kết giao, gây thù, rồi hết thọ hoặc bỏ mạng và luân hồi sang kiếp mới.
- **Thế giới:** Thiên Nam Đại Lục gồm năm quốc gia liền nhau, quanh đó là các đảo. Danh sách địa danh ở mục 7.
- **Từ ngữ:** dùng "pháp thuật", không dùng "phép". Tiền tệ là "linh thạch". Quái vật là "dị thú". Người chơi được gọi là "ngươi".

## 2. NPC trong game hiện nay và hướng sắp tới

**Hiện đã có trong game:**

- Trên đường xa, người chơi có thể gặp một tu sĩ lạ (tên tự sinh ngẫu nhiên) và chọn: kết giao, ra tay cướp đoạt, hoặc bỏ qua.
- Kết giao thành công thì người đó thành **đạo hữu**: được chỉ điểm, lần sau gặp lại được tặng linh thạch.
- Đánh nhau thì người đó thành **kẻ thù**: có thể phục kích người chơi sau này, đôi khi kéo theo đồng bọn.
- Chiến đấu theo lượt, một mình người chơi đấu với một tới bốn kẻ địch.

**Sắp làm, và là lý do cần tài liệu này:** thay các tu sĩ tên ngẫu nhiên bằng những NPC có tên tuổi, tính cách, câu chuyện riêng. Mục tiêu là NPC "có đủ mọi thứ như một người chơi": cảnh giới, tuổi, nơi ở, thế lực, mục tiêu, và quan hệ với người chơi thay đổi theo sự kiện (kết đạo, bái sư, giao dịch, thù oán).

Trong khuôn ở mục 4, mục nào ghi **(dùng ngay)** là game đưa vào được ngay khi nhận file; mục ghi **(để dành)** là thông tin game sẽ dùng khi làm tới tính năng đó. Cứ điền đủ, càng chi tiết càng tốt.

## 3. Một NPC tốt cần gì

- **Một nét dễ nhớ.** Ngoại hình, thói quen hoặc câu cửa miệng mà đọc một lần là nhớ.
- **Một điều họ muốn.** Mục tiêu rõ ràng thì mới sinh ra chuyện: báo thù, tìm thuốc cứu người thân, gom đủ linh thạch để đột phá, giữ một bí mật.
- **Lý do để người chơi quan tâm.** Họ dạy được gì, bán gì, cản đường thế nào, hoặc biết điều gì.
- **Hợp với nơi họ sống.** Tu sĩ ở Bắc Băng Quốc khác với thương nhân ở Tây Mạc Quốc.
- **Không tuyệt đối tốt hay xấu.** Kẻ thù có lý do, ân nhân có giá phải trả.
- **Tự sáng tác.** Không lấy tên, ngoại hình, tình tiết của nhân vật trong truyện, phim, game khác.

Nên thiết kế NPC theo cụm: một sư phụ và vài đồ đệ, hai kẻ thù truyền kiếp, một thế gia ba đời. Quan hệ giữa các NPC làm thế giới sống hơn nhiều so với từng người đứng riêng.

## 4. Khuôn của một NPC

```json
{
  "id": "macThietTam",
  "name": "Mạc Thiết Tâm",
  "title": "Thiết Chưởng",
  "gender": "nam",
  "age": 58,
  "path": "theTu",
  "tier": 2,
  "stage": 1,
  "linhCan": null,
  "ability": null,
  "origin": "Con một người thợ rèn ở Thành Vinh, mồ côi năm mười tuổi.",
  "faction": "Võ quán Tây Sơn",
  "home": "taySon",
  "roams": ["vinh", "hacThuy"],
  "personality": ["trongNghia", "nongNay"],
  "goal": "Tìm truyền nhân trước khi hết thọ.",
  "attitude": "trungLap",
  "description": "Lão già thấp đậm, hai bàn tay chai như đá, lúc nào cũng xắn tay áo. Nói ít, hay khịt mũi trước khi trả lời.",
  "lines": {
    "meet": "Nhóc con, đứng tấn còn chưa vững mà dám bước vào sân này?",
    "friend": "Lại là ngươi. Vào đây, hôm nay ta rảnh.",
    "enemy": "Ta đã nói rồi: đừng để ta gặp lại.",
    "win": "Về luyện thêm mười năm nữa.",
    "lose": "Khá. Khá lắm."
  },
  "roles": ["suPhu", "doiThu"],
  "teaches": {
    "what": "Thiết Chưởng Công: Sức mạnh +2, Thể chất +2",
    "requires": "Thể chất từ 8 trở lên, đã kết giao, và thắng lão một trận tỉ thí"
  },
  "sells": null,
  "relations": [
    { "with": "khucCoVan", "type": "thu", "note": "Sư đệ cũ, phản bội võ quán ba mươi năm trước." }
  ],
  "combatStyle": "thu",
  "loot": "Một cuốn quyền phổ rách và 60 linh thạch.",
  "secret": "Vết thương cũ ở vai trái: ai biết mà đánh vào đó thì lão thua nhanh.",
  "storyHooks": [
    "Nhờ người chơi mang thư tới Ải Cửa Lò cho một người không rõ tên.",
    "Nếu người chơi kết giao với Khúc Cô Vân, lão sẽ trở mặt."
  ]
}
```

## 5. Ý nghĩa từng mục

| Mục | Bắt buộc | Dùng | Ý nghĩa |
| --- | --- | --- | --- |
| `id` | Có | dùng ngay | Tên riêng viết liền không dấu, không trùng với NPC khác |
| `name` | Có | dùng ngay | Họ tên hiện trong game |
| `title` | Không | dùng ngay | Danh hiệu, biệt hiệu |
| `gender` | Có | dùng ngay | `nam` hoặc `nu` |
| `age` | Có | để dành | Tuổi lúc người chơi gặp. Phải hợp với thọ nguyên của cảnh giới (mục 6) |
| `path` | Có | dùng ngay | Nhánh tu luyện: `tuTien`, `theTu`, `diNang`. Phàm nhân không tu luyện thì ghi `null` |
| `tier` | Có | dùng ngay | Bậc cảnh giới 0-5 (mục 6). Quyết định sức mạnh khi giao đấu |
| `stage` | Có | để dành | Giai đoạn: 0 sơ kỳ, 1 trung kỳ, 2 hậu kỳ |
| `linhCan` | Không | để dành | Chỉ cho người tu tiên, ví dụ `"Song linh căn: Hỏa, Thổ"` |
| `ability` | Không | để dành | Chỉ cho dị năng giả, ví dụ `"Hệ Băng, phẩm chất S"` |
| `origin` | Có | để dành | Xuất thân, một câu |
| `faction` | Có | để dành | Thế lực họ thuộc về (mục 9), hoặc `"Tán tu"` nếu không thuộc đâu |
| `home` | Có | dùng ngay | Mã địa danh nơi họ thường ở (mục 7) |
| `roams` | Không | dùng ngay | Các mã địa danh khác có thể gặp họ |
| `personality` | Có | dùng ngay | 1 tới 3 nét tính cách, chọn trong bảng ở mục 8 |
| `goal` | Có | để dành | Điều họ đang theo đuổi |
| `attitude` | Có | dùng ngay | Thái độ ban đầu với người lạ: `thanThien`, `trungLap`, `thuDich` |
| `description` | Có | dùng ngay | 2-3 câu: ngoại hình và một thói quen dễ nhớ |
| `lines` | Có | dùng ngay | Câu nói trong năm tình huống: `meet` (lần đầu gặp), `friend` (đã là đạo hữu), `enemy` (đã là kẻ thù), `win` (họ thắng), `lose` (họ thua) |
| `roles` | Có | để dành | Vai trò với người chơi, chọn trong bảng ở mục 8 |
| `teaches` | Nếu là sư phụ | để dành | Dạy gì (`what`) và điều kiện để được nhận (`requires`) |
| `sells` | Nếu là thương nhân | để dành | Danh sách món bán kèm giá linh thạch |
| `relations` | Không | để dành | Quan hệ với NPC khác: `with` là `id` của người kia, `type` chọn trong bảng ở mục 8, `note` giải thích |
| `combatStyle` | Có | để dành | Lối đánh: `cong` (thiên về tấn công), `thu` (phòng thủ, lì đòn), `toc` (nhanh, khó trúng), `muu` (dùng mẹo, độc, bẫy) |
| `loot` | Không | để dành | Thứ để lại khi bị hạ |
| `secret` | Không | để dành | Điều họ giấu. Người chơi biết được thì có lợi thế |
| `storyHooks` | Không | để dành | Những chuyện có thể xảy ra giữa họ và người chơi, mỗi ý một câu |

## 6. Cảnh giới và thọ nguyên

| Bậc (`tier`) | Tu tiên | Thể tu | Dị năng | Thọ nguyên |
| --- | --- | --- | --- | --- |
| 0 | Phàm Nhân | Phàm Nhân | Phàm Nhân | 80 |
| 1 | Luyện Khí | Luyện Bì | Thức Tỉnh | 100 |
| 2 | Trúc Cơ | Luyện Nhục | Ngưng Hạch | 200 |
| 3 | Kim Đan | Đoán Cốt | Hóa Hình | 500 |
| 4 | Nguyên Anh | Dịch Cân | Lĩnh Vực | 1.000 |
| 5 | Hóa Thần | Tẩy Tủy | Pháp Tắc | 2.000 |

- Bậc càng cao càng hiếm. Gợi ý tỉ lệ khi thiết kế một nhóm NPC: phàm nhân và bậc 1 chiếm khoảng 60%, bậc 2 khoảng 25%, bậc 3 khoảng 10%, bậc 4-5 khoảng 5%.
- NPC bậc cao nên ở nơi nguy hiểm cao hoặc là nhân vật lớn của một thế lực (tông chủ, thành chủ, lão tổ thế gia).
- Người chơi mới chỉ là phàm nhân, nên cần nhiều NPC bậc 0-1 để gặp ở đầu mỗi kiếp.

## 7. Địa danh

Cột "Nguy hiểm" là bậc cảnh giới nên có để tới đó an toàn. NPC sống ở đâu thì nên có bậc ít nhất bằng mức nguy hiểm của nơi đó (trừ khi họ được ai che chở, và khi đó nên ghi rõ trong `origin`).

**Lạc Việt Quốc**

| Mã | Tên | Loại | Nguy hiểm |
| --- | --- | --- | --- |
| `hangMay` | Ngõ Hàng Mây | Nhà | 0 |
| `dongXuan` | Chợ đêm Đồng Xuân | Phường thị | 0 |
| `longBien` | Ga Long Biên | Ga tàu | 0 |
| `tinhTam` | Hồ Tịnh Tâm | Linh mạch | 0 |
| `bachMa` | Tháp Bạch Mã | Hiệp hội dị năng | 0 |
| `taySon` | Võ quán Tây Sơn | Võ quán | 0 |
| `hacThuy` | Khu xưởng Hắc Thủy | Vùng dị thú | 1 |
| `yenTu` | Đạo quán Yên Tử | Tông môn | 0 |
| `cucPhuong` | Rừng Cúc Phương | Vùng dị thú | 1 |
| `phongNha` | Động Phong Nha | Bí cảnh | 2 |
| `benHaLong` | Ải Hạ Long | Quan ải | 0 |
| `cangHaiVan` | Ải Hải Vân | Quan ải | 0 |
| `benCuaLo` | Ải Cửa Lò | Quan ải | 0 |
| `muiCaMau` | Ải Cà Mau | Quan ải | 0 |
| `vinh` | Thành Vinh | Thành thị | 0 |
| `hue` | Cố thành Huế | Thành thị | 0 |

**Bắc Băng Quốc**

| Mã | Tên | Loại | Nguy hiểm |
| --- | --- | --- | --- |
| `langSon` | Băng thành Lạng Sơn | Thành thị | 1 |
| `dienBien` | Thành Điện Biên | Thành thị | 2 |
| `cuaOng` | Cảng Cửa Ông | Bến thuyền | 2 |
| `benBangHa` | Ải Băng Hà | Quan ải | 1 |
| `saPa` | Làng Sa Pa | Thôn làng | 1 |
| `phanXiPang` | Đỉnh Phan Xi Păng | Tông môn | 2 |
| `mauSon` | Băng cung Mẫu Sơn | Bí cảnh | 3 |
| `baBe` | Hồ Ba Bể | Linh mạch | 2 |

**Tây Mạc Quốc**

| Mã | Tên | Loại | Nguy hiểm |
| --- | --- | --- | --- |
| `ninhThuan` | Sa đô Ninh Thuận | Thành thị | 1 |
| `tuyHoa` | Thành Tuy Hòa | Thành thị | 2 |
| `muiNe` | Ải Mũi Né | Quan ải | 1 |
| `phanRang` | Ốc đảo Phan Rang | Phường thị | 1 |
| `poNagar` | Tháp cổ Pô Na Ga | Di tích | 2 |
| `saTrung` | Sào huyệt Sa Trùng | Vùng dị thú | 3 |
| `catVang` | Bí cảnh Cát Vàng | Bí cảnh | 4 |

**Quần đảo Đông Hải**

| Mã | Tên | Loại | Nguy hiểm |
| --- | --- | --- | --- |
| `benCatBa` | Bến Cát Bà | Bến thuyền | 1 |
| `thienCung` | Động Thiên Cung | Bí cảnh | 2 |
| `langLySon` | Làng chài Lý Sơn | Bến thuyền | 1 |
| `thoiLoi` | Miệng núi Thới Lới | Linh mạch | 2 |
| `anThoi` | Cảng An Thới | Bến thuyền | 1 |
| `hamNinh` | Rừng Hàm Ninh | Vùng dị thú | 3 |
| `conLon` | Ngục Côn Lôn | Di tích | 4 |

**Nam Hoang Quốc**

| Mã | Tên | Loại | Nguy hiểm |
| --- | --- | --- | --- |
| `canTho` | Thành Cần Thơ | Thành thị | 2 |
| `baoLoc` | Thành Bảo Lộc | Thành thị | 2 |
| `haTien` | Cảng Hà Tiên | Bến thuyền | 2 |
| `rachGia` | Ải Rạch Giá | Quan ải | 2 |
| `uMinh` | Làng U Minh | Thôn làng | 2 |
| `rungTram` | Rừng tràm U Minh Hạ | Vùng dị thú | 3 |
| `chuDangYa` | Hỏa sơn Chư Đăng Ya | Linh mạch | 4 |
| `sonDoong` | Hang Sơn Đoòng | Bí cảnh | 5 |

**Đông Sơn Quốc**

| Mã | Tên | Loại | Nguy hiểm |
| --- | --- | --- | --- |
| `haiPhong` | Thành Hải Phòng | Thành thị | 1 |
| `thanhHoa` | Thành Thanh Hóa | Thành thị | 2 |
| `doSon` | Cảng Đồ Sơn | Bến thuyền | 2 |
| `vanDon` | Ải Vân Đồn | Quan ải | 1 |
| `hoaLu` | Cố đô Hoa Lư | Thành thị | 1 |
| `mocChau` | Làng Mộc Châu | Thôn làng | 1 |
| `tamDao` | Kiếm các Tam Đảo | Tông môn | 3 |
| `nuiCoc` | Hồ Núi Cốc | Linh mạch | 2 |
| `baiDinh` | Cổ tự Bái Đính | Di tích | 3 |
| `trangAn` | Bí cảnh Tràng An | Bí cảnh | 4 |
| `samSon` | Bến Sầm Sơn | Bến thuyền | 2 |

**Xích Diệm Đảo**

| Mã | Tên | Loại | Nguy hiểm |
| --- | --- | --- | --- |
| `honKhoi` | Bến Hòn Khói | Bến thuyền | 3 |
| `cuLao` | Làng Cù Lao | Thôn làng | 3 |
| `batTrang` | Lò rèn Bát Tràng | Phường thị | 3 |
| `baDen` | Núi Bà Đen | Vùng dị thú | 4 |
| `chuProng` | Hỏa ngục Chư Prông | Bí cảnh | 5 |

**Đảo lẻ**

| Mã | Tên | Loại | Nguy hiểm |
| --- | --- | --- | --- |
| `bachLongVi` | Hải đăng Bạch Long Vĩ | Bến thuyền | 2 |
| `honTre` | Thủy trại Hòn Tre | Bến thuyền | 3 |
## 8. Các bảng lựa chọn

**Tính cách (`personality`)**, ảnh hưởng tới cách NPC phản ứng:

| Mã | Tính cách | Trong game sẽ thể hiện |
| --- | --- | --- |
| `trongNghia` | Trọng nghĩa | Đã là đạo hữu thì giúp tới cùng; ghét kẻ phản bội |
| `hiepNghia` | Hiệp nghĩa | Bênh kẻ yếu, dễ kết giao nếu người chơi làm việc tốt |
| `haoSang` | Hào sảng | Dễ kết giao, hay tặng quà |
| `thamLam` | Tham lam | Kết giao được bằng linh thạch; thấy người chơi giàu thì nảy lòng tham |
| `daNghi` | Đa nghi | Khó kết giao, dễ trở mặt |
| `nongNay` | Nóng nảy | Dễ gây sự, đánh xong lại dễ thành bạn |
| `lanhLung` | Lạnh lùng | Ít nói, không chủ động giúp, cũng không chủ động hại |
| `xaoQuyet` | Xảo quyệt | Lời nói không đáng tin, hay giăng bẫy |
| `hieuChien` | Hiếu chiến | Gặp là thách đấu, tôn trọng kẻ mạnh |
| `anDat` | Ẩn dật | Khó gặp, không thích bị làm phiền |
| `thuDai` | Thù dai | Đã thù thì đuổi tới cùng, kéo cả đồng bọn |
| `nhanTu` | Nhân từ | Cứu chữa người bị thương, không giết kẻ thua |
| `kieuNgao` | Kiêu ngạo | Coi thường kẻ cảnh giới thấp |
| `nhatGan` | Nhát gan | Thấy bất lợi là bỏ chạy |

**Vai trò (`roles`):**

| Mã | Vai trò | Cần điền thêm |
| --- | --- | --- |
| `suPhu` | Sư phụ, nhận đồ đệ | `teaches` |
| `thuongNhan` | Thương nhân | `sells` |
| `doiThu` | Đối thủ để tỉ thí hoặc tranh đoạt | |
| `daoHuu` | Bạn đồng hành tiềm năng | |
| `daoLu` | Có thể kết thành đạo lữ | |
| `giaoViec` | Giao nhiệm vụ | `storyHooks` |
| `anNhan` | Ân nhân, cứu giúp lúc nguy | |
| `phanDien` | Phản diện lớn của một vùng | `goal`, `secret` |
| `danThuong` | Phàm nhân bình thường: chủ quán, lái đò, lính gác | |

**Quan hệ giữa các NPC (`relations.type`):**

| Mã | Quan hệ |
| --- | --- |
| `suDo` | Sư phụ và đồ đệ |
| `dongMon` | Đồng môn |
| `giaDinh` | Người nhà |
| `daoLu` | Đạo lữ |
| `ban` | Bạn bè, đạo hữu |
| `thu` | Thù oán |
| `chuTo` | Chủ và thuộc hạ |
| `doiThu` | Kình địch, tranh đua |

## 9. Thế lực

Mỗi NPC thuộc một thế lực hoặc là tán tu. Dưới đây là các thế lực đã có chỗ trên bản đồ. Người thiết kế được đặt thêm thế lực mới, miễn là gắn với một địa danh ở mục 7 và mô tả theo mẫu ở cuối mục này.

| Thế lực | Trụ sở | Con đường | Ghi chú |
| --- | --- | --- | --- |
| Đạo quán Yên Tử | `yenTu` | Tu tiên | Tông môn lớn nhất Lạc Việt Quốc |
| Hiệp hội dị năng Bạch Mã | `bachMa` | Dị năng | Tổ chức hiện đại, có sổ sách, có trợ cấp |
| Võ quán Tây Sơn | `taySon` | Thể tu | Trọng thực chiến |
| Kiếm tông Phan Xi Păng | `phanXiPang` | Tu tiên | Kiếm tu vùng băng tuyết |
| Kiếm các Tam Đảo | `tamDao` | Tu tiên | Ba ngọn núi, ba mạch kiếm; không nhận kẻ yếu |
| Lò rèn Bát Tràng | `batTrang` | Thể tu và luyện khí cụ | Rèn pháp bảo bằng lửa địa tâm |
| Thủy trại Hòn Tre | `honTre` | Hỗn tạp | Hải tặc; ai có linh thạch đều là khách |
| Triều đình của năm nước | Các kinh đô | Hỗn tạp | Lạc Thành, Băng thành Lạng Sơn, Sa đô Ninh Thuận, Thành Cần Thơ, Cố đô Hoa Lư |

Mẫu mô tả một thế lực mới:

```json
{
  "id": "daoQuanYenTu",
  "name": "Đạo quán Yên Tử",
  "base": "yenTu",
  "path": "tuTien",
  "stance": "chinhDao",
  "description": "Đạo quán nghìn năm trên đỉnh núi. Nhận đồ đệ mỗi mười năm một lần, chỉ xét linh căn.",
  "leader": "id của NPC đứng đầu",
  "rivals": ["id của thế lực đối địch"]
}
```

`stance` chọn một trong: `chinhDao` (chính đạo), `maDao` (ma đạo), `taDao` (tà đạo), `trungLap` (không theo phe nào).

## 10. Chọn con số cho cân bằng

- Sáu chỉ số của nhân vật: Thể chất, Sức mạnh, Thân pháp, Linh lực, Thần thức, Ngộ tính. Người chơi mới có mỗi chỉ số bằng 5; lên một giai đoạn được cộng 1-3 điểm vào chỉ số của nhánh mình.
- Thứ sư phụ dạy (`teaches`) nên cộng tổng cộng 2-4 điểm chỉ số, hoặc một kỹ năng dùng trong trận. Điều kiện nhận đồ đệ nên đòi một chỉ số, một mối quan hệ, hoặc một việc phải làm.
- Linh thạch: mỗi kiếp bắt đầu với khoảng 30; làm thuê được 12 mỗi năm; đột phá lên Trúc Cơ cần 100, lên Kim Đan cần 400. Giá hàng của thương nhân nên nằm trong khoảng 10-500.
- `loot` của NPC bậc 0-1 nên dưới 80 linh thạch; bậc 2-3 từ 100 tới 500.

## 11. Trước khi gửi

- [ ] `id` không trùng, không dấu, không khoảng trắng.
- [ ] `home` và `roams` dùng đúng mã địa danh ở mục 7.
- [ ] `tier` hợp với mức nguy hiểm của nơi ở, và `age` không vượt thọ nguyên của bậc đó.
- [ ] `personality`, `roles`, `attitude`, `combatStyle`, `relations.type` dùng đúng mã trong các bảng.
- [ ] Đủ năm câu trong `lines`, mỗi câu một tới hai câu ngắn, đúng giọng của nhân vật.
- [ ] Mọi `id` nhắc tới trong `relations` đều là NPC có trong cùng bộ gửi lên.
- [ ] Sư phụ có `teaches`, thương nhân có `sells`.
- [ ] Dấu ngoặc kép trong lời văn viết là `\"`.

Gom các NPC vào một file tên `npcs.json`, đặt trong cặp ngoặc vuông `[ ... ]`, các khối cách nhau bằng dấu phẩy. Thế lực mới gom vào file `factions.json` theo cách tương tự.
