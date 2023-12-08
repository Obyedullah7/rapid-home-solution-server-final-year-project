const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'services'
    },
    quick: {
        type: Boolean,
        required: true,
      },

},
    { timestamps: true }

)

const Cart = mongoose.model("carts", cartSchema);

module.exports = Cart;