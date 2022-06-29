const locales = require('./locales.js');
const acf_optionGetByLang = require('../_helpers/acf_optionGetByLang.js');
const type = "clients";

async function getData(){
    console.log("------ Fetching team... ------ ");

    const clients = await acf_optionGetByLang(type);
    const data_i18n = {};

    for (let i in locales.langs) {
        const lang = locales.langs[i].code;
        data_i18n[lang] = {};
        data_i18n[lang].clients = clients[lang];
    }

    return data_i18n;
}

module.exports = getData;