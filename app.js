// Import express module
var express = require('express');

// Import path module
var path = require('path');

// Import logger module
var logger = require('morgan');

// Import cookie-parser
var cookieParser = require('cookie-parser');

// Import model
var model = require('./model/model.js');

// Import mongoose
var mongoose = require('mongoose');

// Instantiate MongoDB connection
const uri = 'mongodb://127.0.0.1/game-shop';
mongoose.Promise = global.Promise;
var db = mongoose.connection;

db.on('connecting', function () {
    console.log('Connecting to', uri);
});
db.on('connected', function () {
    console.log('Connected to', uri);
});
db.on('disconnecting', function () {
    console.log('Disconnecting from', uri);
});
db.on('disconnected', function () {
    console.log('Disconnected from', uri);
});
db.on('error', function (err) {
    console.error('Error:', err.message);
});
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Instantiate the express middleware
var app = express();

// Load logger module
app.use(logger('dev'));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set public folder to publish static content
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', function (req, res, next) {
    return model.getProducts().then(function (products) {
        return res.json(products);
    });
});

app.post('/api/users/signin', function (req, res, next) {
    return model.signin(req.body.email, req.body.password).then(function (user) {
        // Si existe el usuario, establecemos la cookie con el uid
        if (user) {
            res.cookie('uid', user._id);
            return res.json({});
        }
        // Si no existe el usuario, error
        return res.status(401).json({ message: 'Invalid credentials' });
    });
});

app.post('/api/users/signup', function (req, res, next) {
    return model.signup(req.body.user).then(function (user) {
        // Se devolverá un usuario si el correo no está registrado
        if (user) {
            return res.json(user._id);
        }
        // Si user es null
        return res.status(500).json({ message: 'Cannot create new user' });
    });
});

app.get('/api/users/profile', function (req, res, next) {
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }

    var user = model.getUserById(uid)

    if (user) {
        return res.json(user)
    }

    return res.status(404).json({ message: 'User information couldn\'t be found' })
})

app.get('/api/cart/qty', function (req, res, next) {
    var uid = req.cookies.uid;
    // Comprobamos que el usuario ha iniciado sesión
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }
    
    // El usuario ha iniciado sesión, obtenemos la cantidad del carrito
    return model.getCartQty(uid).then(function (aggregate) {
        if (aggregate.length > 0) {
            return res.json(aggregate[0].qty);
        }
        // carrito sin productos
        return res.status(500).json({ message: 'Cannot retrieve user cart quantity' })
    });
});

app.get('/api/cart', function (req, res, next) {
    var uid = req.cookies.uid;
    
    return model.getCartByUserId(uid).then(function (cartItems) {
        if (cartItems) {
            return res.json(cartItems);
        }
        // Si el usuario no estaba registrado
        return res.status(401).send({ message: 'User has not signed in' });
    })
    
});

// pid es un parámetro que va incluido en la URI
app.post('/api/cart/items/product/:pid', function (req, res, next) {
    var pid = req.params.pid;
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }
    
    return model.addItem(uid, pid).then(function (cart) {
        if (cart) {
            return res.json(cart);
        }
        return res.status(500).send({ message: 'Cannot add item to cart' });
    });
});

app.delete('/api/cart/items/product/:id', function (req, res, next) {
    var pid = req.params.id;
    var uid = req.cookies.uid;
    
    return model.removeItem(uid, pid, false).then(function (cartItems) {
        if (cartItems) {
            return res.status(200).send({ message: 'Item removed from cart' });
        }
        return res.status(500).send({ message: 'Cannot remove item from cart' });
    });
});
app.delete('/api/cart/items/product/:id/all', function (req, res, next) {
    var pid = req.params.id;
    var uid = req.cookies.uid;
    
    return model.removeItem(uid, pid, true).then(function (cartItems) {
        if (cartItems) {
            return res.status(200).send({ message: 'Item removed from cart' });
        }
        return res.status(500).send({ message: 'Cannot remove item from cart' });
    });
});

app.post('/api/orders', function (req, res, next) {
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }

    // purchaseForm, listOfIdItems, purchaseNumber
    var purchaseForm = req.body.purchaseForm;
    var purchaseNumber = req.body.purchaseNumber
    
    model.purchase(purchaseForm, purchaseNumber, uid);
    return res.json({});
});

app.get('/api/orders/id/:oid', function (req, res, next) {
    var oid = req.params.oid;
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }

    var order = model.getOrder(oid, uid);
    return res.json(order);
});

app.get('/api/orders', function (req, res, next) {
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }

    var orders = model.getOrders(uid);
    return res.json(orders);
});

// Set redirection to index.html
app.get(/\/.*/, function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Listen to port 3000
app.listen(3000, function() {
    console.log('Gameshop Web app listening on port 3000!')
});