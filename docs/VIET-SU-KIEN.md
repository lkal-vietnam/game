# Hướng dẫn viết sự kiện

Tài liệu này dành cho người viết thêm sự kiện cho game. Không cần biết lập trình: mỗi sự kiện là một khối chữ trong file `src/data/events.json`, viết theo đúng khuôn bên dưới là game tự nhận.

## 1. Thế giới và thể loại

- **Thể loại:** tu tiên pha hiện đại. Linh khí quay trở lại giữa thời đại có tàu điện, điện thoại và nhà cao tầng.
- **Ba con đường:** tu tiên (hấp thụ linh khí, pháp thuật), dị năng (thức tỉnh năng lực riêng nhờ dị hạch), thể tu (rèn thân thể).
- **Nhân vật:** người chơi sống từng kiếp. Mỗi kiếp bắt đầu là một đứa trẻ phàm nhân 12 tuổi ở Lạc Thành, tu luyện, đi khắp nơi tìm kỳ ngộ, rồi hết thọ và luân hồi.
- **Thế giới:** nhiều vùng đất, mỗi nơi có mức nguy hiểm riêng.

| Vùng đất | Cảnh sắc | Địa danh tiêu biểu |
| --- | --- | --- |
| Lạc Việt Châu | Thành phố hiện đại Lạc Thành, quanh là núi, rừng, đất hoang | Ngõ Hàng Mây, Chợ đêm Đồng Xuân, Đạo quán Yên Tử, Động Phong Nha |
| Bắc Băng Nguyên | Tuyết và núi băng | Làng Sa Pa, Đỉnh Phan Xi Păng, Băng cung Mẫu Sơn |
| Tây Mạc | Sa mạc, ốc đảo, tháp cổ | Ốc đảo Phan Rang, Tháp cổ Pô Na Ga, Bí cảnh Cát Vàng |
| Quần đảo Đông Hải | Đảo, làng chài, núi lửa đã tắt | Bến Cát Bà, Làng chài Lý Sơn, Ngục Côn Lôn |
| Nam Hoang | Rừng rậm, đầm lầy, núi lửa | Làng U Minh, Hỏa sơn Chư Đăng Ya, Hang Sơn Đoòng |
| Đông Sơn Châu | Cao nguyên, núi đá, cố đô | Cố đô Hoa Lư, Kiếm các Tam Đảo, Bí cảnh Tràng An |
| Xích Diệm Châu | Đất núi lửa, sông dung nham | Lò rèn Bát Tràng, Núi Bà Đen, Hỏa ngục Chư Prông |

- **Từ ngữ:** dùng "pháp thuật", không dùng "phép". Tiền tệ là "linh thạch". Quái vật gọi là "dị thú".

## 2. Giọng văn

- Gọi người chơi là **"ngươi"**.
- Câu ngắn. Mở đầu 2-3 câu tả một cảnh lạ, cụ thể, nhìn thấy được.
- Để lại một chút bí ẩn, không giải thích hết.
- Kết quả mỗi lựa chọn 1-2 câu.
- Tự viết nội dung của mình. Không chép tình tiết, nhân vật hay câu văn từ truyện, phim, game khác.

## 3. Khuôn của một sự kiện

```json
{
  "id": "giengLang",
  "title": "Giếng làng",
  "places": ["village"],
  "text": "Cả làng đứng quanh cái giếng cổ. Nước giếng từ đêm qua bỗng ấm và có vị ngọt.",
  "choices": [
    {
      "text": "Xin một gáo uống thử",
      "ok": { "text": "Nước trôi xuống cổ, ấm như rượu.", "energy": 60, "days": 1 }
    },
    {
      "text": "Buộc dây leo xuống đáy giếng",
      "check": { "stat": "theChat", "difficulty": 7 },
      "ok": { "text": "Dưới đáy có một khe nứt đang rỉ linh dịch.", "energy": 160, "days": 2 },
      "fail": { "text": "Hơi ấm làm ngươi choáng. Dân làng phải kéo ngươi lên.", "days": 6 }
    }
  ]
}
```

| Mục | Ý nghĩa |
| --- | --- |
| `id` | Tên riêng của sự kiện, viết liền không dấu, không trùng với sự kiện khác |
| `title` | Tên hiện trong game |
| `places` | Loại địa danh mà sự kiện có thể xuất hiện (bảng ở mục 4) |
| `text` | Đoạn mở đầu |
| `choices` | 2 hoặc 3 lựa chọn |

Mỗi lựa chọn gồm:

| Mục | Bắt buộc | Ý nghĩa |
| --- | --- | --- |
| `text` | Có | Chữ trên nút bấm, nên ngắn |
| `ok` | Có | Kết quả khi thành công, hoặc kết quả duy nhất nếu không có phép thử |
| `check` | Không | Phép thử: chỉ số nào (`stat`) và độ khó (`difficulty`) |
| `fail` | Có nếu có `check` | Kết quả khi thất bại |
| `cost` | Không | Số linh thạch phải có mới chọn được |

