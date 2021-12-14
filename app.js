// Import express module
var express = require('express');

// Import path module
var path = require('path');

// Import logger module
var logger = require('morgan');

var cookieParser = require('cookie-parser');

// Import model
var model = require('./model/model.js');

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
    return res.json(model.products);
});

app.post('/api/users/signin', function (req, res, next) {
    var user = model.signin(req.body.email, req.body.password);
    if (user) {
        res.cookie('uid', user._id);
        return res.json({});
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/api/users/signup', function (req, res, next) {
    // Se devolverá un usuario si el correo no está registrado
    var user = model.signup(req.body.user);
    if (user) {
        return res.json({});
    }
    // Precondition fail, email must be diferent (not registered)
    return res.status(412).json({ message: 'User email already exists' });
})

app.get('/api/users/profile', function (req, res, next) {
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }

    var user = model.getUserById(uid)

    if (user) {
        return res.json(user)
    }

    return res.status(500).json({ message: 'User information couldn\'t be found' })
})

app.get('/api/cart/qty', function (req, res, next) {
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }
    var cartQty = model.getCartQty(uid);
    if (cartQty !== null) {
        return res.json(cartQty);
    }
    return res.status(500).send({ message: 'Cannot retrieve user cart quantity' });
});

app.get('/api/cart', function (req, res, next) {
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }
    var cart = model.getCartByUserId(uid);
    if (cart) {
        return res.json(cart);
    }
    return res.status(401).send({ message: 'Cannot retrieve cart' });
});

// pid es un parámetro que va incluido en la URI
app.post('/api/cart/items/product/:pid', function (req, res, next) {
    var pid = req.params.pid;
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }
    
    var cart = model.addItem(uid, pid);
    if (cart) {
        return res.json(cart);
    }
    
    return res.status(500).send({ message: 'Cannot add item to cart' });
});

app.delete('/api/cart/items/product/:id', function (req, res, next) {
    var pid = req.params.id;
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }
    var cart = Model.removeItem(uid, pid, false);
    if (cart) {
        return res.json(cart);
    }
    return res.status(500).send({ message: 'Cannot remove item from cart' });
});
app.delete('/api/cart/items/product/:id/all', function (req, res, next) {
    var pid = req.params.id;
    var uid = req.cookies.uid;
    if (!uid) {
        return res.status(401).send({ message: 'User has not signed in' });
    }
    var cart = Model.removeItem(uid, pid, true);
    if (cart) {
        return res.json(cart);
    }
    return res.status(500).send({ message: 'Cannot remove item from cart' });
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

// Set redirection to index.html
app.get(/\/.*/, function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Listen to port 3000
app.listen(3000, function() {
    console.log('Gameshop Web app listening on port 3000!')
});