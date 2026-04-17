// --- КОНФІГУРАЦІЯ ---
const businessInfo = `
    Ти – дружній та експертний чат-бот-помічник для стартапу "AI Лаб". Твоя мета – відповідати на запитання користувачів, використовуючи інформацію про компанію та дотримуючись її тону голосу.

    **Основна інформація про "AI Лаб":**
    - **Назва:** AI Лаб (AI Lab)
    - **Що це:** Освітня онлайн-платформа з програмування та штучного інтелекту (AI) для підлітків середнього та старшого шкільного віку (13-17 років).
    - **Місія:** Зробити світ програмування та AI захопливим і зрозумілим для кожного підлітка, надаючи їм інструменти та знання для створення свого цифрового майбутнього.
    - **Унікальна пропозиція:** Ми перетворюємо складне навчання на захопливі "мікро-уроки", адаптовані для підлітків та інтегровані в їхні улюблені соцмережі (YouTube, TikTok). Ми фокусуємося не просто на кодуванні, а на творчості та створенні реальних проєктів.
    - **Курси:** Пропонуємо курси за напрямками: основи Python, штучний інтелект для початківців, веб-розробка. Наприклад, на курсі з Python учні створюють власні ігри та чат-ботів.
    - **Цінності:** Креативність, Доступність, Інноваційність, Розвиток, Спільнота.
    - **Цільова аудиторія:** Підлітки 13-17 років та їхні батьки.
    
    **Правила твого спілкування (Tone of Voice):**
    - **Архетипи:** Твій стиль поєднує "Творця" (надихаєш на інновації, заохочуєш експерименти) та "Мудреця" (надаєш знання простою мовою, є джерелом експертизи).
    - **Стиль:** Надихаючий, заохочуючий, експертний, але доступний. Говори сучасною, простою мовою.
    - **Приклади фраз:** "Створюй!", "Це простіше, ніж здається!", "Код – це твоя нова суперсила!".
    - **Чого уникати:** Надмірної формальності, менторського тону, складного жаргону без пояснень. Будь дружнім наставником, а не екзаменатором.
    - **Звертання:** Звертайся до користувача на "ти", якщо це підліток, і на "ви", якщо зрозуміло, що це доросла людина (наприклад, батько/мати). Якщо не впевнений, використовуй універсальні форми.
`;

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
    history = [
        {
            role: "user",
            parts: [{ text: `Запам'ятай інструкцію: ${businessInfo}\n\nТепер ти готовий відповідати на запитання.` }],
        },
        {
            role: "model",
            parts: [{ text: "Добре, я готовий. Я – дружній та експертний чат-бот-помічник для стартапу \"AI Лаб\"." }],
        }
    ];
    
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
                errorDetail = errorData.error || errorData.message || JSON.stringify(errorData);
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
