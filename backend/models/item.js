const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose')

const Item = mongoose.model('Item', mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    barcode: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    updatedOn: {
        type: Date,
        default: Date.now
    }
}))

function validateItem(item) {
    const schema = {
        name: Joi.string().min(1).required(),
        description: Joi.string(),
        barcode: Joi.string(),
        price: Joi.number().required(),
        brandId: Joi.objectId().required()
    }

    return Joi.validate(item, schema)
}

module.exports = {
    Item: Item,
    validateItem: validateItem
}