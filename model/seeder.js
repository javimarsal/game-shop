var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Modelo de Datos
var User = require('./user');
var CartItem = require('./cartItem');
var Product = require('./product');

// URI de la BDD
var uri = 'mongodb://127.0.0.1/game-shop';

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

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(function () {
    var cartItems = [];
    
    var user = new User({
        email: 'johndoe@example.com',
        password: '1234',
        name: 'John',
        surname: 'Doe',
        birth: Date.UTC(1990, 0, 1),
        address: '123 Main St, 12345 New York, United States',
        cartItems: cartItems
    });

    var products = [
        new Product({
            title: 'Halo Infinite',
            url: '/assets/img/games/halo-infinite.webp',
            description: 'When all hope is lost and humanity\'s fate hangs in the balance, the Master Chief is ready to confront the most ruthless foe he\'s ever faced. Step inside the armor of humanity\'s greatest hero to experience an epic adventure and explore the massive scale of the Halo ring.',
            price: 57.81,
            tax: 12.14
        }),
        new Product({
            title: 'Age of Empires IV',
            url: '/assets/img/games/aoe-iv.webp',
            description: 'One of the most beloved real-time strategy games returns to glory with Age of Empires IV, putting you at the center of epic historical battles that shaped the world. Featuring both familiar and innovative new ways to expand your empire in vast landscapes with stunning 4K visual fidelity, Age of Empires IV brings an evolved real-time strategy game to a new generation.',
            price: 49.54,
            tax: 10.41
        }),
        new Product({
            title: 'Assassin\'s Creed Valhalla',
            url: '/assets/img/games/ac-valhalla.webp',
            description: 'Become Eivor, a Viking raider raised to be a fearless warrior, and lead your clan from icy desolation in Norway to a new home amid the lush farmlands of ninth-century England. Find your settlement and conquer this hostile land by any means to earn a place in Valhalla.',
            price: 20.62,
            tax: 4.33
        }),
        new Product({
            title: "Forza Horizon 5",
            url: '/assets/img/games/fh5.webp',
            description: 'In this game, you can explore a truly massive open world map, as much as fifty percent larger than Forza Horizon 4\'s not inconsiderable map. Race a variety of vehicles through a volcanos\' caldera, explore jungles and rainforests for their hidden ruined cities, spray sand up as you zoom over beaches, as well as racing past waterfalls, snowy mountains, and large reality-based cities like Guanajuato which comes with a network of secret tunnels to explore!',
            price: 57.81,
            tax: 12.14
        }),
        new Product({
            title: "Far Cry 6",
            url: '/assets/img/games/far-cry-6.webp',
            description: 'Far Cry 6 is set on the fictional Caribbean island of Yara, a first person shooter in an open world location. The game boasts the largest Far Cry map to date which you can cross on foot or in a nicely diverse range of vehicles, and (thanks to the determined efforts of El Presidente) the tropical paradise is frozen in time. This is to prevent the populace getting ideas about independence and free and fair elections and other such nonsense, of course...',
            price: 41.28,
            tax: 8.67
        }),
        new Product({
            title: "Marvel's Guardians of the Galaxy",
            url: '/assets/img/games/guardians.webp',
            description: 'Marvel\'s Guardians of the Galaxy is a single player, narrative driven, episodic game with a fairly linear premise. It is strongly mission based, and the story is loosely based on the comic book series of the same name. There are movies in the franchise which use the same characters as are featured in the game and the original comics.',
            price: 33.02,
            tax: 6.93
        })
    ];

    return CartItem.deleteMany().then(function () {
        return User.deleteMany();
    }).then(function () {
        return user.save();
    }).then(function () {
        return Product.deleteMany();
    }).then(function () {
        return Product.insertMany(products);
    }).then(function () {
        return mongoose.disconnect();
    });

}).catch(function (err) {
    console.log('Error:', err.message);
});