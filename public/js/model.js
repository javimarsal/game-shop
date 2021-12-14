Model = {}

Model.getProducts = function () {
    return $.ajax({ url: '/api/products', method: 'GET' });
}

Model.signin = function (email, password) {
    return $.ajax({
        url: '/api/users/signin',
        method: 'POST',
        data: { email, password }
    });
}

Model.signup = function (user) {
    return $.ajax({
        url: '/api/users/signup',
        method: 'POST',
        data: { user }
    })
}

Model.getUserId = function () {
    var uid = RegExp('uid=[^;]+').exec(document.cookie);
    if (uid) {
        uid = decodeURIComponent(uid[0].replace(/^[^=]+./,""));
        return uid;
    }
    return null;
}

Model.getProfile = function () {
    return $.ajax({
        url: '/api/users/profile',
        method: 'GET'
    });
}

Model.signout = function () {
    document.cookie = 'uid=;expires=0;path=/;'
}

Model.getCartQty = function () {  
    return $.ajax({
        url: '/api/cart/qty',
        method: 'GET'
    });
}

Model.getCart = function () { 
    return $.ajax({
        url: '/api/cart',
        method: 'GET'
    });
}

Model.addItem = function (pid) {
    return $.ajax({
        url: '/api/cart/items/product/' + pid,
        method: 'POST'
    });
};

Model.removeItem = function (pid, all = false) {
    return $.ajax({
        url: '/api/cart/items/product/' + pid + (all ? '/all' : ''),
        method: 'DELETE'
    });
};

Model.purchase = function (purchaseForm, purchaseNumber) {
    return $.ajax({
        url: '/api/orders',
        method: 'POST',
        data: { purchaseForm, purchaseNumber }
    });
}

Model.getOrder = function (oid) {
    return $.ajax({
        url: '/api/orders/id/' + oid,
        method: 'GET'
    });
}

Model.getOrders = function () {
    return $.ajax({
        url: '/api/orders',
        method: 'GET'
    });
}