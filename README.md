# Good Meet Frontend

Frontend React cho **good-meet-be** (Spring Boot, giai đoạn 1: shared, identity, participant, meeting, chat). Giao diện, kiến trúc và công nghệ giữ theo repo `good-meet-fe` ban đầu; phần nghiệp vụ được đơn giản hóa cho khớp backend hiện tại.

Công nghệ: React 19, Vite, TypeScript, Tailwind + SCSS, Redux Toolkit (state client), TanStack Query (state server), Axios, STOMP (`@stomp/stompjs`), LiveKit, i18next (vi/en), React Hook Form + Zod, Vitest.

## Chạy

```bash
# backend: docker compose up -d && mvn spring-boot:run   (cổng 8080)
yarn install
yarn dev
```

Biến môi trường (`.env.development`):

```
VITE_API_HOST_URL=http://localhost:8080     # không có tiền tố /api/v1
VITE_SOCKET_URL=ws://localhost:8080/ws
```

Lệnh khác: `yarn lint`, `yarn typecheck`, `yarn test:ci`, `yarn build`, `yarn test:e2e`.

## Xác định người gọi (không JWT)

- Đăng ký trả 201 không có body, nên FE đăng nhập ngay sau khi đăng ký để lấy `userId`.
- Đăng nhập chỉ trả `{ userId }`. FE lưu `{ userId, email, displayName }` ở localStorage (`good-meet.auth`). Tên hiển thị được nhớ theo email lúc đăng ký; đổi được ở trang Cài đặt.
- Sau khi vào phòng, `participantId` được giữ trong Redux và gửi ở header `X-Participant-Id` cho mọi thao tác trong phòng.
- Token duy nhất là token LiveKit (`mediaToken`), chỉ nằm trong bộ nhớ.

## Luồng chính

| Màn hình | Route | API |
|---|---|---|
| Sảnh (tạo nhanh, vào bằng mã, cuộc họp của tôi) | `/` | `POST /meetings`, `POST /meetings/{code}/join` |
| Vào bằng mã / liên kết mời | `/join?code=` | `POST /meetings/{code}/join` |
| Chờ chủ phòng duyệt | `/waiting` | STOMP `/topic/join-requests/{requestId}` |
| Phòng họp | `/meetings/:code` | LiveKit, chat, phòng chờ, kick/mute, kết thúc |
| Đặt lịch | `/meetings/schedule` | `POST /meetings/scheduled` |
| Cuộc họp của tôi | `/meetings` | dữ liệu lưu cục bộ |
| Chi tiết (host) | `/meeting-details/:code` | `PUT .../schedule`, `POST .../cancel`, `POST .../end`, lời mời |
| Đăng nhập / đăng ký | `/login`, `/register` | `POST /auth/login`, `/auth/register` |

- `join`: 200 là host vào thẳng; 202 là phải chờ duyệt (phòng chờ luôn bật), FE subscribe `/topic/join-requests/{requestId}` và nhận `{ approved, result }` kèm token LiveKit.
- Host nhận người xin vào ở `/topic/meetings/{meetingId}/waiting-room` (`REQUESTED` / `RESOLVED`) và duyệt bằng `POST /join-requests/{id}/decision`.
- Chat: lịch sử `GET /meetings/{code}/chat/messages`, gửi STOMP `/app/meetings/{code}/chat`, nhận `/topic/meetings/{meetingId}/chat`.
- Host kick / mute mic qua `/meetings/{code}/room-participants/{identity}/kick|mute`. Kết thúc phiên: `end-session`; kết thúc hẳn: `end`.

## Giới hạn do backend hiện tại

1. **Không có API liệt kê cuộc họp**: "Cuộc họp của tôi" lưu cục bộ theo `userId` trên trình duyệt đã tạo cuộc họp.
2. **Không có API xem meeting theo mã**: trạng thái chỉ cập nhật theo phản hồi mà FE nhận được.
3. **`POST /meetings` và `/meetings/scheduled` không trả `participantId` của host**, trong khi đổi lịch, hủy, lời mời, kết thúc đều cần nó ở `X-Participant-Id`. Hiện chỉ lấy được khi host gọi `/join` (lúc đó meeting chuyển sang `ACTIVE`). FE đã đọc trường `participantId` nếu backend bổ sung vào response tạo/đặt lịch; khi chưa có, trang chi tiết hiển thị thông báo và ẩn các thao tác đó.
4. Danh sách phòng chờ của host chỉ gồm các yêu cầu nhận được khi host đang ở trong phòng (backend chỉ đẩy sự kiện, không có API liệt kê).
5. Gửi chat qua STOMP không có phản hồi lỗi: tin nhắn không được broadcast lại sau 4 giây sẽ báo "có thể chưa được gửi".
6. Token LiveKit sống 10 phút và chỉ giữ trong bộ nhớ, nên tải lại trang trong phòng sẽ quay về màn hình vào phòng.

## Cấu trúc

```text
src/
├── app/       # providers, store (+ lưu localStorage), router, styles
├── pages/     # ghép màn hình theo route
├── widgets/   # app-header, meeting-list
├── features/  # authentication, join-meeting, create-meeting, schedule-meeting,
│              # manage-invitations, manage-participant, meeting-chat, meeting-room
├── entities/  # meeting (API, kiểu, session phòng, danh sách cục bộ), participant
└── shared/    # api (axios), realtime (STOMP), config, lib, hooks, ui
```

Phụ thuộc đi vào trong: `app/pages -> widgets/features/entities/shared`, `features -> entities/shared`, `entities -> shared`.

Phần chưa có trong backend (presence/giơ tay, captions, breakout, poll, ghi hình, lịch Google...) chưa có giao diện.
