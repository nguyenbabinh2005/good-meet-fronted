# Good Meet Frontend

Frontend React cho **good-meet-be** (Spring Boot, giai đoạn 1: shared, identity, participant, meeting, chat, presence; giai đoạn 2: breakout, transcript, summary, assistant; giai đoạn 3: recording). Giao diện, kiến trúc và công nghệ giữ theo repo `good-meet-fe` ban đầu; phần nghiệp vụ được đơn giản hóa cho khớp backend hiện tại.

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
| Chi tiết (host) | `/meeting-details/:code` | `PUT .../schedule`, `POST .../cancel`, `POST .../end`, lời mời, biên bản |
| Đăng nhập / đăng ký | `/login`, `/register` | `POST /auth/login`, `/auth/register` |
| Ghi hình (trong phòng) | panel "Ghi hình" của `/meetings/:code` | `POST .../recordings`, `POST .../recordings/stop`, `GET .../recordings` |
| Ghi chú & AI (trong phòng) | panel "AI" của `/meetings/:code` | `PUT .../notes`, `PUT .../assistant`, `GET .../transcripts` |

- `join`: 200 là host vào thẳng; 202 là phải chờ duyệt (phòng chờ luôn bật), FE subscribe `/topic/join-requests/{requestId}` và nhận `{ approved, result }` kèm token LiveKit.
- Host nhận người xin vào ở `/topic/meetings/{meetingId}/waiting-room` (`REQUESTED` / `RESOLVED`) và duyệt bằng `POST /join-requests/{id}/decision`.
- Chat: lịch sử `GET /meetings/{code}/chat/messages`, gửi STOMP `/app/meetings/{code}/chat`, nhận `/topic/meetings/{meetingId}/chat`.
- Host kick / mute mic qua `/meetings/{code}/room-participants/{identity}/kick|mute`. Kết thúc phiên: `end-session`; kết thúc hẳn: `end`.

## Ghi hình

Nút **Ghi hình** trên thanh trên của phòng họp mở panel `features/recording`.

- Host bấm "Bắt đầu ghi hình" (`POST /meetings/{code}/recordings`) và "Dừng ghi hình" (`POST /meetings/{code}/recordings/stop`). Lỗi 409 (phòng chưa live, đang ghi sẵn hoặc chưa ghi) báo chung là trạng thái đã thay đổi.
- Mọi participant xem được danh sách bản ghi (`GET /meetings/{code}/recordings`, gồm cả các phiên trước), mỗi bản có trạng thái `RECORDING` / `COMPLETED` / `FAILED`, giờ bắt đầu, thời lượng và đường dẫn file. Danh sách tự làm mới mỗi 5 giây.
- Khi có bản ghi đang chạy, thanh trên hiện chấm **REC** cho tất cả mọi người (ẩn trên màn hình nhỏ cùng với khối trạng thái phiên).
- Backend lưu file `.mp4` trên ổ đĩa máy chủ và chỉ trả `filePath` trên máy chủ, không có URL tải, nên FE hiển thị đường dẫn kèm nút sao chép thay vì phát hay tải trực tiếp.

## Ghi chú, biên bản và trợ lý AI

Nút **AI** trên thanh trên của phòng họp mở panel "Ghi chú & AI" (`widgets/meeting-ai-panel`): host có hai công tắc, mọi người xem được bản ghi lời thoại.

- **Ghi chú (transcript)**: host bật/tắt bằng `PUT /meetings/{code}/notes` (`{ enabled }`). Danh sách bản ghi lấy `GET /meetings/{code}/transcripts` (mọi participant, gồm cả các phiên trước, có vạch ngăn theo phiên) và tự làm mới mỗi 5 giây. Chỉ những câu đã chốt mới có trong danh sách (backend gom theo debounce 2 giây).
- **Biên bản (summary)**: backend tự tạo biên bản khi phiên kết thúc và có transcript. Biên bản chỉ xem ở thẻ "Biên bản cuộc họp" trong trang chi tiết (host), không có trong phòng. Thẻ gọi `GET /meetings/{code}/minutes` với `X-User-Id`, chọn phiên bản bằng ô chọn, hiển thị tóm tắt, nội dung trao đổi chính, quyết định, phân công công việc, trạng thái `GENERATING` / `COMPLETED` / `FAILED`, tự làm mới mỗi 5 giây. Nút "Tạo biên bản" / "Tạo lại" gọi `POST /meetings/{code}/minutes` (chờ tối đa 90 giây, gọi Gemini); 409 nghĩa là chưa có transcript.
- **Trợ lý AI (assistant)**: host bật/tắt bằng `PUT /meetings/{code}/assistant` (`{ enabled }`). Việc trả lời nằm ở LiveKit Agent phía backend, FE chỉ giữ công tắc.

Giới hạn do backend hiện tại:

1. Backend không có API đọc cờ `notesEnabled` / `assistantEnabled` và không phát sự kiện khi cờ đổi, nên công tắc chỉ hiện cho host. Giá trị ban đầu lấy từ cuộc họp lưu cục bộ (nếu có), sau đó theo phản hồi lần bật/tắt gần nhất trong phiên trình duyệt.
2. Biên bản chỉ host xem và tạo lại được, xác định bằng `X-User-Id`.
3. Transcript và biên bản chỉ cập nhật bằng polling vì backend không đẩy sự kiện qua WebSocket cho hai module này.

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
├── widgets/   # app-header, meeting-list, meeting-ai-panel
├── features/  # authentication, join-meeting, create-meeting, schedule-meeting,
│              # manage-invitations, manage-participant, meeting-chat, meeting-room,
│              # presence, breakout, transcript, summary, assistant, recording
├── entities/  # meeting (API, kiểu, session phòng, danh sách cục bộ), participant
└── shared/    # api (axios), realtime (STOMP), config, lib, hooks, ui
```

Phụ thuộc đi vào trong: `app/pages -> widgets/features/entities/shared`, `features -> entities/shared`, `entities -> shared`.

Phần chưa có (captions, poll/Q&A, livestream, lịch Google...) chưa có giao diện.
