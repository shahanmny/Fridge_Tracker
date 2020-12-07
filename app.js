let express = require('express');
let exphbs = require('express-handlebars');
let path = require('path');
let routes = require('./routes/index');

const app = express();

//Setup Handlebars Engine
app.engine('handlebars', exphbs({default: 'main'}));
app.set('view engine', 'handlebars');

//routes is where all the requests will be handled
app.use('/', routes);

//Start Fridge Tracker on Port 80 Localhost
app.listen(80, () => {
    console.log('Server started on port 80');
})