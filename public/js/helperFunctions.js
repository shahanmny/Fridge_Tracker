/*
    In the indexPage Object is the following infomation about the User's Fridge:
    The levels of the Fridge
    The items that belong to that level and what style the item should be in
*/
let indexPageObject = (userFridge) => {
    let data = [];
    let buttonStyles = ['secondary', 'success', 'danger', 'warning', 'info'];
    let fridge = userFridge[0].fridge;

    let length = fridge.length;
    delete fridge.length;

    for(let i in fridge) {
        let level = fridge[i];
        for(let y in fridge[i].items) {
            let item = level.items[y];       
            item.style = buttonStyles[Math.floor(Math.random() * (buttonStyles.length-1))];
        }
        level.num = length;
        data.push(level);
        length -= 1;
    }
    return data;
}

/*
    In the createPage Object is the following:
    All the number of level on fridge
    Which is the top and bottom
    Which to show and not to show
*/
let createPageObject = (num, max) => {
    let data = [];
    for(let i = num; i > 0; i--) {
        let o;
        if(i == max) {
            o = {num: i, max: i};
        }
        else {
            o = {num: i};
        }
        if(i <= max) {
            o.show = true;
        }
        if(i == max) {
            o.end = '(Top)';
        }
        if(i == 1) {
            o.end = '(Bottom)'
        }
        data.push(o);
    }

    return data;
}

/*
    In the statsPage object will be the following info:
    The fraction of each food type
*/
let statsPageObject = (userFridge) => {
    let data = {};
    data.none = 0;
    data.dairy = 0;
    data.fruits = 0;
    data.vegetables = 0;
    data.meats = 0;
    data.grains = 0;
    data.seafood = 0;
    data.sugar = 0;
    data.drinks = 0;

    let total = 0;
    
    let fridge = userFridge[0].fridge;

    let length = fridge.length;

    for(let i in fridge) {
        let level = fridge[i];
        for(let y in fridge[i].items) {
            let item = level.items[y];       
            data[item.type] += 1;
            total += 1;
        }
        length -= 1;
    }
    for(let i in data) {
        data[i] = (data[i]/total) * 100;
    }

    data.other = data.none;
    delete data.none;

    return data;
}

/*
    Create a fridge object which will be inserted into the fridge collection
*/
let parseCreateFridgeInfo = (f) => {
    let info = {};
    let length = 0;
    for(const i in f) {
        // if(i == 'name') {
        //     info.name = f.name;
        // }
        // else if(i == 'type') {
        //     info.type = f.type;
        // }
        if(i == 'length') {
            info.length = 0;
        }
        else if(i == 'submit') {
            continue;
        }
        else {
            switch(i) {
                case 'level1': 
                    info.level1 = {'type': f.level1, 'items': []};
                    length += 1;
                    break;
                case 'level2': 
                    info.level2 = {'type': f.level2, 'items': []};
                    length += 1;
                    break;
                case 'level3': 
                    info.level3 = {'type': f.level3, 'items': []};
                    length += 1;
                    break;
                case 'level4': 
                    info.level4 = {'type': f.level4, 'items': []};
                    length += 1;
                    break;
                case 'level5': 
                    info.level5 = {'type': f.level5, 'items': []};
                    length += 1;
                    break;
                case 'level6': 
                    info.level6 = {'type': f.level6, 'items': []};
                    length += 1;
                    break;
                case 'level7': 
                    info.level7 = {'type': f.level7, 'items': []};
                    length += 1;
                    break;
                case 'level8': 
                    info.level8 = {'type': f.level8, 'items': []};
                    length += 1;
                    break;
                case 'level9': 
                    info.level9 = {'type': f.level9, 'items': []};
                    length += 1;
                    break;
                case 'level10': 
                    info.level10 = {'type': f.level10, 'items': []};
                    length += 1;
                    break;
                case 'level11': 
                    info.level11 = {'type': f.level11, 'items': []};
                    length += 1;
                    break;
                case 'level12': 
                    info.level12 = {'type': f.level12, 'items': []};
                    length += 1;
                    break;
                case 'level13': 
                    info.level13 = {'type': f.level13, 'items': []};
                    length += 1;
                    break;
                case 'level14': 
                    info.level14 = {'type': f.level14, 'items': []};
                    length += 1;
                    break;
                case 'level15': 
                    info.level15 = {'type': f.level15, 'items': []};
                    length += 1;
                    break;
                default: 
                    break;
            } 
        }
    }
    info.length = length;

    return info;
}

/*
    Update the fridge object with the new item
*/
let addItemFridgeInfo = (f, level, item) => {
    let info = {};

    for(const i in f) {
        if(i == 'length') {
            info.length = f.length;
        }
        else {
            let arr = f[i];
            if(i == level) {
                arr.items.push(item);
            }
            info[i] = {'type': arr.type, 'items': arr.items};
        }
    }

    return info;
}

/*
    Check if the following string only contains numbers
*/
let isNum = (str) => {
    if(str == '') {
        return true;
    }

    let pattern = /[0-9]/g;
    let result = str.match(pattern);

    if(result == null || result.length != str.length) {
        return false;
    }
    else {
        return true;
    }
}

module.exports = {indexPageObject, createPageObject, statsPageObject, parseCreateFridgeInfo, addItemFridgeInfo, isNum};
