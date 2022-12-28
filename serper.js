const axios = require('axios');

let data = JSON.stringify({
    "q": "apple inc",
    "gl": "us",
    "hl": "en",
    "autocorrect": true
  });
  
  let config = {
    method: 'post',
    url: 'https://google.serper.dev/search',
    headers: { 
      'X-API-KEY': 'f32b854b304929c97e5cc3a77c27e9c132188236', 
      'Content-Type': 'application/json'
    },
    data : data
  };
  
  axios(config)
  .then((response) => {
    console.log(JSON.stringify(response.data, null, 4));
  })
  .catch((error) => {
    console.log(error);
  });