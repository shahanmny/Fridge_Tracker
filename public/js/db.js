let MongoClient = require('mongodb').MongoClient;
let isAsyncFunction = require('is-async-function');
let hf = require('./helperFunctions');
let url = "mongodb://localhost:27017/FridgeTrackerDB";
let db;

/*
    Create a database if it does not exist and connect to it
    Create the User and Fridges collections
    Insert into the User collection with a new user
*/
let intiateDatabase = () => {
    MongoClient.connect(url, {useUnifiedTopology: true}, (err, dbs) => {
        if(err) {
            throw err;
        }
        else {
            console.log('Database Initiated');

            db = dbs.db('myDb');
            let users = false, fridges = false;

            db.listCollections({}, {nameOnly: true}).toArray(async (err, collections) => {
                if(err) {
                    throw err;
                }
                else {
                    users = checkCollections(collections, 'Users');
                    fridges = checkCollections(collections, 'Fridges');

                    if(!users) {
                        createCollection('Users');
                    }
                    if(!fridges) {
                        result = createCollection('Fridges');
                    }
                    // if(!users || !fridges) {
                    //     await createUser('test@gmail.com', 'x5RMjdK658');
                    // }
                }
            });
        }
    });
}


/*
    Check if the Users and Fridges Collections exist
*/
let checkCollections = (collections, name) => {
    let result = false;

    collections.find((c) => {
        if(c.name == name) {
            result = true;
        }
    });
    return result;
}

/*
    Create a new Collection in the database
*/
let createCollection = (name) => {
    db.createCollection(name, (err, res) => {
        if(err) {
            console.log('Failed to Create Collection');
            throw err;
        }
    });
    console.log(`${name} Collection has been Created`);
}

/*
    Create a new User
*/
let createUser = (email, password) => {
    return new Promise(resolve => {
        let user = {username: email, password: password};
        db.collection('Users').insertOne(user, (err, res) => {
            if(err) {
                console.log("Failed to Create New User");
                throw err;
            }
            
            // let userFridges = {username: email, fridges: []};
            // db.collection('Fridges').insertOne(userFridges, (err, res) => {
            //     if(err) {
            //         console.log("Failed to Create New User's Fridges");
            //         throw err;
            //     }
            //     resolve();
            // });
            resolve();
        });
    });
}

/*
    Find the user in the Users Collection and returns it
*/
let findUser = (username) => {
    return new Promise(resolve => {
        let query = {username: username};
        db.collection('Users').find(query).toArray((err, result) => {
            if(err) {
                console.log('Failed to Find User');
                throw err;
            }

            resolve(result);
        });
    });
}

/*
    Find the User's Fridges in the Fridges Collection and returns it
*/
let findFridge = (username) => {
    return new Promise(resolve => {
        let query = {username: username};
        db.collection('Fridges').find(query).toArray((err, result) => {
            if(err) {
                console.log('Failed to Find Fridge');
                throw err;
            }

            resolve(result);
        });
    });
}

/*
Create a new Fridge object then add it to the User's Fridges
*/
let createFridge = (username, f) => {
    return new Promise(async resolve => {
        let newFridge = hf.parseCreateFridgeInfo(f);
        let userFridges = {username: username, fridge: newFridge};
        db.collection('Fridges').insertOne(userFridges, (err, res) => {
            if(err) {
                console.log("Failed to Create New User's Fridges");
                throw err;
            }
            resolve();
        });
    });
}

/*
Create a new Item and update it into the User's fridge
*/
let newItem = (item, lvl, username) => {
    return new Promise(async resolve => {
        let query = await findFridge(username);
        let oldFridge = {username: username};
        let level = "level"+lvl;
        let fridge = hf.addItemFridgeInfo (query[0].fridge, level, item);
        let newFridge = {$set: {username: username, fridge: fridge}};
        
        db.collection('Fridges').updateOne(oldFridge, newFridge, (err, result) => {
            if(err) {
                console.log('Failed to Add New Item');
                throw err;
            }
            resolve();
        });
    });
}

/*
Loop through the Fridge Collection and Check which Items are Expired and Return those Items 
*/
let getExpired = () => {
    return new Promise(async resolve => {
        db.collection('Fridges').find({}, (err, res) => {
            if(err) {
                console.log('Failed to Iterate Fridge Collection');
                throw err;
            }
            
            data = [];
            
            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() +1;
            let day = date.getDate();
            
            res.forEach((user) => {
                let expired = {};
                
                let fridge = user.fridge;
                
                for(let level in fridge) {
                    let temp = fridge[level];
                    let items = temp.items;
                    let levelNum = level.charAt(level.length-1);
                    let levelType = temp.type;

                    if(items == undefined) {
                        continue;
                    }
                    items.forEach((item) => {
                        if(year == item.yyyy && month == item.mm && day == item.dd) {
                            let expired = {username: user.username, name: item.name, quantity: item.quantity, levelNum: levelNum, levelType: levelType};
                            data.push(expired);
                        }
                    });
                }
                
                resolve(data);
            });
        });
    });
}

/*
Old createFridge funtion
*/
// let createFridge = (username, f) => {
//     return new Promise(async resolve => {
//         let newFridge = hf.parseCreateFridgeInfo(f);
//         let query = (await findFridge(username))[0];
//         let fridgesArr = query.fridges;
//         fridgesArr.push(newFridge);
//         let oldUserFridges = {username: username};
//         let newUserFridges = {$set: {username: username, fridges: fridgesArr}};

//         db.collection('Fridges').updateOne(oldUserFridges, newUserFridges, (err, result) => {
//             if(err) {
//                 console.log("Failed to Update User's Fridges");
//                 throw err;
//             }
//             resolve();
//         });
//     });
// }

//Intiate database
intiateDatabase();

module.exports = {findUser, createUser, findFridge, createFridge, newItem, getExpired};
