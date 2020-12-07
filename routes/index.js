let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let schedule = require('node-schedule');
let nodemailer = require('nodemailer');
let db = require('../public/js/db');
let hf = require('../public/js/helperFunctions');

let user = '';
let level = 0;

//Utilize bodyParser
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

/*
    Send out emails everyday regarding which expired items
*/
let expirationCheck = schedule.scheduleJob('00 00 12 * * 0-6', async () => {
    //Get the array of expired items from the database
    let expiredItems = await db.getExpired();

    //Email Login Info
    //Place email login info to where Fridge tracker can send emails from
    let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: 'Email',
            pass: 'Password'
        }
    });

    //Loop through each expired item and send out a email for that item
    expiredItems.forEach((expiredItem) => {
        //Email body
        let email = `Fridge Tracker \n\n
        Hi the item below has expired \n\n 
        Item: ${expiredItem.name} \n
        Quantity: ${expiredItem.quantity} \n
        Location: Level ${expiredItem.levelNum} - ${expiredItem.levelType} \n\n
        Thank You`;

        //Email header
        let mailOptions = {
            from: 'Email',
            to: expiredItem.username,
            subject: 'Your Item has been Expired',
            text: email
        }

        //Send email
        transporter.sendMail(mailOptions, (err, info) => {
            if(err) {
                console.log('Failed to send Email');
            }
        });
    });
});

router.get('/', async (req, res) => {
    //Get the user's fridge
    let fridge = await db.findFridge(user);

    /*
        If there is not a user redirect to the login page
        Else if there if not a fride redirect to the create page where the user can create their fridge
        Else visualize the user's fridge on the index page
    */
    if(user == '') {
        res.redirect('/login');
    }
    else if(fridge.length < 1) {
        res.redirect('/create');
    }
    else {
        let data = hf.indexPageObject(fridge);
        res.render('index', data);
    }
});

router.get('/login', (req, res) => {
    /*
        If there is already a user redirect them to the index page
        Else render the login page
    */
    if(user != '') {
        res.redirect('/');
    }
    else {
        res.render('login');
    }
});

router.post('/login', async (req, res) => {
    //Get inputed data from the request body and also check if the user is in the database
    let email = req.body.email;
    let password = req.body.password;
    let userInfo = await db.findUser(email);

    /*
        If a account is being created then do the following:
        If the user's info is correct then create a new user and notify them with a message on the login page
        Else the user's info is invalid then notify them on the login page
    */
    if(req.body.login == 'createAccount') {
        if(userInfo.length == 0 && email != '' && password != '' && password.indexOf(' ') == -1) {
            await db.createUser(email, password);
            res.render('login', {message: 'Account created'})
        }
        else {
            res.render('login', {message: 'Username already exists or is invalid'})
        }
    }
    /*
        Else the user is signing in then do the following:
        If the user info is correct then check if they have created a fridge and respond appropiately'
        Else the user info is incorrect then notify them on the login page
    */
    else {
        if(userInfo.length > 0 && userInfo[0].password == password) {
            let fridge = await db.findFridge(user);
            if(fridge.length < 1) {
                res.render('create', hf.createPageObject(15, 8));
            }
            else {
                user = userInfo[0].username; 
                console.log(user); 
                res.redirect('/');
            }
        }
        else {
            res.render('login', {message: 'Invalid Username or Password'})       
        }
    }
});

router.get('/create', (req, res) => {
    /*
        If there is no user signed in redirect to the index page
        Else create a object which will be rendered in the create page
    */
    if(user == '') {
        res.redirect('/');
    }
    else {
        let max = 8;
        let data = hf.createPageObject(15, 8);
        res.render('create', data);
    }
});

router.post('/create', async (req, res) => {
    /*
        If the user needs to update the number of levels then do the following:
        Get the following info from the request body and render the page with the new updated info
    */
    if(req.body.submit == 'update') {
        let max = req.body.max;
        let arr = hf.createPageObject(15, max);
        res.render('create', arr);
    }
    /*
        Else the user is finished creating a fridge then do the following:
        Create the fridge with the info from the User
    */
    else {
        await db.createFridge(user, req.body);
        console.log(user);
        res.redirect('/');
    }
});

router.get('/new', (req, res) => {
    /*
        Get the level where the user is creating the new item
        Then render the new page
    */
    level = req.url.split('=')[1];
    res.render('new');
});

router.post('/new', (req, res) => {
    /*
        If the user wants to cancel the item then redirect to the index page
        Else create the item with the user's input while also check it
    */
    if(req.body.submit == 'cancel') {
        res.redirect('/');
    }
    else {
        let name = req.body.name;
        let mm = req.body.mm;
        let dd = req.body.dd;
        let yyyy = req.body.yyyy;

        if(name == '' || !hf.isNum(mm) || !hf.isNum(dd) || !hf.isNum(yyyy)) {
            res.render('new', {"level": req.body.level, "message": "Invalid"});
        }
        else {
            db.newItem(req.body, level, user);
            res.redirect('/');
        }
    }
});

router.get('/stats', async (req, res) => {
    /*
        Get the user's fridge and create a object which will be rendered in the stats page
    */
    let fridge = await db.findFridge(user);

    if(user == '') {
        res.redirect('/login');
    }
    else if(fridge.length < 1) {
        res.redirect('/create');
    }
    else {
        let data = hf.statsPageObject(fridge);
        res.render('stats', data);
    }
});

router.get('/signout', (req, res) => {
    /*
        Remove the following info when signing out
    */
    user = '';
    res.redirect('/');
});

module.exports = router;