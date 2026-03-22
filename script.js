// --- 1. CẤU HÌNH WEB APP URL ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwxGySySYeE0wsg-41K5lTQUYgL_beTxmCGagDfwQO1AUxLs_l8K4iGMgz-jKE9sxc/exec";

// --- 2. BIẾN TRẠNG THÁI ---
let selectedQuestions = []; 
let studentAnswers = [];    
let currentQuestionIndex = 0; 
let timeLeft = 1200; // 20 phút
let timerInterval;
let isSubmitted = false; 

// --- 3. HÀM BẮT ĐẦU THI ---
function startQuiz() {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentID').value.trim();

    if (!name || !id) {
        alert("Vui lòng nhập đủ Họ tên và Khóa!");
        return;
    }

    // Kiểm tra ngân hàng câu hỏi (giả định questionBank đã được load từ file data.js)
    if (typeof questionBank === 'undefined' || questionBank.length < 30) {
        alert("Lỗi: Dữ liệu câu hỏi chưa sẵn sàng hoặc không đủ 30 câu!");
        return;
    }

    // Reset trạng thái & Trộn câu hỏi
    isSubmitted = false;
    selectedQuestions = [...questionBank].sort(() => 0.5 - Math.random()).slice(0, 30);
    studentAnswers = [];
    timeLeft = 1200; 

    // Hiển thị giao diện
    document.getElementById('start-screen').style.display = 'none';
    const header = document.getElementById('caee-header') || document.querySelector('.caee-header');
    if(header) header.style.display = 'flex';
    document.getElementById('quiz-screen').style.display = 'grid';

    document.getElementById('student-id-display').innerText = `Học viên: ${name} - Khóa: ${id}`;

    generateNavigationGrid();
    showQuestion(0);
    startTimer();
}

// --- 4. HÀM HIỂN THỊ CÂU HỎI ---
function showQuestion(index) {
    currentQuestionIndex = index;
    const q = selectedQuestions[index];
    const content = document.getElementById('quiz-content');
    
    // Tìm đáp án đã chọn của câu này (nếu có)
    const stored = studentAnswers.find(item => item.qIndex === index);
    const selectedText = stored ? stored.selectedAnswer : null;

    let optionsHtml = "";
    q.options.forEach((opt) => {
        const isSelected = (opt === selectedText);
        // Sử dụng encodeURIComponent hoặc xử lý chuỗi để tránh lỗi ký tự đặc biệt trong HTML attribute
        optionsHtml += `
            <div class="option-item ${isSelected ? 'selected' : ''}" 
                 onclick="selectAnswer(this, ${index}, \`${opt.replace(/`/g, '\\`')}\`)">
                <div class="option-label">${opt}</div>
            </div>`;
    });

    content.innerHTML = `
        <div class="question-header"> 
            <span class="subject-badge">BÀI THI SÁT HẠCH</span>
            <span class="q-count">Câu ${index + 1}/${selectedQuestions.length}</span> 
        </div>
        <div class="question-text">${q.question}</div>
        <div class="options-group">${optionsHtml}</div>
        <div class="navigation-btns">
            <button class="btn-nav btn-prev" onclick="prevQuestion()" 
                ${index === 0 ? 'style="visibility:hidden;"' : ''}>‹ TRƯỚC</button>
            <button class="btn-nav btn-next" onclick="nextQuestion()">
                ${index === selectedQuestions.length - 1 ? 'NỘP BÀI ›' : 'TIẾP ›'}
            </button>
        </div>
    `;
    updateGridStatus(index);
}

// --- 5. HÀM XỬ LÝ CHỌN ĐÁP ÁN ---
function selectAnswer(element, qIndex, answer) {
    if (isSubmitted) return;

    const existingIndex = studentAnswers.findIndex(item => item.qIndex === qIndex);
    if (existingIndex !== -1) {
        studentAnswers[existingIndex].selectedAnswer = answer;
    } else {
        studentAnswers.push({ qIndex: qIndex, selectedAnswer: answer });
    }

    // Cập nhật UI ngay lập tức
    const options = element.parentElement.querySelectorAll('.option-item');
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    updateGridStatus(qIndex);
}

// --- 6. HÀM ĐIỀU HƯỚNG ---
function nextQuestion() {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    } else {
        submitQuiz(); // Nếu ở câu cuối, bấm "Tiếp" sẽ kích hoạt nộp bài
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

// --- 7. TẠO GRID ---
function generateNavigationGrid() {
    const grid = document.getElementById('nav-grid');
    grid.innerHTML = "";
    selectedQuestions.forEach((_, i) => {
        const item = document.createElement('div');
        item.classList.add('grid-item');
        item.id = `grid-item-${i}`;
        item.innerText = i + 1;
        item.onclick = () => showQuestion(i);
        grid.appendChild(item);
    });
}

// --- 8. CẬP NHẬT MÀU GRID ---
function updateGridStatus(currentIndex) {
    selectedQuestions.forEach((_, i) => {
        const item = document.getElementById(`grid-item-${i}`);
        if (!item) return;
        
        item.classList.remove('active', 'answered');
        if (studentAnswers.some(ans => ans.qIndex === i)) {
            item.classList.add('answered');
        }
        if (i === currentIndex) {
            item.classList.add('active');
        }
    });
}

// --- 9. ĐỒNG HỒ ---
function startTimer() {
    clearInterval(timerInterval); // Xóa timer cũ nếu có
    timerInterval = setInterval(() => {
        timeLeft--;
        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        const timerElement = document.getElementById('timer');
        if(timerElement) {
            timerElement.innerText = `${min}:${sec < 10 ? '0' : ''}${sec}`;
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Hết giờ làm bài! Hệ thống tự động nộp bài.");
            submitQuiz(true); // Tham số true để bỏ qua Confirm
        }
    }, 1000);
}

// --- 10. NỘP BÀI ---
async function submitQuiz(force = false) {
    if (isSubmitted) return;
    if (!force && !confirm("Bạn có chắc chắn muốn nộp bài?")) return;

    isSubmitted = true;
    clearInterval(timerInterval);

    // Tính điểm
    let score = 0;
    studentAnswers.forEach(ans => {
        const originalQuestion = selectedQuestions[ans.qIndex];
        if (ans.selectedAnswer === originalQuestion.answer) score++;
    });

    const status = score >= 25 ? "ĐẠT" : "KHÔNG ĐẠT";
    alert(`Kết quả: ${score}/30 câu - Trạng thái: ${status}`);

    // Hiển thị trạng thái đang gửi
    const submitBtn = document.querySelector('.btn-submit');
    if (submitBtn) {
        submitBtn.innerText = "ĐANG GỬI...";
        submitBtn.disabled = true;
    }

    const payload = {
        name: document.getElementById('studentName').value,
        id: document.getElementById('studentID').value,
        score: score,
        status: status,
        details: JSON.stringify(studentAnswers) // Gửi thêm chi tiết nếu cần
    };

    // Gửi dữ liệu qua fetch
    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Lưu ý: no-cors không đọc được response trả về
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        alert("Dữ liệu đã được gửi đi! Hệ thống sẽ khởi động lại.");
        location.reload();
    } catch (error) {
        console.error('Lỗi khi nộp bài:', error);
        alert("Có lỗi kết nối, nhưng bài thi của bạn đã được ghi nhận cục bộ.");
        location.reload();
    }
}
