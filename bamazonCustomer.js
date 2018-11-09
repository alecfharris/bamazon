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
    displayTable();
   

});
function displayTable() {
    connection.query("SELECT * FROM products", function (err, res) {
        var count = 0;
        while (count < res.length){
            console.log("ID: " + res[count].item_id + " || Product Name: " + res[count].product_name + " || Department: " + res[count].department_name +
                " || Price: $" + res[count].price + " || Stock: " + res[count].stock_quantity);
            count++;
            }

            if(count === res.length){
                runSearch();
            }
    })
}
function runSearch() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Please input the ID of the product you would like to purchase: ",
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
            message: "Please input how many you would like to buy: ",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ])
    .then(function(answer) {
       updateStock(answer);
    })
}

function updateStock(answer) {
    var query = "SELECT item_id, stock_quantity FROM products WHERE ?";
    connection.query(query, {item_id: answer.id}, function(err, res) {
        if (res[0].stock_quantity < answer.quantity){
            console.log("Insufficient quantity!\n")
            displayTable();
        }
        else{
            var newStock = res[0].stock_quantity - answer.quantity;
            var updateQuery = "UPDATE products SET ? WHERE ?";
            connection.query(updateQuery, [{stock_quantity: newStock}, {item_id: answer.id}], function(err, res) {
                console.log("New stock: " + newStock);
                calculateCost(answer);
            });
        }
    })
}

function calculateCost(answer) {
    var query = "SELECT price, product_sales FROM products WHERE ?";
    connection.query(query, {item_id: answer.id}, function(err, res) {
        var cost = res[0].price * answer.quantity;
        cost = Math.round((cost + 0.00001) * 100) / 100
        var sales = res[0].product_sales + cost;
        salesQuery = "UPDATE products SET ? WHERE ?";
        connection.query(salesQuery, [{product_sales: sales}, {item_id: answer.id}], function (err, res) {
            if (err) throw err;
        })
    console.log("Total: $" + cost + '\n');
});
    displayTable(); 
}