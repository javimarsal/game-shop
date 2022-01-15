var mongoose = require('mongoose');

var schema = mongoose.Schema({
    number: { type: String, required: true },
    date: { type: Date, required: true },
    address: { type: String, required: true },
    cardNumber: { type: String, required: true },
    cardOwner: { type: String, required: true },
    orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }]
});

module.exports = mongoose.model('Order', schema);