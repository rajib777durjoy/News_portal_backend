import express from 'express';
import cron from 'node-cron';
import cors from 'cors';
import dotenv from 'dotenv';
import { collection, DBConnection } from './DBConnect.js';
import axios from 'axios';
dotenv.config();


const app = express();
const port = process.env.PORT || 8000;
app.use(cors());

// use node corn for 1 hours after refresh // 
// 0 * * * * one min         0 * * * * one hour

cron.schedule('0 * * * *', async () => {
    console.log('Fetching latest news...');
    console.log('API Key:', process.env.NEWS_API_KEY);
    try {
        const response = await axios.get(`https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}`);
        const articles = response.data.results;

        for (const article of articles) {
            await collection.updateOne(
                { article_id: article.article_id }, // unique identifier
                {
                    $set: {
                        title: article.title,
                        link: article.link,
                        content: article.content,
                        description: article.description || '',
                        pubDate: article.pubDate,
                        language: article.language,
                        country: article.country || [],
                        category: article.category || [],
                        author: article.creator ? article.creator.join(', ') : '',
                        datatype: article.datatype || 'News',
                        source: article.source_id || '',
                        image_url: article.image_url || '',
                        video_url: article.video_url || null,
                        fetched_at: article.fetched_at,
                        duplicate: article.duplicate || false,
                    }
                },
                { upsert: true }
            );
        }

        console.log(`Inserted/Updated ${articles.length} articles`);
    } catch (err) {
        console.error('Error fetching news:', err.message);
    }
})


app.get('/', async (req, res) => {

    res.send("server is running")
})
app.get('/api/newsList', async (req, res) => {
    const GetNewsList = await collection.find().toArray();

    if (GetNewsList.length === 0) {
        return res.status(400).send({ message: 'news list not found !' })
    }
    res.send(GetNewsList)
})

app.patch("/api/newsSearch", async (req, res) => {
    try {
        
        const { text, startDate, endDate } = req.query;

       
        let filter = {};

        // Text search on title or description
        if (text) {
            filter.$or = [
                { title: { $regex: text, $options: "i" } }, 
                { description: { $regex: text, $options: "i" } },
            ];
        }

        // Date range filter
        if (startDate || endDate) {
            filter.pubDate = {};
            if (startDate) filter.pubDate.$gte = new Date(startDate);
            if (endDate) filter.pubDate.$lte = new Date(endDate);
        }

        // Query your MongoDB collection
        const articles = await db.collection("news").find(filter).toArray();

        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(port, () => {
    DBConnection()
    console.log(`Example app listening on port ${port}`)
})
