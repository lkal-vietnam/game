# Game Design Doc

Mục ghi **(đã chốt)** là điều chủ dự án đã quyết định; mục ghi **(đề xuất)** là gợi ý chờ duyệt.

## 1. Tổng quan (đã chốt)

| Hạng mục | Nội dung |
| --- | --- |
| Tên game | Chưa đặt |
| Thể loại | Tu luyện kết hợp khám phá, chiến đấu và giải đố |
| Bối cảnh | Tu tiên pha hiện đại, có dị năng và thể tu |
| Nền tảng | Trình duyệt điện thoại và máy tính |
| Người chơi | 1-2 người, chơi nội bộ |
| Hình ảnh | 2D, ưu tiên sự sống động qua chuyển động và hiệu ứng |
| Công nghệ | Phaser + TypeScript + Vite, phát hành qua GitHub Pages |
| Mục tiêu | Làm cho vui, không thương mại |

Quy ước dùng từ: dùng "pháp" (pháp thuật, sát thương pháp thuật), không dùng "phép".

## 2. Bối cảnh (đề xuất)

Thế giới hiện đại nơi linh khí bất ngờ quay trở lại. Giữa thành phố, con người bắt đầu thức tỉnh theo ba con đường: tu tiên, dị năng và thể tu. Phía trên Nhân giới còn có Linh giới và Tiên giới.

## 3. Hai tầng chơi (đã chốt)

Game có hai tầng chạy song song:

**Thế giới chính (bản thể)**

- Bản thể chọn nhánh chính một lần và giữ mãi. Không già, không chết.
- Bế quan theo thời gian thật, kể cả khi tắt game.
- Lối chơi đơn giản hơn: đánh quái, làm nhiệm vụ chính tuyến, đi theo một cốt truyện.
- Tiêu điểm luân hồi để mua đồ và lợi thế.

**Lịch luyện kiếp**

- Bản thể gửi hồn vào một kiếp khác. Mỗi kiếp quay mới linh căn, thiên phú, xuất thân.
- Kiếp sống trên bản đồ, có lịch ngày tháng năm. Lịch chỉ trôi khi làm việc gì đó (di chuyển, bế quan, khám phá); tắt game thì không trôi.
- Mỗi kiếp bắt đầu là **Phàm Nhân** 12 tuổi. Tùy xuất thân, tu vi Phàm Nhân có thể đã đầy sẵn.
- Đột phá thì thọ nguyên tăng và mở bản đồ cao hơn. Phần khám phá bản đồ chủ yếu nằm ở tầng này.
- Tu luyện trong kiếp phải khó: chỉ ngồi nhà bế quan thì tới 80-90 tuổi mới đủ tu vi để thử lên Trúc Cơ, xui thì hết thọ vẫn chưa lên được. Muốn nhanh phải đi tìm linh mạch, kỳ ngộ, công pháp, linh thạch.
- Đột phá bậc lớn có thể thất bại.
- **Càng lên cao càng khó:** ở bậc nào cũng vậy, chỉ ngồi nhà thì tích đủ tu vi cho bậc kế tiếp mất khoảng 85-90% thọ nguyên còn lại; tỉ lệ đột phá giảm dần; mỗi lần đột phá tốn linh thạch, thành hay bại đều mất.
- **Nơi sinh ngẫu nhiên:** mỗi kiếp sinh ra ở một nơi ngẫu nhiên trên thế giới (nhà, làng, chợ, bến), nơi càng nguy hiểm càng hiếm gặp. Khi đủ điểm luân hồi mới được chọn nơi sinh.
- **Mức nguy hiểm:** mọi nơi đều đi được, nhưng mỗi nơi có mức nguy hiểm so với bậc của mình (an toàn, ngang sức, nguy hiểm, tử địa). Nơi càng nguy hiểm càng dễ bị dị thú tập kích khi vừa tới, và sự kiện ở đó cũng khó thành hơn.
- Hết thọ hoặc chết trong bí cảnh thì kiếp kết thúc, hồn về bản thể và nhận điểm luân hồi.
- Bản thể ở giới nào thì các kiếp bắt đầu ở giới đó (bản thể lên Linh giới thì kiếp ở Linh giới).

