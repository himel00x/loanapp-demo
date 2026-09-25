export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) return res.status(500).json({ error: 'Server configuration error' });

    try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const bodyBuffer = Buffer.concat(chunks);

        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': req.headers['content-type'] || 'multipart/form-data' },
            body: bodyBuffer
        });

        const data = await tgRes.json();
        if (!data.ok) return res.status(500).json({ ok: false, error: data.description });
        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
    }
}
