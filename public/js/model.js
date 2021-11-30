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

Model.getUserId = function () {
    var uid = RegExp('uid=[^;]+').exec(document.cookie);
    if (uid) {
        uid = decodeURIComponent(uid[0].replace(/^[^=]+./,""));
        return uid;
    }
    return null;
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