**Cảm ngộ nối hai tầng:** mỗi lần một kiếp đột phá bậc lớn từ Luyện Khí trở lên (Phàm Nhân lên Luyện Khí không tính), bản thể nhận 1 cảm ngộ. Bản thể muốn đột phá bậc lớn phải tiêu 1 cảm ngộ.

## 4. Ba nhánh tu luyện (đã chốt)

- Người chơi chọn một nhánh chính khi tạo nhân vật.
- Hai nhánh còn lại vẫn tu được như nhánh phụ, tốc độ bằng một nửa, không giới hạn bậc.
- Mỗi nhánh có năng lượng riêng và tăng chỉ số khác nhau.

| Nhánh | Năng lượng | Tăng mạnh | Tăng nhẹ | Đặc tính khi là nhánh chính |
| --- | --- | --- | --- | --- |
| Tu tiên | Linh khí | Linh lực | Thần thức, Ngộ tính | Bế quan hiệu quả hơn 25%; pháp thuật đánh được nhiều mục tiêu |
| Thể tu | Khí huyết | Thể chất, Sức mạnh | Mọi chỉ số còn lại | Hồi máu mỗi lượt; khó bị khống chế; đòn thường không tốn năng lượng |
| Dị năng | Tinh thần lực | Thần thức | Thân pháp | Có một dị năng bản mệnh từ đầu (phẩm chất A trở lên), mạnh lên theo cảnh giới |

**Thể tu** là con đường của sự chăm chỉ: không phụ thuộc may rủi, mỗi giai đoạn cần 1,5 lần năng lượng so với hai nhánh kia nhưng tăng toàn diện. Khí huyết tăng cả khi chiến đấu.

## 5. Chỉ số nhân vật (đã chốt)

| Chỉ số | Ảnh hưởng |
| --- | --- |
| Thể chất | Máu, phòng thủ |
| Sức mạnh | Sát thương đòn vật lý |
| Thân pháp | Thứ tự ra đòn, né tránh |
| Linh lực | Sát thương pháp thuật, lượng linh lực tối đa |
| Thần thức | Sức mạnh dị năng, chí mạng, kháng hiệu ứng |
| Ngộ tính | Tốc độ tu luyện, tỉ lệ đột phá thành công |

Chỉ số ẩn **Khí vận**: tỉ lệ rơi đồ, phẩm chất dị hạch **(đề xuất)**.

## 6. Cảnh giới

Mỗi bậc chia ba giai đoạn: sơ kỳ, trung kỳ, hậu kỳ. Cùng số bậc thì sức mạnh tương đương giữa các nhánh. Lên giới mới là một lần phi thăng.

| Giới | Bậc | Tu tiên | Thể tu | Dị năng |
| --- | --- | --- | --- | --- |
| Nhân giới | 1 | Luyện Khí | Luyện Bì | Thức Tỉnh |
| | 2 | Trúc Cơ | Luyện Nhục | Ngưng Hạch |
| | 3 | Kim Đan | Đoán Cốt | Hóa Hình |
| | 4 | Nguyên Anh | Dịch Cân | Lĩnh Vực |
| | 5 | Hóa Thần | Tẩy Tủy | Pháp Tắc |
| Linh giới | 6 | Luyện Hư | Hoán Huyết | Chưởng Khống |
| | 7 | Hợp Thể | Kim Thân | Quy Nhất |
| | 8 | Đại Thừa | Bất Hoại | Siêu Phàm |
| | 9 | Độ Kiếp | Thánh Thể | Nhập Thánh |
| Tiên giới | 10 | Chân Tiên | Tiên Thể | Bán Thần |
| | 11 | Kim Tiên | Pháp Tướng | Chân Thần |
| | 12 | Thái Ất | Bất Diệt Thể | Thần Vương |
| | 13 | Đại La | Hỗn Độn Thể | Thần Hoàng |
| | 14 | Đạo Tổ | Bàn Cổ Chân Thân | Vĩnh Hằng |

## 7. Linh căn (đã chốt)

