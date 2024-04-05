const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist/stock-search/browser')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/stock-search/browser/index.html'));
  });

const uri = "mongodb+srv://sasha21sp:Sasha%40123@cluster0.d7sg7vj.mongodb.net?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const db = client.db('HW3');

// MongoDb Connection Test

async function connectToMongoDB(){
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error){
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
}
connectToMongoDB();

async function initializePortfolio() {
    const collection = db.collection('portfolio');

    const initialPortfolio = {
        userId: 'sasha21sp',
        portfolio: {
            wallet: 25000.00,
            stockItems: []
        }
    };

    await collection.insertOne(initialPortfolio);
    console.log('Portfolio initialized for userId: sasha21sp');

}

async function initializeWatchlist() {
    const collection = db.collection('watchlist');

    const initialWatchlist = {
        userId: 'sasha21sp',
        watchlist: []
    };

    await collection.insertOne(initialWatchlist);
    console.log('Watchlist initialized for userId: sasha21sp');

}

initializePortfolio();
initializeWatchlist();


// Get Portfolio
app.get('/get/portfolio', async(req, res) => {
    try{
        console.log("get Portfolio")
        const userId = req.query.userId;
        const portfolio = await db.collection('portfolio').findOne({ userId: userId});
        console.log(portfolio);
        res.json(portfolio);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update Portfolio
app.put('/update/portfolio', async (req, res) => {
    try{
        console.log("Update Portfolio")
        const userId = req.body.userId;
        const portfolio = req.body.portfolio;
        await db.collection('portfolio').updateOne(
            { "userId": userId },
            { $set: { "portfolio": portfolio }}
        );
        res.json({ message: "Portfolio updated" });

    } catch (error){
        res.status(500).send(error.message);
    }
}); 

// Get Watchlist
app.get('/get/watchlist', async(req, res) => {
    try{
        console.log("Get Watchlist")
        const userId = req.query.userId;
        const watchlist = await db.collection('watchlist').findOne({ userId: userId});
        res.json(watchlist);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Update Watchlist
app.put('/update/watchlist', async (req, res) => {
    try{
        console.log("Update Watchlist")
        const userId = req.body.userId;
        const watchlist = req.body.watchlist;
        await db.collection('watchlist').updateOne(
            { "userId": userId },
            { $set: { "watchlist": watchlist }}
        );
        res.json({ message: "Watchlist updated" });

    } catch (error){
        res.status(500).send(error.message);
    }
}); 

// Define a route for the root URL
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

const API_KEYS = {
    finnhub: 'cn44bdhr01qtsta4ld5gcn44bdhr01qtsta4ld60',
    polygon:'jAXx8N2t0RgWpvPHjWWLKaj8PmOkhgVw'
};

app.get('/company', async (req, res) => {
    const ticker = req.query.ticker;
    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${API_KEYS.finnhub}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/autocomplete', async (req, res) => {
    const symbol = req.query.symbol;
    const url = `https://finnhub.io/api/v1/search?q=${symbol}&token=${API_KEYS.finnhub}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        if(data.result){
            const filteredData = data.result.filter(company => 
                !company.displaySymbol.includes('.') && company.type === 'Common Stock');

            res.json({...data, result: filteredData});
        } else{
            res.json(data);
        }
    
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/quote', async (req, res) => {
    const ticker = req.query.ticker;
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEYS.finnhub}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


app.get('/news', async (req, res) => {
    const ticker = req.query.ticker;

    const currentDate = new Date();
    const pastDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Subtracting 7 days in milliseconds
    const formattedPastDate = pastDate.toISOString().split('T')[0];
    const formattedCurrentDate = currentDate.toISOString().split('T')[0];

    const url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${formattedPastDate}&to=${formattedCurrentDate}&token=${API_KEYS.finnhub}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


app.get('/recommendation', async (req, res) => {
    const ticker = req.query.ticker;

    const url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${API_KEYS.finnhub}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/insider', async (req, res) => {
    const ticker = req.query.ticker;

    const url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=2022-01-01&token=${API_KEYS.finnhub}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/peers', async (req, res) => {
    const ticker = req.query.ticker;

    const url = `https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${API_KEYS.finnhub}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


app.get('/earnings', async (req, res) => {
    const ticker = req.query.ticker;

    const url = `https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${API_KEYS.finnhub}`;
    try{
        const response = await fetch(url);
        const data = await response.json();

        // Replace null values with 0 in the response data
        data.forEach(item => {
            Object.keys(item).forEach(key => {
                if (item[key] === null) {
                    item[key] = 0;
                }
            });
        });

        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/hourlyChart', async (req, res) => {
    const ticker = req.query.ticker;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/hour/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${API_KEYS.polygon}`;
    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/histChart', async (req, res) => {
    const ticker = req.query.ticker;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${API_KEYS.polygon}`;

    try{
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error){
        console.error('Error fetching data: ', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});