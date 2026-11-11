# Quy ước làm việc

## Nguyên tắc

- Nhánh `main` luôn chơi được. Mọi thứ trên `main` sẽ tự phát hành lên link chơi.
- Thiết kế ghi trong `docs/GDD.md`, công việc ghi trong `docs/ROADMAP.md`. Đổi ý tưởng thì sửa tài liệu trước, code sau.
- Làm từng phần nhỏ, chơi thử, rồi mới làm tiếp.

## Nhánh

- `main`: bản ổn định.
- `feat/<tên-ngắn>`: tính năng mới, ví dụ `feat/chien-dau`.
- `fix/<tên-ngắn>`: sửa lỗi.

Xong việc thì gộp vào `main` qua pull request; CI phải build thành công.

## Commit

Viết ngắn, theo dạng `<loại>: <nội dung>`:

- `feat`: tính năng mới
- `fix`: sửa lỗi
- `docs`: tài liệu
- `art`: hình ảnh, âm thanh
- `chore`: việc lặt vặt (cấu hình, dọn dẹp)

Ví dụ: `feat: thêm màn hình đột phá cảnh giới`.

## Cấu trúc thư mục

```
docs/            Tài liệu thiết kế và roadmap
public/assets/   Hình ảnh, âm thanh
src/
  main.ts        Điểm khởi động game
  config.ts      Hằng số chung
  scenes/        Mỗi màn hình là một file
  state/         Dữ liệu người chơi, lưu và tải
```

## Asset

- Chỉ dùng asset được phép: tự làm, miễn phí bản quyền, hoặc đã mua.
- Ghi nguồn và giấy phép vào `public/assets/CREDITS.md` khi thêm asset từ bên ngoài.
