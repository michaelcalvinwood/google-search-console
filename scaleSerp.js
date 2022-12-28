require ('dotenv').config();
const axios = require('axios');


function fetchResults (query, google_domain = "google.com", device = "desktop") {
    // set up the request parameters
    const params = {
      api_key: process.env.SCALE_SERP_API_KEY,
      q: query,
      location: "New York,New York,United States",
      google_domain,
      gl: "us",
      hl: "en",
      device,
      output: "json",
      num: "100"
    }

    console.log(params);
    
    // make the http GET request to Scale SERP
    return axios.get('https://api.scaleserp.com/search', { params })
}

async function getQuery(query, google_domain = "google.com", device = "desktop") {
    let response;

    try {
        response = await fetchResults(query, google_domain, device);
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
//let result = getQuery('digital transformation');


