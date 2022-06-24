const locales = require('./locales.js');
const _all = require('./_all.js');
const type = "projects"

module.exports = async function getData(){
    console.log("Fetching projects...");

    var dataFinal = [];
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