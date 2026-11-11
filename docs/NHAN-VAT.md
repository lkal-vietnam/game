# Mô tả nhân vật cho công cụ tạo ảnh

Dùng để nhờ một công cụ tạo ảnh AI vẽ hai nhân vật mặc định (bản thể nam và nữ). Phần mô tả viết bằng tiếng Anh vì đa số công cụ hiểu tiếng Anh tốt hơn; dán nguyên khối vào là được.

## Yêu cầu chung cho cả hai ảnh

- **Một nhân vật, toàn thân**, đứng thẳng nhìn về phía trước, thấy đủ từ đỉnh đầu tới bàn chân, không bị cắt.
- **Tỉ lệ ảnh dọc 2:3**, tối thiểu 1024 × 1536.
- **Nền trong suốt** (PNG). Nếu công cụ không xuất được nền trong suốt thì dùng nền một màu trơn (trắng hoặc xanh lá), mình sẽ tách nền sau.
- Không chữ, không logo, không khung viền, không chữ ký.
- Nhân vật gốc, không dựa theo nhân vật có sẵn của phim, truyện hay game nào.
- Hai ảnh nên tạo cùng một công cụ, cùng kiểu, để nam và nữ đồng bộ.

## Nhân vật nam

```
Full-body character design of an original young male cultivator, age around 20, standing upright facing the viewer in a calm confident idle pose, arms relaxed at his sides. Stylized 3D render in the style of modern Chinese xianxia donghua animation: smooth clean skin shading, large expressive eyes, soft rim lighting, high detail fabric.

Appearance: long black hair with a faint dark-blue sheen, half tied up in a topknot held by a gold hairpin with a small jade bead, long side locks framing the face. Sharp gentle eyes with bright blue irises. Slim athletic build.

Outfit, a blend of traditional xianxia and modern streetwear: a white cross-collar inner robe with blue trim, a long open navy-blue outer coat with thin gold edging, a dark belt with a gold buckle, a round jade pendant with a red tassel hanging from the belt, slim dark trousers, modern white-soled sneakers.

Faint cyan spiritual energy wisps drifting around his hands. Even soft studio lighting, no harsh shadows. Entire figure visible from head to feet, centered, with small margin around. Transparent background, no text, no watermark, no border, single character only.
```

## Nhân vật nữ

```
Full-body character design of an original young female cultivator, age around 20, standing upright facing the viewer in a graceful calm idle pose, hands lightly clasped in front. Stylized 3D render in the style of modern Chinese xianxia donghua animation: smooth clean skin shading, large expressive eyes, soft rim lighting, high detail fabric.

Appearance: very long dark-purple hair reaching the waist, two small buns on top tied with red ribbons, straight bangs, long side locks, a small gold flower hair ornament. Gentle eyes with bright violet irises, a tiny red flower-shaped mark on the forehead. Slender build.

Outfit, a blend of traditional xianxia and modern fashion: a white cross-collar top with red trim and wide flowing sleeves, a high-waisted layered skirt fading from rose pink at the waist to white at the hem, a red sash tied in a bow with a gold clasp, modern white ankle boots.

Faint pink spiritual energy petals drifting around her. Even soft studio lighting, no harsh shadows. Entire figure visible from head to feet, centered, with small margin around. Transparent background, no text, no watermark, no border, single character only.
```

## Nếu kết quả chưa đạt

- Bị cắt chân hoặc đầu: thêm `full body shot, feet visible, zoomed out`.
- Ra tranh 2D phẳng: thêm `3D CGI render, donghua 3D animation style`.
- Ra quá giống người thật: thêm `stylized, anime proportions, not photorealistic`.
- Có nền rối: thêm `plain solid white background`.
- Ra nhiều người: thêm `solo, one character`.

## Gửi lại cho dự án

Đặt tên file `nam.png` và `nu.png`. Ảnh sẽ thay hai hình tạm trong `public/assets/characters/`.

Về sau, nếu muốn nhân vật cử động (thở, ngồi thiền, ra đòn), cần thêm các tư thế khác của cùng nhân vật: ngồi xếp bằng thiền định, tư thế chiến đấu, bị thương.
