export default async function handler(req, res) {
    // Дозволяємо лише POST-запити
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    try {
        const { contents } = req.body;

        if (!contents) {
            return res.status(400).json({ error: 'Contents are required' });
        }

        const googleResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contents }),
            }
        );

        const data = await googleResponse.json();

        if (!googleResponse.ok) {
            return res.status(googleResponse.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error in Gemini API proxy:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
