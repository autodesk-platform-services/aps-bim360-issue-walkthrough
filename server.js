const express = require('express');
const session = require('cookie-session');
const { PORT, SERVER_SESSION_SECRET } = require('./config.js');
const bodyParser = require('body-parser');  

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(session({ secret: SERVER_SESSION_SECRET, maxAge: 24 * 60 * 60 * 1000 }));
app.use(require('./routes/endpoints/oauth.js'));
app.use(require('./routes/endpoints/dm.js'));
app.use(require('./routes/endpoints/issues.js'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));

String.prototype.format =function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(m, i){
        return args[i];
    });
  };