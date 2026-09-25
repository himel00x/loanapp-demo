export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body || {};

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message required' });
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Missing BOT_TOKEN or CHAT_ID in env');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });

        const data = await tgRes.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ ok: false, error: data.description || 'Telegram error' });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Fetch error:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
}