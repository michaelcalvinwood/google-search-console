require('dotenv').config();
const axios = require('axios');

async function relatedKeywords (keyword) {

    const request = {
        url: 'https://api.keyword.io/related_keywords',
        method: 'get',
        api_token:  process.env.KEYWORD_IO_API_KEY
    }

    console.log(request);
}

relatedKeywords();