Mỗi kết quả (`ok`, `fail`) gồm:

| Mục | Ý nghĩa |
| --- | --- |
| `text` | Câu văn kể kết quả (bắt buộc) |
| `energy` | Năng lượng tu luyện nhận được |
| `linhThach` | Linh thạch được (số dương) hoặc mất (số âm) |
| `stat` | Chỉ số được cộng, ví dụ `{ "name": "ngoTinh", "amount": 1 }` |
| `days` | Số ngày trôi qua (bị thương, chờ đợi, đi đường) |

## 4. Loại địa danh

| Mã | Loại | Ví dụ |
| --- | --- | --- |
| `home` | Nhà | Ngõ Hàng Mây |
| `market` | Phường thị, chợ | Chợ đêm Đồng Xuân, Ốc đảo Phan Rang |
| `station` | Ga tàu | Ga Long Biên |
| `spring` | Linh mạch | Hồ Tịnh Tâm, Hồ Ba Bể, Hỏa sơn Chư Đăng Ya |
| `guild` | Hiệp hội dị năng | Tháp Bạch Mã |
| `dojo` | Võ quán thể tu | Võ quán Tây Sơn |
| `sect` | Tông môn tu tiên | Đạo quán Yên Tử, Đỉnh Phan Xi Păng |
| `beast` | Vùng dị thú | Khu xưởng Hắc Thủy, Rừng Cúc Phương, Rừng tràm U Minh Hạ |
| `secret` | Bí cảnh | Động Phong Nha, Băng cung Mẫu Sơn, Hang Sơn Đoòng |
| `port` | Bến thuyền | Bến Hạ Long, Cảng An Thới |
| `village` | Thôn làng | Làng Sa Pa, Làng U Minh |
| `ruin` | Di tích | Tháp cổ Pô Na Ga, Ngục Côn Lôn |

Một sự kiện ghi nhiều loại thì có thể xuất hiện ở bất kỳ địa danh nào thuộc các loại đó, ở mọi vùng đất. Vì vậy trong lời văn nên tránh nhắc tên một địa danh cụ thể, trừ khi sự kiện chỉ hợp với đúng một nơi.

## 5. Chỉ số dùng cho phép thử

| Mã | Chỉ số | Hợp với hành động |
| --- | --- | --- |
| `theChat` | Thể chất | Chịu đựng, gánh vác, chống độc, chống rét |
| `sucManh` | Sức mạnh | Đánh, phá, nâng, cạy |
| `thanPhap` | Thân pháp | Leo trèo, lẩn trốn, rượt đuổi, né tránh |
| `linhLuc` | Linh lực | Dùng pháp thuật, điều khiển linh khí |
| `thanThuc` | Thần thức | Cảm nhận, giữ tâm vững, chống mê hoặc |
| `ngoTinh` | Ngộ tính | Lĩnh ngộ, giải đố, đoán ý, mặc cả |

## 6. Chọn con số cho cân bằng

- **Độ khó:** nhân vật mới có mọi chỉ số bằng 5. Độ khó 5 là 50% thành công; mỗi điểm chênh lệch là 8%. Độ khó 6-7 là vừa, 8 trở lên là liều.
- **Năng lượng (`energy`):** cả bậc Luyện Khí cần khoảng 300, và ngồi bế quan ở nhà chỉ được khoảng 4 mỗi năm. Kỳ ngộ thường cho 40-120; phần thưởng lớn, rủi ro cao cho 150-220.
- **Mỗi kiếp sinh ra ở một nơi ngẫu nhiên**, nên sự kiện không nên giả định người chơi đang ở Lạc Thành, trừ khi `places` chỉ có loại địa danh riêng của Lạc Thành.
- **Linh thạch:** mỗi kiếp bắt đầu với khoảng 30, làm thuê được 12 mỗi năm, đột phá lên Trúc Cơ cần 100. Thưởng thường 10-70.
- **Chỉ số:** mỗi lần chỉ cộng 1.
- **Thời gian mất (`days`):** vết thương nhẹ 5-15 ngày, nặng 20-60 ngày.
- Lựa chọn an toàn nên cho ít hoặc không cho gì. Lựa chọn liều thì thưởng lớn, thất bại phải trả giá.
- Luôn có một lựa chọn để bỏ đi.

## 7. Trước khi gửi

- [ ] `id` không trùng và không có dấu, không có khoảng trắng.
- [ ] Có 2 hoặc 3 lựa chọn.
- [ ] Lựa chọn nào có `check` thì có cả `ok` và `fail`.
- [ ] Mã địa danh và mã chỉ số viết đúng như trong bảng.
- [ ] Dấu ngoặc kép trong lời văn viết là `\"`.
- [ ] Các khối sự kiện cách nhau bằng dấu phẩy; khối cuối cùng không có dấu phẩy phía sau.

Sự kiện viết sai khuôn sẽ bị game bỏ qua chứ không làm hỏng game. Gửi file `events.json` đã thêm sự kiện, hoặc gửi riêng các khối mới, cho người quản lý dự án để đưa vào game.
