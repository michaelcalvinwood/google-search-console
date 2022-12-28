require('dotenv').config();
const axios = require('axios');

async function relatedKeywords (keyword) {

    const request = {
        url: 'https://api.keyword.io/related_keywords',
        method: 'get',
        params: {
            api_token:  process.env.KEYWORD_IO_API_KEY,
            q: keyword
        },
        headers: {
            'Accept-Encoding': '*'
        }
    }

    let response;

    try {
        response = await axios(request);
    } catch (e) {
        console.error(e);
        return false;
    }

    console.log(JSON.stringify(response.data, null, 4));
}

relatedKeywords('digital transformation');