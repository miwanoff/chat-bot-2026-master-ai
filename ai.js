// --- КОНФІГУРАЦІЯ ---

// ІНФОРМАЦІЯ ПРО ВАШ СТАРТАП ДЛЯ БОТА
const SYSTEM_PROMPT = import.meta.env?.VITE_SYSTEM_PROMPT || "";

// --- КІНЕЦЬ КОНФІГУРАЦІЇ ---

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

let history = [];

// Функція для відображення повідомлення в інтерфейсі
function displayMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role === 'user' ? 'user-message' : 'model-message');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Функція для відображення індикатора завантаження
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'loading-indicator');
    loadingDiv.id = 'loading';
    loadingDiv.textContent = 'AI Лаб думає...';
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
}

// Функція для видалення індикатора завантаження
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Прокрутка до останнього повідомлення
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Ініціалізація чату: створення сесії та відображення початкового привітання
function initializeChat() {
    history = [
        {
            role: "user",
            parts: [{ text: `Запам'ятай інструкцію: ${SYSTEM_PROMPT}\n\nТепер ти готовий відповідати на запитання.` }],
        },
        {
            role: "model",
            parts: [{ text: "Добре, я готовий. Я – дружній та експертний чат-бот-помічник для стартапу \"AI Лаб\"." }],
        }
    ];
    
    chatMessages.innerHTML = '';
    displayMessage('model', "Привіт! Я помічник AI Лаб. Чим можу допомогти? Запитай мене про наші курси, місію або як почати вчитися кодувати!");
}

// Обробка відправки форми
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();

    if (!userMessage) return;

    // Відображаємо повідомлення користувача
    displayMessage('user', userMessage);
    chatInput.value = '';
    showLoading();

    // Додаємо повідомлення користувача в історію
    history.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        // Запит до нашого серверного обробника (Vercel Serverless Function)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents: history }),
        });

        if (!response.ok) {
            throw new Error('Помилка сервера');
        }

        const data = await response.json();
        
        // Витягуємо текст відповіді з структури Gemini API
        const botText = data.candidates[0].content.parts[0].text;

        // Додаємо відповідь бота в історію
        history.push({
            role: "model",
            parts: [{ text: botText }]
        });

        // Відображаємо відповідь моделі
        hideLoading();
        displayMessage('model', botText);

    } catch (error) {
        console.error("Помилка при запиті до API:", error);
        hideLoading();
        displayMessage('model', 'Ой, сталася помилка. Спробуйте, будь ласка, ще раз.');
    }
});

// Запускаємо чат при завантаженні сторінки
initializeChat();
