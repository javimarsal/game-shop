Model = {}

Model.products = [{
    _id: 1,
    title: 'Halo Infinite',
    url: '/assets/img/games/halo-infinite.webp',
    description: 'When all hope is lost and humanity’s fate hangs in the balance, the Master Chief is ready to confront the most ruthless foe he’s ever faced. Step inside the armor of humanity’s greatest hero to experience an epic adventure and explore the massive scale of the Halo ring.',
    price: 57.81,
    tax: 12.14
},
{
    _id: 2,
    title: 'Age of Empires IV',
    url: '/assets/img/games/aoe-iv.webp',
    description: 'One of the most beloved real-time strategy games returns to glory with Age of Empires IV, putting you at the center of epic historical battles that shaped the world. Featuring both familiar and innovative new ways to expand your empire in vast landscapes with stunning 4K visual fidelity, Age of Empires IV brings an evolved real-time strategy game to a new generation.',
    price: 49.54,
    tax: 10.41
},
{
    _id: 3,
    title: 'Assassin\'s Creed Valhalla',
    url: '/assets/img/games/ac-valhalla.webp',
    description: 'Become Eivor, a Viking raider raised to be a fearless warrior, and lead your clan from icy desolation in Norway to a new home amid the lush farmlands of ninth-century England. Find your settlement and conquer this hostile land by any means to earn a place in Valhalla.',
    price: 20.62,
    tax: 4.33
},
{
    _id: 4,
    title: "Forza Horizon 5",
    url: '/assets/img/games/fh5.webp',
    description: 'In this game, you can explore a truly massive open world map, as much as fifty percent larger than Forza Horizon 4’s not inconsiderable map. Race a variety of vehicles through a volcanos’ caldera, explore jungles and rainforests for their hidden ruined cities, spray sand up as you zoom over beaches, as well as racing past waterfalls, snowy mountains, and large reality-based cities like Guanajuato which comes with a network of secret tunnels to explore!',
    price: 57.81,
    tax: 12.14
},
{
    _id: 5,
    title: "Far Cry 6",
    url: '/assets/img/games/far-cry-6.webp',
    description: 'Far Cry 6 is set on the fictional Caribbean island of Yara, a first person shooter in an open world location. The game boasts the largest Far Cry map to date which you can cross on foot or in a nicely diverse range of vehicles, and – thanks to the determined efforts of El Presidente – the tropical paradise is frozen in time. This is to prevent the populace getting ideas about independence and free and fair elections and other such nonsense, of course...',
    price: 41.28,
    tax: 8.67
},
{
    _id: 6,
    title: "Marvel's Guardians of the Galaxy",
    url: '/assets/img/games/guardians.webp',
    description: 'Marvel’s Guardians of the Galaxy is a single player, narrative driven, episodic game with a fairly linear premise. It is strongly mission based, and the story is loosely based on the comic book series of the same name. There are movies in the franchise which use the same characters as are featured in the game and the original comics.',
    price: 33.02,
    tax: 6.93
}];

Model.cartItems = [];

Model._cartItemsCount = 0;


