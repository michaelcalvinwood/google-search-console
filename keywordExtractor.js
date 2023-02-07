const rake = require('node-rake');
const fs = require('fs');

const stopWordList = fs.readFileSync('./smartStopList.txt', { encoding: 'utf8' });
const stopwords = stopWordList.split("\n");

const opts = {stopwords};

let text = `A class-action lawsuit aiming to represent 1 million FTX customers has been filed. The suit has been filed against the bankrupt cryptocurrency exchange and former executives, including founder and former CEO Sam Bankman-Fried, Reuters reported Tuesday (Dec. 27). It aims to get a declaration that FTX customers in the United States and other countries are the owners of the digital assets held by FTX and Alameda Research, the report said. In addition, if the court should determine that the assets are FTX property, then the suit aims to get a ruling that the customers should be repaid before other creditors, per the report. “Customer class members should not have to stand in line along with secured or general unsecured creditors in these bankruptcy proceedings just to share in the diminished estate assets of the FTX Group and Alameda,” the complaint said, according to the report. This news came on the same day that it was reported that the question of the ownership of one of FTX’s most valuable, liquid assets — its 56 million shares of Robinhood stock — has become more complicated. Bankman-Fried told a court before he was arrested in the Bahamas that he and FTX co-founder Gary Wang borrowed $546 million from Alameda Research to capitalize Emergent Fidelity Technologies, which later bought the shares in Robinhood. The ownership of these shares was already in dispute, with Bloomberg reporting Dec. 22 that both crypto lending platform BlockFi and FTX claim to own them and both want to use the shares to recover from their debts. “The Robinhood shares played a prominent role in the run-up to FTX’s implosion,” the report said. “They were touted in a spreadsheet as being some of the crypto empire’s most valuable, liquid assets amid efforts to drum up rescue financing.” As PYMNTS reported Nov. 21, FTX has said it owes its 50 biggest creditors more than $3 billion. The top 50 claims by FTX creditors range from $21 million at the low end to over $250 million at the high end. In the United States, companies are required to disclose information about their debts as part of bankruptcy proceedings. The company’s creditors will get to weigh in on the best way for the exchange to allocate its repayment of the outstanding debts as the bankruptcy proceeds. For all PYMNTS crypto coverage, subscribe to the daily Crypto Newsletter.`

const keywords = rake.generate(text);

console.log(keywords);