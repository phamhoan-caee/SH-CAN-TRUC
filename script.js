// --- 1. CẤU HÌNH WEB APP URL ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwxGySySYeE0wsg-41K5lTQUYgL_beTxmCGagDfwQO1AUxLs_l8K4iGMgz-jKE9sxc/exec";

// --- 2. BIẾN TRẠNG THÁI ---
let selectedQuestions = []; 
let studentAnswers = {}; // Dùng Object để lưu cho nhanh: {index: "đáp án"}
let currentQuestionIndex = 0; 
let timeLeft = 1200; // 20 phút
let timerInterval;
let isSubmitted = false; 

/* --- 4. CẤU TRÚC MÀN HÌNH THI (MAIN EXAM PAGE) --- */
#quiz-screen {
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 280px; /* Cột câu hỏi rộng, cột lưới hẹp */
    gap: 20px;
    max-width: 1300px;
    margin-left: auto;
    margin-right: auto;
}

/* Vùng câu hỏi */
#quiz-content {
    background: #ffffff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.subject-badge { background: #e6f0fa; color: var(--caee-blue); padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.q-count { color: #999; font-size: 0.85rem; }

.question-text { font-size: 1.1rem; font-weight: bold; margin-bottom: 25px; color: #222; }

/* Tùy chỉnh ô đáp án */
.option-item {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 12px;
}
.option-item:hover { background-color: #fafafa; border-color: #ddd; }
.option-item.selected { background-color: #e6f0fa; border-color: var(--caee-blue); }
.option-label { color: #555; font-size: 0.95rem; flex: 1; }

/* Vùng nút điều hướng */
.navigation-btns { display: flex; gap: 10px; margin-top: 30px; }
.btn-nav {
    padding: 8px 18px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: bold;
    cursor: pointer;
    transition: var(--transition);
    border: 1px solid transparent;
}
.btn-prev { background: white; color: #999; border-color: #eee; }
.btn-prev:hover { border-color: #ccc; color: #777; }
.btn-next { background: var(--btn-blue); color: white; margin-left: auto; } /* Đẩy nút Tiếp sang phải */
.btn-next:hover { background: #0044cc; }

/* --- 5. CỘT SƠ ĐỒ CÂU HỎI (RIGHT SIDEBAR) --- */
.sidebar-right { display: flex; flex-direction: column; gap: 20px; }

.question-grid-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
}
.sidebar-title { font-size: 0.85rem; font-weight: bold; color: #666; margin-bottom: 15px; }

/* Lưới 5x6 */
.q-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
}
.grid-item {
    background: #fdfdfd;
    border: 1px solid #eee;
    color: var(--caee-blue);
    height: 38px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 0.8rem;
    cursor: pointer;
    transition: var(--transition);
}
.grid-item:hover { border-color: var(--caee-blue); }
.grid-item.answered { background: var(--caee-blue); color: white; border-color: var(--caee-blue); }
.grid-item.active { border: 2px solid var(--btn-orange); background: white; color: var(--caee-blue); }

/* Vùng trạng thái màu */
.status-legend-card {
    background: white;
    padding: 15px;
    border-radius: 8px;
    font-size: 0.8rem;
    box-shadow: var(--shadow-sm);
}
.legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-green { background-color: var(--caee-blue); } /* Màu xanh trong hình */
.dot-orange { background-color: var(--btn-orange); }

/* Nút nộp bài */
.btn-submit {
    background-color: #ff3333; /* Đỏ rực rỡ */
    color: white;
    border: none;
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    font-weight: bold;
    text-transform: uppercase;
    cursor: pointer;
    transition: var(--transition);
}
.btn-submit:hover { background-color: #cc0000; }

/* --- 6. HỖ TRỢ ĐIỆN THOẠI (RESPONSIVE) --- */
@media (max-width: 992px) {
    #quiz-screen { grid-template-columns: 1fr; } /* Chuyển thành 1 cột */
    .welcome-container { flex-direction: column; width: 95%; }
    .welcome-left, .welcome-right { width: 100%; padding: 25px; }
    .header-info { gap: 10px; }
    .student-id-display { font-size: 0.75rem; padding-right: 10px; }
    .timer-box { font-size: 0.95rem; padding: 4px 10px; }
}
/* --- Căn giữa tiêu đề (Thêm vào cuối file) --- */
.welcome-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
 
.school-name {
    width: 100%;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 2px;
}

.faculty-name {
    width: 100%;
    font-weight: bold;
    color: #0056b3;
    margin-top: 5px;
    margin-bottom: 20px;
    text-transform: uppercase;
}
