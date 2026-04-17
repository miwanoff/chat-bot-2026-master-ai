//  Підключення Gemini API SDK 
 
        import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

        // --- КОНФІГУРАЦІЯ: ВАШІ ДАНІ ---

        // 1. ВАШ КЛЮЧ API
        // Отримуємо з екологічних змінних (необхідний збирач типу Vite або Webpack)
        const API_KEY = import.meta.env?.VITE_API_KEY || "";

        // 2. ІНФОРМАЦІЯ ПРО ВАШ СТАРТАП ДЛЯ БОТА
        const SYSTEM_PROMPT = import.meta.env?.VITE_SYSTEM_PROMPT || "";

        // 3. НАЛАШТУВАННЯ МОДЕЛІ
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
        });

        // --- КІНЕЦЬ КОНФІГУРАЦІЇ ---

        const chatMessages = document.getElementById('chat-messages');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        
        let chat;

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
            chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: `Запам'ятай інструкцію: ${SYSTEM_PROMPT}\n\nТепер ти готовий відповідати на запитання.` }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Добре, я готовий. Я – дружній та експертний чат-бот-помічник для стартапу \"AI Лаб\"." }],
                    }
                ],
                generationConfig: {
                  maxOutputTokens: 1000,
                },
            });
            
            chatMessages.innerHTML = '';
            displayMessage('model', "Привіт! Я помічник AI Лаб. Чим можу допомогти? Запитай мене про наші курси, місію або як почати вчитися кодувати!");
        }
        
        // Обробка відправки форми
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = chatInput.value.trim();

            if (!userMessage) return;

            if (!API_KEY) {
                displayMessage('model', 'Помилка: API-ключ не вказано. Будь ласка, додайте свій ключ у змінну API_KEY у коді.');
                return;
            }
            
            // Відображаємо повідомлення користувача
            displayMessage('user', userMessage);
            chatInput.value = '';
            showLoading();

            try {
                // Використовуємо існуючу сесію чату для надсилання повідомлення
                const result = await chat.sendMessage(userMessage);
                const response = result.response;
                const text = response.text();

                // Відображаємо відповідь моделі
                hideLoading();
                displayMessage('model', text);

            } catch (error) {
                console.error("Помилка при запиті до Gemini API:", error);
                hideLoading();
                displayMessage('model', 'Ой, сталася помилка. Спробуйте, будь ласка, ще раз.');
            }
        });

        // Запускаємо чат при завантаженні сторінки
        initializeChat();

   