Mỗi nhân vật có linh căn, quay ngẫu nhiên khi tạo nhân vật và mỗi lần luân hồi. Ít hệ thì tu tiên nhanh; nhiều hệ thì chậm nhưng dùng được nhiều hệ pháp thuật.

| Linh căn | Tốc độ tu tiên | Số hệ | Tỉ lệ quay |
| --- | --- | --- | --- |
| Ngũ linh căn | ×0,6 | 5 | 30% |
| Tứ linh căn | ×0,8 | 4 | 28% |
| Tam linh căn | ×1,0 | 3 | 22% |
| Song linh căn | ×1,3 | 2 | 13% |
| Thiên linh căn | ×1,7 | 1 | 5% |
| Dị linh căn (Lôi, Băng, Phong) | ×1,7 | 1 hệ đặc biệt | 2% |

Tỉ lệ quay là con số tạm, sẽ chỉnh khi chơi thử.

## 8. Dị năng

- Mỗi người tối đa 5 dị năng **(đã chốt)**.
- Thức tỉnh dị năng mới cần năng lượng và một vật dẫn **(đã chốt)**. Vật dẫn là **dị hạch**, rơi từ dị thú hoặc tìm trong bí cảnh; hạch hệ nào ra dị năng hệ đó **(đề xuất)**.
- Ô dị năng mở dần theo cảnh giới; dị năng sau tốn nhiều năng lượng hơn; đủ 5 ô thì phải bỏ một cái cũ để lấy cái mới **(đề xuất)**.
- Mỗi dị năng có **phẩm chất** riêng, tách khỏi cảnh giới: cùng bậc, dị năng SSS mạnh hơn hẳn SS **(đã chốt ý tưởng, con số là đề xuất)**.

| Phẩm chất | Sức mạnh | Độ hiếm |
| --- | --- | --- |
| C | ×1,0 | Thường gặp |
| B | ×1,2 | Thường gặp |
| A | ×1,5 | Hiếm |
| S | ×2,0 | Rất hiếm |
| SS | ×2,6 | Cực hiếm |
| SSS | ×3,5 | Gần như độc nhất |

- Phẩm chất do dị hạch quyết định; nâng được bằng cách hấp thụ thêm hạch cùng hệ **(đề xuất)**.

## 9. Luân hồi và điểm luân hồi (đã chốt)

- Kiếp kết thúc khi hết thọ nguyên hoặc chết trong bí cảnh.
- Kiếp sau bắt đầu lại từ đầu và quay lại linh căn. Không mang theo vật phẩm, dị năng hay cảnh giới của kiếp trước.
- Thứ duy nhất mang về là **điểm luân hồi**, cộng theo lịch luyện của kiếp đó.
- Điểm luân hồi dùng để mua đồ ở thế giới chính và các hỗ trợ đầu kiếp: xuất thân, pháp bảo khởi đầu, linh thạch ban đầu, tăng xác suất ra linh căn hoặc thiên phú cao.
- **Linh thạch** là tiền tệ trong game.
- Thọ nguyên theo bậc của kiếp **(con số tạm)**: Phàm Nhân 80, Luyện Khí 100, Trúc Cơ 200, Kim Đan 500, Nguyên Anh 1.000, Hóa Thần 2.000 năm.
- Tỉ lệ đột phá bậc lớn **(con số tạm)**: Phàm Nhân lên Luyện Khí 70%, lên Trúc Cơ 40%, lên Kim Đan 30%, lên Nguyên Anh 22%, lên Hóa Thần 15%; mỗi điểm Ngộ tính trên 5 cộng 3%. Thất bại mất 30% tu vi và một năm dưỡng thương.
- Linh thạch cho mỗi lần đột phá **(con số tạm)**: lên Trúc Cơ 100, Kim Đan 400, Nguyên Anh 1.500, Hóa Thần 5.000.
- Kiếm linh thạch: sự kiện, hoặc làm thuê ở nơi có người ở (12 linh thạch mỗi năm). Sau này thêm săn dị thú.
- Xuất thân hiện quay ngẫu nhiên **(tạm, sau này mua bằng điểm luân hồi)**: con nhà thường dân, con cháu thế gia (tu vi Phàm Nhân đầy sẵn, thêm linh thạch), trẻ mồ côi đường phố (Thân pháp và Thể chất +1, không linh thạch), con nhà thư hương (Ngộ tính +2).
- Công thức điểm hiện tại **(tạm)**: 10 điểm mỗi giai đoạn đã vượt, cộng 1 điểm mỗi 10 năm đã sống.

