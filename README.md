## Thư mục `modules`
Thư mục này chứa các tệp JavaScript xử lý chức năng trò chơi ở cấp cao hơn, tập trung vào giao diện người dùng và cơ chế trò chơi. Các mô-đun ở đây chủ yếu phục vụ lớp ứng dụng.
### Danh sách các modules:
1. - **playerVsAI.js**
- Xử lý tương tác giữa người chơi và AI 
- Quản lý trạng thái trò chơi khi người chơi đối đầu AI
- Cấu hình màu của người chơi (trắng hoặc đen)
- Xử lý các tương tác của người dùng với bàn cờ
- Xử lý nước đi của người chơi và kích hoạt phản hồi của AI

2.  **botVsBot.js**
- Quản lý trò chơi nơi hai engine AI thi đấu với nhau
- Thiết lập hai engine riêng biệt cho quân trắng và quân đen
- Điều khiển luồng nước đi tự động giữa hai engine
- Xử lý hoạt ảnh và hiển thị trò chơi AI vs AI
- Cung cấp các chức năng bật/tắt chế độ tự động và đặt lại ván cờ

3.  **boardSetup.js**
- Tạo giao diện bàn cờ
- Đặt các quân ở vị trí khởi đầu
- Quản lý hướng bàn cờ dựa trên màu của người chơi

4.  **engineCommunication.js**
- Tạo và quản lý tiến trình cho các tệp thực thi engine
- Gửi lệnh điều khiển đến engine.exe
- Phân tích và xử lý phản hồi từ engine

5.  **gameState.js**
- Duy trì trạng thái ván cờ hiện tại
- Theo dõi vị trí của tất cả quân cờ
- Lưu lịch sử các nước đi
- Giám sát các điều kiện kết thúc ván cờ (chiếu, chiếu hết, v.v.)

6.  **pieceMovement.js**
- Xử lý animation di chuyển quân trên bàn cờ
- Xử lý các nước đi đặc biệt như nhập thành và bắt tốt qua đường
- Thực thi nước đi và cập nhật trạng thái bàn cờ

7. **gameUI.js**
- Xử lý các logic UI chung của game như: hiện highlight khi ấn vào quân cờ, hiện kết quả thắng/thua/hòa,...

8. **promotionDialog.js**
- Hiện thông báo phong hậu cho người chơi và tự động phong hậu cho bot

9. **match.js**
- Kiểm tra xem trò chơi đã kết thúc chưa

10. **index.js**
- Đóng vai trò là điểm truy cập chính (entry point) cho tất cả các module trong thư mục, đảm nhiệm việc tập hợp và xuất các thành phần khác nhau của hệ thống.

