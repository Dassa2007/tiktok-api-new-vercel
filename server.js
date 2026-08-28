const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 1. TikTok දත්ත සහ විවිධ කොලිටි ලින්ක් ලබා ගැනීම
app.post('/api/download/tiktok', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'කරුණාකර TikTok URL එකක් ලබා දෙන්න.' });
    }

    try {
        const options = {
            method: 'GET',
            url: 'https://tikwm.com/api/',
            params: { url: url, hd: 1 } // HD දත්තත් සමඟ ඉල්ලීම
        };

        const response = await axios.request(options);
        const data = response.data;

        if (data.code === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    title: data.data.title,
                    cover: data.data.cover,
                    videoNormal: data.data.play,      // සාමාන්‍ය කොලිටි ලින්ක් එක (SD)
                    videoHD: data.data.hdplay || data.data.play // HD කොලිටි ලින්ක් එක (නැත්නම් සාමාන්‍ය එකම)
                }
            });
        } else {
            return res.status(400).json({ success: false, error: 'වීඩියෝව ලබා ගැනීමට නොහැකි විය.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'සර්වර් දෝෂයක් සිදු විය.' });
    }
});

// 2. කොලිටිය අනුව Fast Direct Download කරවන Proxy API එක
app.get('/api/proxy-download', async (req, res) => {
    const videoUrl = req.query.url;
    const quality = req.query.q || 'hd';
    
    if (!videoUrl) {
        return res.status(400).send('Video URL is missing');
    }

    try {
        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        });

        res.setHeader('Content-Disposition', `attachment; filename="tiktok-${quality}-video.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Download failed');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