## 10. Bản đồ lịch luyện

**Đã chốt:**

- Bản đồ rộng, các chấm là địa điểm cần đến. Di chuyển chỉ làm lịch trong game trôi, không phải chờ thời gian thật.
- Thành phố hư cấu **Lạc Thành**, địa danh mượn tên đẹp ở Việt Nam.
- Thế giới có một đại lục rõ ràng, **Thiên Nam Đại Lục**, gồm năm quốc gia liền nhau, mỗi nước có kinh đô và thành thị riêng. Quanh đại lục là các đảo.
- Trong đại lục đi đường bộ, qua các quan ải ở biên giới. Ra đảo phải đi thuyền từ các cảng.
- Phóng to thu nhỏ bằng hai ngón tay hoặc con lăn chuột. Nút "Toàn cảnh" thu nhỏ để thấy cả thế giới; khi nhìn xa, chạm vào đâu thì bay tới đó.
- Hiện có 64 địa danh.

| Quốc gia / đảo | Cảnh sắc | Thành thị | Địa danh khác |
| --- | --- | --- | --- |
| Lạc Việt Quốc (trung tâm) | Thành phố hiện đại, núi, rừng | Lạc Thành (kinh đô), Thành Vinh, Cố thành Huế | Đạo quán Yên Tử, Rừng Cúc Phương, Động Phong Nha, Khu xưởng Hắc Thủy, bốn quan ải |
| Bắc Băng Quốc (bắc) | Tuyết, núi băng | Băng thành Lạng Sơn (kinh đô), Thành Điện Biên | Làng Sa Pa, Đỉnh Phan Xi Păng, Băng cung Mẫu Sơn, Hồ Ba Bể, Cảng Cửa Ông |
| Tây Mạc Quốc (tây) | Sa mạc | Sa đô Ninh Thuận (kinh đô), Thành Tuy Hòa | Ốc đảo Phan Rang, Tháp cổ Pô Na Ga, Sào huyệt Sa Trùng, Bí cảnh Cát Vàng |
| Nam Hoang Quốc (nam) | Rừng rậm, núi lửa | Thành Cần Thơ (kinh đô), Thành Bảo Lộc | Làng U Minh, Rừng tràm U Minh Hạ, Hỏa sơn Chư Đăng Ya, Hang Sơn Đoòng, Cảng Hà Tiên |
| Đông Sơn Quốc (đông) | Cao nguyên, núi đá | Cố đô Hoa Lư (kinh đô), Thành Hải Phòng, Thành Thanh Hóa | Làng Mộc Châu, Kiếm các Tam Đảo, Hồ Núi Cốc, Cổ tự Bái Đính, Bí cảnh Tràng An, Cảng Đồ Sơn, Bến Sầm Sơn |
| Quần đảo Đông Hải | Bốn đảo | | Bến Cát Bà, Động Thiên Cung, Làng chài Lý Sơn, Miệng núi Thới Lới, Cảng An Thới, Rừng Hàm Ninh, Ngục Côn Lôn |
| Xích Diệm Đảo | Núi lửa, sông dung nham | | Bến Hòn Khói, Làng Cù Lao, Lò rèn Bát Tràng, Núi Bà Đen, Hỏa ngục Chư Prông |
| Đảo lẻ | | | Hải đăng Bạch Long Vĩ, Thủy trại Hòn Tre |

Linh khí từng nơi ghi trong `src/data/map.ts`: trong thành ×0,8-1,5; các linh mạch lớn ở châu khác tới ×3.

