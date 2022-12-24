const {google} = require('googleapis');
const {JWT} = require('google-auth-library');
const searchconsole = google.searchconsole('v1');
 const keys = require('./clientSecret.json');
 console.log(keys);
 const request = {
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters','https://www.googleapis.com/auth/webmasters.readonly'],
  };
console.log(request);
 const client = new JWT(request);
 google.options({auth: client});
// Check to see which properties are accessible with these credentials

const doStuff = async () => {
    const resSiteList = await searchconsole.sites.list({});
    console.log(resSiteList.data);

    const resSearchAnalytics = await searchconsole.searchanalytics.query({
        // The site's URL, including protocol. For example: `http://www.example.com/`.
        siteUrl: 'https://www.pymnts.com/',
        requestBody: {
             "endDate": "2022-12-24",
             "startDate": "2022-03-01",
             "dimensions": ["date"]
        },
      });
      
      console.log(resSearchAnalytics.data.rows);
}

doStuff();