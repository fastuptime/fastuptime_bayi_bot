const config = require("../config.js");
const mongoose = require("mongoose");
var baglan_can = mongoose.createConnection(config.mongo_url, {
  useNewUrlParser: true,
  autoIndex: false
});

const userData = new mongoose.Schema({
    userID: String, //Discord user ID
    name: String, //Adı
    email: String, //E-posta adresi
    plan_type: String, //Plan tipi (free, premium)
    acAt: String,  //Açılma tarihi
});

module.exports = baglan_can.model("userData", userData);