const {google} = require('googleapis');
const {JWT} = require('google-auth-library');
const searchconsole = google.searchconsole('v1');
const keys = require('./clientSecret.json');
require('dotenv').config();

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

const searchConsoleQuery = async () => {
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

const analyticsQuery = async () => {
  const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
  const jwt = new google.auth.JWT(process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY, scopes);
  const viewId = '22567948';
  const response = await jwt.authorize()
  const result = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + viewId,
    'start-date': '30daysAgo',
    'end-date': 'today',
    'metrics': 'ga:pageviews'
  })

  console.dir(result.data.rows[0][0]);

  let test = JSON.stringify(result.data.rows, null, 4);

  console.log(test);

}


analyticsQuery();