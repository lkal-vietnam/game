# Game Design Doc

Bản nháp đầu tiên. Mục ghi **(đã chốt)** là điều chủ dự án đã quyết định; mục ghi **(đề xuất)** là gợi ý chờ duyệt, có thể đổi tự do.

## 1. Tổng quan

| Hạng mục | Nội dung |
| --- | --- |
| Tên game | Chưa đặt |
| Thể loại | Tu luyện kết hợp khám phá, chiến đấu và giải đố **(đã chốt)** |
| Bối cảnh | Tu tiên pha hiện đại, có dị năng và thể tu **(đã chốt)** |
| Nền tảng | Trình duyệt điện thoại và máy tính **(đã chốt)** |
| Người chơi | 1-2 người, chơi nội bộ **(đã chốt)** |
| Hình ảnh | 2D, ưu tiên sự sống động qua chuyển động và hiệu ứng **(đã chốt)** |
| Công nghệ | Phaser + TypeScript + Vite, phát hành qua GitHub Pages **(đã chốt)** |
| Mục tiêu | Làm cho vui, không thương mại **(đã chốt)** |

## 2. Bối cảnh (đề xuất)

Thế giới hiện đại nơi linh khí bất ngờ quay trở lại. Giữa thành phố, con người bắt đầu thức tỉnh theo ba con đường:

- **Tu tiên:** hấp thụ linh khí, luyện công pháp, đột phá cảnh giới. Mạnh về phép thuật và tài nguyên dài hạn.
- **Dị năng:** thức tỉnh một năng lực riêng (lửa, sét, không gian…). Mạnh về kỹ năng đặc biệt, bộc phát.
- **Thể tu:** rèn luyện thân thể đến cực hạn. Mạnh về máu, phòng thủ và đòn đánh thường.

Câu hỏi còn mở: người chơi chọn một con đường ngay từ đầu, hay được pha trộn cả ba?

## 3. Vòng lặp chính (đề xuất)

1. **Tu luyện** để tích lũy linh khí và tăng chỉ số.
2. **Khám phá** các địa điểm trên bản đồ thành phố để gặp sự kiện, tìm tài nguyên.
3. **Chiến đấu** với yêu thú hoặc người thức tỉnh khác để lấy vật phẩm.
4. **Giải đố** để mở bí cảnh hoặc vượt kiếp nạn khi đột phá.
5. **Đột phá** cảnh giới, mở khu vực và kỹ năng mới, rồi quay lại bước 1.

## 4. Các hệ thống

### 4.1 Tu luyện (xương sống)

- Linh khí tăng khi chạm tay và tăng dần theo thời gian, kể cả lúc không mở game.
- Đủ linh khí thì đột phá cảnh giới: Luyện Khí → Trúc Cơ → Kim Đan → … **(đề xuất)**
- Mỗi cảnh giới mở thêm kỹ năng, khu vực và tăng tốc độ tu luyện.

### 4.2 Chiến đấu

- Theo lượt, một đấu một ở bản đầu **(đề xuất)**.
- Hành động cơ bản: đánh thường, dùng kỹ năng (tốn linh lực), phòng thủ, dùng vật phẩm.

### 4.3 Khám phá

- Bản đồ gồm các điểm nối nhau, không phải thế giới mở **(đề xuất)**.
- Mỗi điểm là một sự kiện: trận đấu, câu đố, nhân vật, kho báu.

### 4.4 Giải đố

- Đóng vai trò cửa ải: mở bí cảnh, phá trận pháp, vượt tâm ma khi đột phá **(đề xuất)**.
- Loại câu đố cụ thể chưa quyết định.

## 5. Chơi hai người

- **Giai đoạn đầu:** mỗi người chơi bản riêng, tiến trình lưu trên trình duyệt của mình **(đã chốt)**.
- **Giai đoạn sau:** hai người chung một máy chủ nếu làm được **(đã chốt là mong muốn)**. Cần thêm dịch vụ lưu trữ trực tuyến; sẽ chọn khi tới milestone đó.
- Dữ liệu lưu được giữ ở dạng đơn giản ngay từ đầu để chuyển lên máy chủ sau này không phải làm lại.

## 6. Hình ảnh và âm thanh

- Khung hình dọc 720×1280, tự co theo màn hình **(đề xuất)**.
- Giai đoạn đầu dùng hình vẽ bằng code và hiệu ứng (ánh sáng, hạt, rung, chuyển động).
- Thay dần bằng asset miễn phí, ảnh do AI tạo hoặc tranh nhờ người vẽ.
- Âm thanh: chưa bàn.

## 7. Phạm vi bản đầu tiên (MVP)

Chỉ một vòng lặp nhỏ nhất chơi được từ đầu đến cuối:

- Tu luyện tích linh khí.
- Một trận chiến đấu theo lượt.
- Đột phá một cảnh giới.

Khám phá bản đồ, giải đố, ba con đường tu luyện và chơi chung hai người làm ở các milestone sau. Xem [ROADMAP.md](ROADMAP.md).

## 8. Câu hỏi còn mở

1. Tên game?
2. Chọn một con đường hay pha trộn cả ba?
3. Có cốt truyện và nhân vật chính cụ thể không, hay tự do?
4. Loại câu đố ưa thích (xếp hình, mật mã, trận pháp nối điểm…)?
5. Khi chơi chung: hợp tác đánh quái, giao dịch vật phẩm, hay tỉ thí với nhau?
