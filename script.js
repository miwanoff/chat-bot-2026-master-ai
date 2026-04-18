// --- КОНФІГУРАЦІЯ ---
const SYSTEM_PROMPT = ""; // Береться з .env на сервері

let history = [];

// --- UI Logic ---
document.getElementById("chatbot").addEventListener("click", function () {
    this.classList.toggle("show");
});

// stopPropagation() equivalent for the message and input area to prevent toggle on interaction
["answers", "question", "ok"].forEach(id => {
    document.getElementById(id).addEventListener("click", function (e) {
        e.stopPropagation();
    });
});

// Додавання повідомлення в чат
function displayMessage(role, text) {
    const className = role === 'user' ? 'human_answ' : 'bot_answ';
    document.getElementById("answers").insertAdjacentHTML('beforeend', `<div class="${className}">${text}</div>`);
    scrollToBottom();
}

function showLoading() {
    document.getElementById("answers").insertAdjacentHTML('beforeend', `<div class="bot_answ loading-indicator" id="loading">AI Лаб думає...</div>`);
    scrollToBottom();
}

function hideLoading() {
    const loading = document.getElementById("loading");
    if (loading) loading.remove();
}

function scrollToBottom() {
    const chatBot = document.getElementById("chatbot");
    chatBot.scrollTo({
        top: chatBot.scrollHeight,
        behavior: 'smooth'
    });
}

// Ініціалізація чату
function initializeChat() {
    history = [];
    
    displayMessage('model', "Привіт! Я помічник AI Лаб. Чим можу допомогти? Запитай мене про наші курси, місію або як почати вчитися кодувати!");
}

// Обробка відправки
async function handleSend() {
    const questionInput = document.getElementById("question");
    const q = questionInput.value.trim();
    if (q === "") return;

    questionInput.value = "";
    displayMessage('user', q);
    showLoading();

    // Додаємо в історію
    history.push({
        role: "user",
        parts: [{ text: q }]
    });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents: history }),
        });

        if (!response.ok) {
            let errorDetail = 'Помилка сервера';
            try {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                const errorObj = errorData.error || errorData;
                errorDetail = typeof errorObj === 'object' 
                    ? (errorObj.message || JSON.stringify(errorObj)) 
                    : errorObj;
            } catch (e) {
                const textError = await response.text().catch(() => '');
                console.error('API Error Text:', textError);
                errorDetail = `Статус ${response.status}: ${textError || 'Невідома помилка'}`;
            }
            throw new Error(errorDetail);
        }

        const data = await response.json();
        const botText = data.candidates[0].content.parts[0].text;

        // Додаємо відповідь в історію
        history.push({
            role: "model",
            parts: [{ text: botText }]
        });

        hideLoading();
        displayMessage('model', botText);
    } catch (error) {
        console.error("Помилка при запиті до API:", error);
        hideLoading();
        displayMessage('model', 'Ой, сталася помилка. Спробуйте, будь ласка, ще раз.');
    }
}

document.getElementById("ok").addEventListener("click", handleSend);

document.getElementById("question").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        handleSend();
        event.preventDefault();
    }
});

// Запуск при завантаженні
document.addEventListener("DOMContentLoaded", function() {
    initializeChat();
});
