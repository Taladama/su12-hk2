# App Ôn Tập Lịch Sử HK2

Ứng dụng Next.js/React mobile-first để ôn trắc nghiệm Lịch sử HK2. Dữ liệu đã nhập đủ 60 câu Chương 5 và Chương 6 từ PDF, gắn đáp án theo danh sách đã rà soát.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Kiểm tra dữ liệu

```bash
npm run check
```

Script này kiểm tra đủ 60 câu, đáp án đúng/sai, cấu trúc câu hỏi và logic chấm điểm cơ bản.

## Deploy Vercel

1. Vào Vercel, chọn **Add New Project**.
2. Import repository này.
3. Giữ mặc định:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: để trống
4. Bấm **Deploy**.