## Thư mục `game` 
Thư mục này chứa mã nguồn lõi của engine cờ, bao gồm các quy tắc và thuật toán ở cấp độ thấp, hoàn toàn tách biệt với giao diện người dùng.
### Danh sách các thư mục con và modules:
1. **engine/** : bao gồm các chức năng cốt lõi của engine cờ vua
   - **engine.js**: Khởi tạo các thành phần cốt lõi của engine cờ 
   - **game.js**: Định nghĩa cấu trúc dữ liệu và quản lý trạng thái trò chơi
   - **benchmarking.js**: Đo thời gian cần thiết để thực hiện các tác vụ cụ thể như tạo nước đi, đánh giá vị trí,...
   - **perft.js**(performance test): Đếm số lượng vị trí có thể đạt được sau một số lượng nước đi nhất định từ một vị trí bắt đầu.

2. **bitboard/** Implement dạng bitboard của bàn cờ vua
    - **bit_boards.js**: Định nghĩa hằng số và cấu trúc cho biểu diễn bitboard 
    - **bit_operations.js**: Cung cấp các phép toán bit để thao tác bàn cờ một cách tối ưu
    - **conversions.js**: Chuyển đổi giữa các định dạng ký hiệu cờ khác nhau
    - **consts.js**: Tạo ra và quản lý các bảng dữ liệu định sẵn (precomputed tables) liên quan đến các đường thẳng trên bàn cờ

3. **pieces/** Bao gồm logic của từng quân cờ:
    - **bishop.js****king.js****knight.js**,... :  Định nghĩa cách di chuyển và bảng tấn công cho từng loại quân
    - Mỗi tệp chịu trách nhiệm sinh và kiểm tra nước đi hợp lệ của quân tương ứng

4. **moves/** Tạo và kiểm tra nước đi hợp lệ:
    - **attacks.js**: Xác định các ô đang bị tấn công
    - **move.js**: Định nghĩa cấu trúc và các cờ của nước đi
    - **movegen.js**: Sinh tất cả nước đi hợp lệ trong một vị trí
    - **execute_move.js**:  Áp dụng nước đi lên game state
    - **updates.js**: Cập nhật trạng thái trò chơi sau khi 1 nước đi được thực hiện
    - Các file còn lại: Xử lý logic nước đi của các quân tốt, xe, tượng, mã hậu, vua, xử lý logic nhập thành và bắt tốt qua sông

5. **fen/** (Forsyth-Edwards Notation):
    - **parse.js**: Phân tích chuỗi FEN để thiết lập vị trí bàn cờ ban đầu
    - **construct.js**: Chứa hàm `ConstructFEN`, có nhiệm vụ ngược lại với quá trình phân tích FEN (parsing). Cụ thể, nó chuyển đổi từ trạng thái trò chơi nội bộ (GameState) sang một chuỗi FEN chuẩn.

6. **positions/** - Xử lý các vị trí trên bàn cờ:
    - **zobrist_hashing.js**: Triển khai Zobrist hashing để so sánh vị trí một cách hiệu quả
    - **init.js**: Khởi tạo vị trí ban đầu cho game

7. **magic_board**: Magic Bitboards là một kỹ thuật tối ưu hóa phức tạp được sử dụng để tính toán nhanh chóng các nước đi hợp lệ cho quân tượng, xe và hậu. Nó sử dụng các phép nhân "ma thuật" (magic multiplication) và bảng tra cứu (lookup tables) để tăng tốc đáng kể việc tạo nước đi.
    - **magic_numbers.js**: Định nghĩa các số "ma thuật" được sử dụng trong phép tính
    - **occupancies.js**: Xử lý các bảng chiếm đóng (tức là các quân cờ trên đường đi)


## Ý tưởng chính của project:
Project sử dụng kiên trúc bitboard: Đây là nền tảng cốt lõi của động cơ cờ vua hiện đại, sử dụng các số 64-bit để đại diện cho bàn cờ và vị trí quân cờ:
    - **Hiệu suất cao**: Cho phép thực hiện nhiều phép tính trên bàn cờ chỉ với một vài phép toán bit.
    - **Biểu diễn hiệu quả**: Mỗi bitboard đại diện cho một loại quân hoặc một tính chất (như các ô bị tấn công).
    - **Tạo nước đi nhanh**: Kết hợp với Magic Bitboards để tạo nước đi nhanh chóng cho các quân dài (xe, tượng, hậu).

## Luồng hoạt động của project:
1. Các tệp khởi động  (`PvP.js` and `EvE.js`) sẽ khởi tạo engine cờ và đăng ký sự kiện DOM.
2. Khi DOM sẵn sàng, chúng sẽ gọi các mô-đun trong thư mục modules để khởi tạo chế độ chơi (người vs AI hoặc bot vs bot).
3. Các mô-đun ở cấp ứng dụng sẽ sử dụng trực tiếp các chức năng ở thư mục game để:
    - Sinh và xác thực nước đi hợp lệ
    - Thực thi nước đi
    - Kiểm tra điều kiện kết thúc ván cờ
4. Logic lõi trong thư mục game hoàn toàn không phụ thuộc vào giao diện, sử dụng biểu diễn bitboard để tăng hiệu năng tính toán.
5. Các mô-đun ứng dụng trong modules chịu trách nhiệm chuyển đổi giữa hành động của người dùng và engine, đồng thời cập nhật và hiển thị trạng thái trò chơi lên giao diện.