// Obtener precio de un producto pasando su id
Model.getTax_ofProduct = function (productId) {
    return this.findProduct_byId(productId).tax
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
    shoppingCart: [],
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

Model.getUserShoppingCart = function () {
    return this.user.shoppingCart
}

Model.emptyShoppingCart = function () {
    // Elimina todos los items y limpia la lista
    this.user.shoppingCart.splice(0, this.user.shoppingCart.length)
}

/* Sign In */
Model.signin = function (email, password) {
    Model.user = null;
    for (var i = 0; i < Model.users.length; i++) {
        if (Model.users[i].email == email && Model.users[i].password == password) {
            Model.user = Model.users[i];
            return Model.user;
        }
    }
    return null;
}

/* Sign Up */
Model.signup = function (newUserData) {
    Model.user = null;

    // Comprobar que el correo no existe en la lista users
    if (!this.isEmailRegistered(newUserData.email)) {
        // Crear el nuevo usuario
        let newUser = {
            _id: this.searchMaxId_inUsersList() + 1,
            email: newUserData.email,
            password: newUserData.password,
            name: newUserData.name,
            surname: newUserData.surname,
            birth: newUserData.birth,
            address: newUserData.address,
            shoppingCart: [],
            orders: []
        }

        // Añadir el nuevo usuario a la lista users
        this.users.push(newUser);

        // Devolvemos el nuevo usuario
        return newUser;
    }

    // Si el correo ya existe, devolvemos null
    return null;
}

/* Sign Out */
Model.signout = function () {
    Model.user = null;
}

Model.isEmailRegistered = function (email) {
    for (var i = 0; i < Model.users.length; i++) {
        if (Model.users[i].email == email) {
            // Lo encuentra
            return true;
        }
    }

    // No lo encuentra
    return false;
}

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
    var product = Model.getProductById(pid);
    var user = Model.getUserById(uid);
    
    if (user && product) {
        for (var i = 0; i < user.shoppingCart.length; i++) {
            var cartItem = user.shoppingCart[i];
            if (cartItem.product._id == pid) {
                cartItem.qty++;
                return user.shoppingCart;
            }
        }
        var cartItem = {
            _id: Model._cartItemsCount++,
            product: product,
            qty: 1
        };
        user.shoppingCart.push(cartItem);
        Model.cartItems.push(cartItem);
        return user.shoppingCart;
    }

    return null;
}

Model.getProductById = function (pid) {
    for (var i = 0; i < Model.products.length; i++) {
        if (Model.products[i]._id == pid) {
            return Model.products[i];
        }
    }
    return null;
}

Model.findProduct_inCart = function (productId) {
    return this.user.shoppingCart.find(item => item._id == productId)
}

Model.findOrder_byNumber = function (number) {
    return this.user.orders.find(order => order.number == number)
}

Model.findIndex_byId = function (listOfItems, Id) {
    return listOfItems.findIndex(item => item._id == Id)
}

/* Remove Items from cart (one or all) */
Model.removeItem = function (uid, pid, all = false) {
    var user = Model.getUserById(uid);
    if (user) {
        for (var i = 0; i < user.shoppingCart.length; i++) {
            var item = user.shoppingCart[i];
            if (item.product._id == pid) {
                if (!all && (item.qty > 1)) {
                    item.qty--;
                } else {
                    user.shoppingCart.splice(i, 1);
                    Model.cartItems.splice(Model.cartItems.indexOf(item), 1);
                }
                return user.shoppingCart;
            }
        }
    }
    return null;
};

// Para el badge de cart
Model.getCartQty = function (userId) {
    let user = this.getUserById(userId)
    console.log(user)
    if (user) {
        let totalQty = 0;

        for(item of user.shoppingCart) {
            totalQty += item.qty
        }
        return totalQty
    }

    return null
}

Model.getCartByUserId = function (uid) {
    var user = Model.getUserById(uid);
    if (user) {
        return user.shoppingCart;
    }
    return null;
}

Model.getSubtotal_ofOrder = function (orderList) {
    let subtotal = 0;

    for (item of orderList) {
        subtotal += item.price * item.qty
    }

    return subtotal
}

Model.getTax_ofOrder = function (orderList) {
    let tax = 0;

    for (item of orderList) {
        tax += item.tax * item.qty
    }

    return tax
}

Model.getTotal_ofOrder = function (orderList) {
    return this.getSubtotal_ofOrder(orderList) + this.getTax_ofOrder(orderList)
}

Model.getTotal_ofOrderItem = function (orderQty, orderPrice, orderTax) {
    return (orderPrice + orderTax) * orderQty
}

/* Purchase */
Model.purchase = function (purchaseForm, listOfIdItems, purchaseNumber) {
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
    for (id of listOfIdItems) {
        // Buscamos el item en la lista de Productos
        let product = this.findProduct_byId(id)

        // Buscamos el item en la shoppingCart para obtener qty
        let orderQty = this.findProduct_inCart(id).qty

        // Añadimos el item a la itemsList de order
        newOrder.itemList.push({
            itemId: product._id,
            qty: orderQty,
            price: product.price,
            tax: product.tax
        });
    }

    // Añadir el order al user
    this.user.orders.push(newOrder)

    // Vaciamos el shoppingCart
    this.emptyShoppingCart();
}

Model.getOrder = function (number) {
    return this.findOrder_byNumber(number)
}

module.exports = Model;