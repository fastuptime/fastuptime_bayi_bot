const config = require("../config.js");
const mongoose = require("mongoose");
var baglan_can = mongoose.createConnection(config.mongo_url, {
  useNewUrlParser: true,
  autoIndex: false
});

const monitorData = new mongoose.Schema({
    userID: String, //Discord user ID
    monitorID: String, //Monitor ID
    date: String, //Tarih
});

module.exports = baglan_can.model("monitorData", monitorData);