mysql = require("mysql2");
inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",


	port: 3306,

	user: "root",

	password: "rootroot",
	database: "bamazon_db"
});

function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero/positive number.';
		
		console.log("\n===================================\n");
	}
}

connection.connect(function (err) {
	if (err) throw err;

	runBamazon();
});



function runBamazon() {
	dbPull = 'SELECT * FROM products';


	connection.query(dbPull, function (err, data) {
		if (err) throw err;
		console.log('\n');
		console.log('=====================\n');
		console.log('WELCOME TO BAMAZON!! \n');
		console.log('=====================\n');
		console.log('Current Inventory: \n');
		console.log('=====================\n');

		var productInfo = '';
		for (var i = 0; i < data.length; i++) {
			productInfo = '';
			productInfo += 'Item ID: ' + data[i].item_id + '  --  ';
			productInfo += ' ' + data[i].product_name + '  --  ';
			// productInfo += 'Department: ' + data[i].department_name + '  //  ';
			productInfo += 'Price: $' + data[i].price + '\n';

			console.log(productInfo);
		}

		console.log("\n===================================\n");


		storePrompts();
	})
}

function continuePrompt() {
	inquirer.prompt([
		{
			name: "continue",
			type: "list",
			message: "Display Products and Prices again?",
			choices: ["Yes", "No"]
		}
	])
		.then(data => {
			if (data.continue === "Yes") {
				runBamazon();
			} else {
				storePrompts();
			}
		});
}

function storePrompts() {

	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Enter Item ID which you would like to purchase.',
			validate: validateInput,

		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many would you like to order?',
			validate: validateInput,

		}
	]).then(function (input) {

		var item = input.item_id;
		var quantity = input.quantity;


		var dbPull = 'SELECT * FROM products WHERE ?';

		connection.query(dbPull, { item_id: item }, function (err, data) {
			if (err) throw err;

			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				runBamazon();

			} else {
				var productData = data[0];

				if (quantity <= productData.stock_quantity) {

					console.log("\n===================================\n");
					console.log('Order Placed! You should receive your item(s) in 5-7 business days. (Or possibly much much longer).');


					var updateDb = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

					connection.query(updateDb, function (err, data) {
						if (err) throw err;

						console.log("\n===================================\n");
						console.log('Order confirmed. Your total is $' + productData.price * quantity + ' (plus tax).');
						console.log('Thank you for shopping Bamazon!!!');
						console.log("\n===================================\n");


						connection.end();
					})
				} else {
					console.log("\n===================================\n");
					console.log('Sorry, not enough products available in inventory.');
					console.log('Please modify your order.');
					console.log("\n===================================\n");

					continuePrompt();
				}
			}
		})
	})
}