- Bản đồ vẽ kiểu bản đồ thế giới (biển, bờ cát, núi, rừng, sông, thành phố sáng đèn, mây trôi), tự vẽ hoàn toàn bằng code, không dùng hình của game khác.
- **Sự kiện văn bản:** đoạn văn ngắn với 2-3 lựa chọn. Lựa chọn có phép thử hiện sẵn tỉ lệ thành công, tính theo chỉ số. Trên bản đồ luôn có tối đa 3 sự kiện (dấu chấm than vàng), mỗi sự kiện tồn tại 1-3 năm rồi biến mất. Sự kiện nằm trong `src/data/events.json`; hướng dẫn cho người viết ở [VIET-SU-KIEN.md](VIET-SU-KIEN.md).

**Đề xuất (học từ game tham khảo):**

- Màu viền báo mức nguy hiểm so với sức mình.
- Mỗi địa điểm có việc thường nhật giới hạn số lần (săn dị thú, thăm dò).

## 10b. Chiến đấu

**Đã chốt:**

- Theo lượt. Một mình có thể phải đấu với một, hai, ba hoặc bốn kẻ địch.
- Thua trận thì **thương nặng**. Đang thương nặng mà không bế quan chữa, lại đánh tiếp và thua nữa thì **chết**.
- Người tu luyện khác (NPC) có đủ mọi thứ như một người chơi; tùy sự kiện mà kết đạo hay thành thù oán.

**Bản hiện tại:**

- Bốn hành động: đánh thường, kỹ năng của nhánh (pháp thuật, trọng quyền, dị năng; dùng xong chờ 3 lượt), phòng thủ (giảm 60% sát thương lượt đó), bỏ chạy (tỉ lệ theo Thân pháp).
- Số địch mỗi trận: một con 60%, hai con 25%, ba con 10%, bốn con 5%.
- Máu tính từ Thể chất và bậc. Máu tự hồi 1% mỗi ngày. Thương nặng thì máu chỉ hồi tới 30%; bế quan từ một năm trở lên mới khỏi.
- Thắng dị thú được linh thạch và tu vi (hấp thụ dị hạch). Thắng tu sĩ được nhiều linh thạch hơn.
- **Săn dị thú** ở vùng dị thú: mỗi nơi 3 lần mỗi năm, mỗi lần mất 15 ngày.
- **Bị tập kích** khi tới nơi nguy hiểm: ngang sức 8%, nguy hiểm 30%, tử địa 55%. Thay cho tỉ lệ bỏ mạng cũ: giờ chỉ chết khi thua trận lúc đang thương nặng, hoặc hết thọ.
- **Gặp tu sĩ lạ** trên đường xa (20%): kết giao (thành đạo hữu, được chỉ điểm), ra tay cướp đoạt (đánh nhau, thành kẻ thù), hoặc bỏ qua. Đạo hữu gặp lại thì tặng linh thạch. Kẻ thù có 12% phục kích trên mỗi chặng đường, có thể kéo theo đồng bọn.

**Chưa làm:** NPC có cảnh giới, tuổi thọ, hành trình riêng; bái sư, giao dịch, kết đạo lữ; trang bị và pháp bảo; đan dược dùng trong trận; danh sách nhân mạch.

## 10c. Giải đố (đề xuất)

- Cửa ải mở bí cảnh, phá trận pháp, vượt tâm ma. Loại câu đố chưa quyết định.

## 11. Chơi hai người (đã chốt)

- Giai đoạn đầu: mỗi người chơi bản riêng, tiến trình lưu trên trình duyệt.
- Giai đoạn sau: hai người chung một máy chủ nếu làm được.

## 12. Hình ảnh và âm thanh

- Khung hình dọc 720×1280, tự co theo màn hình.
- Giai đoạn đầu dùng hình vẽ bằng code và hiệu ứng; thay dần bằng asset.
- Hai nhân vật mặc định nam và nữ (`public/assets/characters/`) hiện là hình vector 2D kiểu chibi, dùng tạm. Hình chính thức sẽ do công cụ tạo ảnh AI vẽ theo mô tả trong [NHAN-VAT.md](NHAN-VAT.md): kiểu hoạt hình tu tiên Trung Quốc, dựng 3D.
- Âm thanh: chưa bàn.

## 13. Câu hỏi còn mở

1. Tên game?
2. Có cốt truyện và nhân vật chính cụ thể không?
3. Loại câu đố ưa thích?
4. Khi chơi chung: hợp tác, giao dịch hay tỉ thí?
