const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    symbol: {type: String, required: true},
    likes: { type: [String], default: []}
});

const StockModel = mongoose.model("Stock", StockSchema);

module.exports = {
    Stock: StockModel
};
