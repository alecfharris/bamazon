var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    menuQuestions();

});

function menuQuestions() {
    inquirer.prompt({
        name: "menu",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product"
        ]
    })
    .then(function(answer) {
        switch (answer.menu) {
            case "View Products for Sale":
            productSearch();
            break;

            case "View Low Inventory":
            lowInventorySearch();
            break;

            case "Add to Inventory":
            addInventory();
            break;

            case "Add New Product":
            newProduct();
            break;
        }
    });
}

function productSearch() {
    var query = "SELECT * FROM products";
    connection.query(query, function(err, res) {
        count = 0;
        console.log('\n');
        while (count < res.length){
            console.log("ID: " + res[count].item_id + " || Product Name: " + res[count].product_name + " || Department: " + res[count].department_name +
                " || Price: $" + res[count].price + " || Stock: " + res[count].stock_quantity);
            count++;
            }
    });
    menuQuestions();
}

function lowInventorySearch() {
    var query = "SELECT * from products WHERE stock_quantity < 5";
    connection.query(query, function(err, res){
        if (res.length > 0){
            count = 0;
            console.log('\n');
            while (count < res.length){
                console.log("ID: " + res[count].item_id + " || Product Name: " + res[count].product_name + " || Department: " + res[count].department_name +
                    " || Price: $" + res[count].price + " || Stock: " + res[count].stock_quantity);
                count++;
                }
        }
        else {
            console.log("\nNo low inventory!")
        }  
    });
    menuQuestions();
}

function addInventory() {
        inquirer.prompt([{
            name: "id",
            type: "input",
            message: "Please input the ID of the item you would like to increase the inventory of: ",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "amount",
            type: "input",
            message: "Please input the amount you would like to increase the inventory by: ",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ])
    .then(function(answer) {
        var query = "SELECT item_id, stock_quantity FROM products WHERE ?";
        // Select item stock
        connection.query(query, {item_id: answer.id}, function(err, res){
            // Set new stock number
            var newStock = parseInt(res[0].stock_quantity) + parseInt(answer.amount);
            var updateQuery = "UPDATE products SET ? WHERE ?"; 
            // Update stock
            connection.query(updateQuery, [{stock_quantity: newStock}, {item_id: answer.id}], function(err, res){
                console.log("New stock: " + newStock);
            })
        })
        menuQuestions();
    });
 
}

function newProduct() {
    inquirer.prompt([{
        name: "productName",
        type: "input",
        message: "Please input the name of the product: "
    },
    {
        name: "departmentName",
        type: "input",
        message: "Please input the name of the department: "
    },
    {
        name: "price",
        type: "input",
        message: "Please input the price: ",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
    },
    {
        name: "quantity",
        type: "input",
        message: "Please input the stock quantity: ",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
    }
    ])
    .then(function(answer) {
        var query = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?)";
        var values = [answer.productName, answer.departmentName, answer.price, answer.quantity];
        connection.query(query, [values], function(err, res) {
            if (err) throw err;
            console.log("Item added!")
        });
        menuQuestions();
    });
 
}