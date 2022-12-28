require ('dotenv').config();
const axios = require('axios');


function fetchResults (query, searchType = 'news', device = "desktop") {
    // set up the request parameters
     
    let params = {
      api_key: process.env.SCALE_SERP_API_KEY,
      q: query,
      location: "New York,New York,United States",
      gl: "us",
      hl: "en",
      device,
      output: "json",
      num: "100"
    }

    if (searchType) params.search_type = searchType;

    console.log(params);
 
    // make the http GET request to Scale SERP
    return axios.get('https://api.scaleserp.com/search', { params })
}

async function getQuery(query, searchType = 'news', device = "desktop") {
    let response;

    try {
        response = await fetchResults(query, searchType, device);
        console.log(response.data);
        return response.data;
    } catch (e) {
        console.error(e);
        return false;
    }
}


/*
    IMPORTANT: ADD LAST HOUR AS PARAMETER
*/
let result = getQuery('digital economy');


