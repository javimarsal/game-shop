var mongoose = require('mongoose');
var User = require('./user');
var CartItem = require('./cartItem');
var Product = require('./product')

Model = {}

Model.cartItems = [];

Model._cartItemsCount = 0;


// Obtener precio de un producto pasando su id
Model.getTax_ofProduct = function (productId) {
    return this.getProductById(productId).tax
}

// Calcular subtotal de una lista
Model.getSubtotal = function (listOfItems) {
    let subtotal = 0;

    for (item of listOfItems) {
        subtotal += (this.getPrice(item._id) * item.qty)
    }

    return subtotal
}

// Calcular tax total de una lista
Model.getTotalTax = function (listOfItems) {
    let totalTax = 0;

    for (item of listOfItems) {
        totalTax += (this.getTax_ofProduct(item._id) * item.qty)
    }

    return totalTax
}

// Calcular total de una lista
Model.getTotal = function (listOfItems) {
    return this.getSubtotal(listOfItems) + this.getTotalTax(listOfItems)
}


Model.user = null;

Model.users = [{
    _id: 1,
    email: 'johndoe@example.com',
    password: '1234',
    name: 'John',
    surname: 'Doe',
    birth: new Date(1990, 1, 1),
    address: '123 Main St, 12345 New York, USA',
    cartItems: [],
    orders: []
}];

Model.getUserById = function (userId) {
    for (var i = 0; i < Model.users.length; i++) {
        if (Model.users[i]._id == userId) {
            return Model.users[i];
        }
    }
    return null;
};

//! DEPRECATED
// Model.getUserCartItems = function () {
//     return this.user.cartItems
// }

Model.emptyCartItems = function (uid) {
    // Elimina todos los items y limpia la lista
    this.getUserById(uid).cartItems.splice(0, this.getUserById(uid).cartItems.length)
}

/* Sign In */
Model.signin = function (email, password) {
    return User.findOne({ email, password });
}

/* Sign Up */
Model.signup = function (newUserData) {
    return User.findOne({ email: newUserData.email }).then(function (user) {
        if (!user) {
            var newUser = new User({
                email: newUserData.email,
                password: newUserData.password,
                name: newUserData.name,
                surname: newUserData.surname,
                birth: (new Date(newUserData.birth)).getTime(),
                address: newUserData.address,
                cartItems: [],
                orders: []
            });
            return newUser.save()
        }
        // Si el correo ya existe, no se crea un usuario
        return null;
    });
}

/* Sign Out */
// Deprecated
// Model.signout = function () {
//     Model.user = null;
// }

//! DEPRECATED
// Model.isEmailRegistered = function (email) {
//     for (var i = 0; i < Model.users.length; i++) {
//         if (Model.users[i].email == email) {
//             // Lo encuentra
//             return true;
//         }
//     }

//     // No lo encuentra
//     return false;
// }

Model.searchMaxId_inUsersList = function () {
    let maxId = Model.users[0]._id;

    for (var i = 0; i < Model.users.length; i++) {
        if(Model.users[i]._id > maxId) {
            maxId = Model.users[i]._id;
        }
    }

    return maxId;
}

/* Buy */
Model.addItem = function (uid, pid) {
    // returns a promise that is resolved or rejected when all promises are resolved or rejected
    return Promise.all([User.findById(uid).populate('cartItems'), Product.findById(pid)]).then(function (results) {
        // results, array of resolved values
        var user = results[0];
        var product = results[1];
        if (user && product) {
            for (var i = 0; i < user.cartItems.length; i++) {
                var cartItem = user.cartItems[i];
                if (cartItem.product == pid) {
                    cartItem.qty++;
                    return cartItem.save().then(function () {
                        return user.cartItems;
                    });
                }
            }

            // Si el cartItem no se encontraba en el carrito
            var cartItem = new CartItem({ qty:1, product });
            user.cartItems.push(cartItem);
            return Promise.all([cartItem.save(), user.save()]).then(function (result) {
                return result[1].cartItems;
            });
        }
        return null;
    }).catch(function (err) {
        console.error(err);
        return null;
    });
}

Model.getProducts = function () {
    return Product.find();
}

Model.getProductById = function (pid) {
    for (var i = 0; i < Model.products.length; i++) {
        if (Model.products[i]._id == pid) {
            return Model.products[i];
        }
    }
    return null;
}

Model.getProduct_inCart = function (pId, uId) {
    return this.getUserById(uId).cartItems.find(item => item._id == pId)
}

Model.getOrder_byNumber = function (number, uid) {
    return this.getUserById(uid).orders.find(order => order.number == number)
}

Model.findIndex_byId = function (listOfItems, Id) {
    return listOfItems.findIndex(item => item._id == Id)
}

/* Remove Items from cart (one or all) */
Model.removeItem = function (uid, pid, all = false) {
    var user = Model.getUserById(uid);
    if (user) {
        for (var i = 0; i < user.cartItems.length; i++) {
            var item = user.cartItems[i];
            if (item.product._id == pid) {
                if (!all && (item.qty > 1)) {
                    item.qty--;
                } else {
                    user.cartItems.splice(i, 1);
                    Model.cartItems.splice(Model.cartItems.indexOf(item), 1);
                }
                return user.cartItems;
            }
        }
    }
    return null;
};

// Para el badge de cart
Model.getCartQty = function (uid) {
    // localField: es el atributo cartItems de User
    // from: es la colección en la bdd
    return User.aggregate([
        { $match: { "_id": mongoose.Types.ObjectId(uid) } },
        { $lookup: { from: 'cartitems', localField: 'cartItems', foreignField: '_id', as: 'cartItems' } },
        { $project: { qty: { $sum: "$cartItems.qty" } } }
    ]);
}

Model.getCartByUserId = function (uid) {
    return User.findById(uid).then(function (user) {
        if (user) {
            return user.populate({
                path: 'cartItems',
                populate: { path: 'product' }
            }).then(function (user) {
                return user.cartItems;
            })
        }
        return null;
    })
}

/* Purchase */
// Necesitamos el id del usuario para acceder al carrito
Model.purchase = function (purchaseForm, purchaseNumber, uid) {
    // Nueva order
    let newOrder = {
        number: purchaseNumber,
        date: purchaseForm.date,
        address: purchaseForm.address,
        cardNumber: purchaseForm.cardNumber,
        cardOwner: purchaseForm.cardOwner,
        itemList: []
    }
    
    // Construimos los orderItems
    for (item of this.getUserById(uid).cartItems) {
        // Buscamos el item en la lista de Productos
        let product = this.getProductById(item.product._id);

        // Buscamos el item en la cartItems para obtener qty
        let orderQty = item.qty;

        // Añadimos el item a la itemsList de order
        newOrder.itemList.push({
            itemId: product._id,
            product: product,
            qty: orderQty,
            price: product.price,
            tax: product.tax
        });
    }

    // Añadir el order al user
    this.getUserById(uid).orders.push(newOrder);

    // Vaciamos el cartItems
    this.emptyCartItems(uid);
}

Model.getOrder = function (orderNumber, uid) {
    return this.getOrder_byNumber(orderNumber, uid);
}

Model.getOrders = function (uid) {
    return this.getUserById(uid).orders;
}

module.exports = Model;