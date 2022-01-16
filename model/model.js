var mongoose = require('mongoose');
var User = require('./user');
var CartItem = require('./cartItem');
var Product = require('./product');
var Order = require('./order');
var OrderItem = require('./orderItem');

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
    return User.findById(uid).populate('cartItems').then(function (user) {
        if (user) {
            for (var i = 0; i < user.cartItems.length; i++) {
                var cartItem = user.cartItems[i];
                
                if (cartItem.product.toString() == pid) {
                    if (!all && (cartItem.qty > 1)) {
                        cartItem.qty--;
                        return cartItem.save().then(function () {
                            return user.cartItems;
                        });
                    }
                    else {
                        // Quitar el cartItem de la lista cartItems de user
                        user.cartItems.splice(i, 1);
                        // Eliminar el cartItem
                        return Promise.all([CartItem.findByIdAndDelete(cartItem._id), user.save()]).then(function (results) {
                            return results[1].cartItems;
                        });
                    }
                }
            }
        }
        return null;
    })

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
Model.purchase = function (purchaseForm, uid) {
    return Promise.all([Model.getCartByUserId(uid), User.findById(uid)]).then(function (results) {
        let cartItems = results[0];
        let user = results[1];

        // Purchase number
        let purchaseNumber = new Date().getTime();

        // Nueva order
        let newOrder = new Order({
            number: purchaseNumber,
            date: purchaseForm.date,
            address: purchaseForm.address,
            cardNumber: purchaseForm.cardNumber,
            cardOwner: purchaseForm.cardOwner,
            orderItems: []
        });
        
        // Construimos los orderItems
        for (item of cartItems) {    
            // Nuevo orderItem
            let orderItem = new OrderItem({
                qty: item.qty,
                price: item.product.price,
                tax: item.product.tax,
                product: item.product._id
            });

            // Guardamos el orderItem en la bbdd
            Promise.all([orderItem.save(), CartItem.findByIdAndDelete(item._id)]).then(function () {
                // Añadimos el item a orderItems de newOrder
                newOrder.orderItems.push(orderItem);
            })
        }
    
        // Añadir el order al user
        user.orders.push(newOrder);

        // Vaciar cartItems de user
        user.cartItems.splice(0, user.cartItems.length);

        // Guardamos el user y la newOrder
        return Promise.all([user.save(), newOrder.save()]).then(function () {
            // Devolvemos el número de la order (purchaseNumber) para navegar hacia ella
            return purchaseNumber;
        });
    });
}

Model.getOrder = function (orderNumber, uid) {
    return this.getOrder_byNumber(orderNumber, uid);
}

Model.getOrders = function (uid) {
    return this.getUserById(uid).orders;
}

module.exports = Model;