import "./globals.css";

export const metadata = {
  title: "Ôn tập Lịch sử HK2",
  description: "Ứng dụng ôn tập trắc nghiệm Lịch sử HK2 cho học sinh lớp 12"
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
