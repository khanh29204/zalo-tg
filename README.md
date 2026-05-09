# Zalo ↔ Telegram Bridge

Cầu nối hai chiều giữa **Zalo** và **Telegram** sử dụng Forum Topics. Mỗi cuộc trò chuyện Zalo (cá nhân hoặc nhóm) tương ứng với một topic riêng trong group Telegram.

## Tính năng

### Tin nhắn
- 💬 **Text 2 chiều** — kèm reply chain đúng thread cả 2 phía
- 🖼️ **Ảnh** — single photo và album/media group (nhiều ảnh cùng lúc)
- 🎥 **Video & GIF** — kể cả video album trên TG
- 📄 **File** — mọi định dạng, cảnh báo khi vượt 20 MB
- 🎤 **Voice note** — TG→Zalo tự convert OGG→M4A; Zalo→TG phát được ngay
- 🌀 **Sticker** — Zalo sticker hiển thị native trên TG; animated sticker dùng thumbnail
- 🎨 **Doodle** — sketch/vẽ tay Zalo → ảnh TG

### Tương tác
- 💬 **Reply** — reply đúng tin nhắn gốc cả 2 chiều (kể cả reply vào tin bot đã gửi)
- 😄 **React** — emoji TG → react Zalo tương ứng; react Zalo → notify TG
- 🗑️ **Thu hồi** — Zalo thu hồi → xoá trên TG; `/recall` để thu hồi từ TG
- 🏷️ **Mention** — `@Tên` TG → mention Zalo; mention Zalo → **bold** trên TG; caption ảnh/video cũng được sync

### Media đặc biệt
- 📍 **Vị trí** — Zalo→TG bản đồ native; TG→Zalo link Google Maps
- 👤 **Danh thiếp** — contact card cả 2 chiều (tên + SĐT + QR nếu có)
- 🏦 **Thẻ ngân hàng** — hiển thị QR VietQR + số tài khoản + tên chủ tài khoản
- 📊 **Bình chọn (Poll)** — tạo poll cả 2 chiều, sync vote real-time, bảng điểm tự cập nhật, khoá bình chọn

### Nhóm & Quản lý
- 👥 **Nhóm Zalo** — tạo topic tự động khi nhận tin, kèm ảnh đại diện nhóm được pin sẵn
- 📢 **Sự kiện nhóm** — thông báo vào/rời/xoá/chặn thành viên
- 🔍 **Tìm bạn bè** — `/search Tên` → inline keyboard → tạo topic DM ngay

## Yêu cầu

- Node.js ≥ 18
- ffmpeg (để convert voice note OGG→M4A)
- Tài khoản Zalo đang hoạt động
- Telegram Bot Token ([@BotFather](https://t.me/BotFather))
- Telegram Supergroup với **Topics** được bật, bot là **admin** (cần quyền tạo topic, xoá tin, pin tin)

## Cài đặt

```bash
git clone https://github.com/williamcachamwri/zalo-tg
cd zalo-tg
npm install
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
TG_TOKEN=<token từ BotFather>
TG_GROUP_ID=<ID group Telegram, số âm, ví dụ: -1001234567890>
```

## Chạy

```bash
npm run dev                  # dev mode (hot-reload với tsx watch)
npm run build && npm start   # production
```

Lần đầu chưa có credentials Zalo → gõ `/login` trong Telegram để đăng nhập bằng QR code.

## Lệnh Telegram

| Lệnh | Mô tả |
|------|-------|
| `/login` | Đăng nhập tài khoản Zalo qua QR code |
| `/search Tên` | Tìm bạn bè Zalo, chọn để tạo topic DM |
| `/recall` | Thu hồi tin nhắn vừa gửi (reply vào tin cần thu hồi) |
| `/topic list` | Xem danh sách tất cả topic đang được bridge |
| `/topic info` | Xem thông tin Zalo của topic hiện tại |
| `/topic delete` | Xoá liên kết topic ↔ Zalo |

## Cách hoạt động

```
Zalo ──► zalo/handler.ts ──► Telegram Topic
                │
         (msgStore, sentMsgStore,
          pollStore, mediaGroupStore)
                │
Telegram Topic ──► telegram/handler.ts ──► Zalo
```

- Mỗi cuộc trò chuyện Zalo (DM hoặc nhóm) → 1 Forum Topic trên TG
- Mapping được lưu trong `data/topics.json` (persist qua restart)
- Message ID được cache in-memory để reply chain và thu hồi hoạt động đúng

## Cấu trúc

```
src/
├── index.ts              # Entry point, khởi tạo bot + listener
├── config.ts             # Đọc env
├── store.ts              # topic store, msgStore, sentMsgStore, pollStore,
│                         # mediaGroupStore, zaloAlbumStore, userCache, friendsCache
├── telegram/
│   ├── bot.ts            # Khởi tạo Telegraf instance
│   └── handler.ts        # TG → Zalo: text, media, poll, reaction, reply...
├── zalo/
│   ├── client.ts         # Khởi tạo Zalo API, QR login flow
│   ├── types.ts          # TypeScript types + ZALO_MSG_TYPES enum
│   └── handler.ts        # Zalo → TG: tất cả msgType, group_event, undo, reaction
└── utils/
    ├── format.ts          # escapeHtml, applyMentionsHtml, groupCaption, topicName
    └── media.ts           # downloadToTemp, cleanTemp, convertToM4a
```

## Lưu ý bảo mật

- **Không commit** file `.env` và `credentials.json` — đã được ignore trong `.gitignore`
- Bot Telegram cần quyền **admin** trong group: tạo/xoá topic, pin tin, xoá tin, nhận reactions
- Zalo session lưu trong `credentials.json` — bảo mật như password, không chia sẻ

## License

MIT
