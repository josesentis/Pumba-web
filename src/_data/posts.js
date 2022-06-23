const _all = require('./_all.js');
const locales = require('./locales.js');
const type = "posts"

async function getData(){
    console.log("------ Fetching posts... ------");

    const dataFinal = [];
    const dataAll = _all;

    for (let i in locales.langs) {
        const lang = locales.langs[i].code;
        const data = dataAll[lang][type];

        for (let j in data) {
            dataFinal.push(data[j]);
        }
    }

    return dataFinal;
}

module.exports = getData;
