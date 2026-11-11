# Game

Game 2D chạy trên trình duyệt điện thoại và máy tính: tu luyện, khám phá, chiến đấu và giải đố trong bối cảnh tu tiên pha hiện đại.

- Thiết kế: [docs/GDD.md](docs/GDD.md)
- Kế hoạch: [docs/ROADMAP.md](docs/ROADMAP.md)
- Quy ước làm việc: [CONTRIBUTING.md](CONTRIBUTING.md)

## Chạy trên máy

Cần cài [Node.js](https://nodejs.org) bản 22 trở lên.

```
npm install
npm run dev
```

Mở địa chỉ hiện ra trong cửa sổ lệnh (thường là http://localhost:5173).

## Phát hành

Mỗi lần đẩy code lên nhánh `main`, GitHub tự build và phát hành lên GitHub Pages. Cần bật một lần: Settings → Pages → Source chọn **GitHub Actions**.

## Công nghệ

Phaser, TypeScript, Vite.
