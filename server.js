const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// TikTok ඩවුන්ලෝඩ් API එපොයින්ට් එක (Endpoint)
app.post('/api/download/tiktok', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'කරුණාකර TikTok URL එකක් ලබා දෙන්න.' });
    }

    try {
        const options = {
            method: 'GET',
            url: 'https://tikwm.com/api/',
            params: { url: url }
        };

        const response = await axios.request(options);
        const data = response.data;

        if (data.code === 0) {
            const videoData = {
                title: data.data.title,
                cover: data.data.cover,
                // වෝටර්මාර්ක් නැති වීඩියෝ ලින්ක් එක
                videoNoWatermark: data.data.play, 
                // ඕඩියෝ (MP3) ලින්ක් එක
                audio: data.data.music 
            };

            return res.status(200).json({
                success: true,
                data: videoData
            });
        } else {
            return res.status(400).json({ success: false, error: 'වීඩියෝව ලබා ගැනීමට නොහැකි විය. URL එක පරීක්ෂා කරන්න.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'සර්වර් දෝෂයක් සිදු විය.' });
    }
});

// ලෝකල් ටෙස්ට් කිරීමට (Vercel වලට මෙය ස්වයංක්‍රීයව ක්‍රියාත්මක වේ)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
