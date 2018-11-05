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
        count = 0;
        while (count < res.length){
            console.log("ID: " + res[count].item_id + " || Product Name: " + res[count].product_name + " || Department: " + res[count].department_name +
                " || Price: $" + res[count].price + " || Stock: " + res[count].stock_quantity);
            count++;
            }

            if(count === res.length){
                runSearch();
            }
        // for (var i = 0; i < res.length; i++) {
        //     console.log("ID: " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Department: " + res[i].department_name +
        //         " || Price: $" + res[i].price + " || Stock: " + res[i].stock_quantity);
        // }
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
            newStock = res[0].stock_quantity - answer.quantity;
            updateQuery = "UPDATE products SET ? WHERE ?";
            connection.query(updateQuery, [{stock_quantity: newStock}, {item_id: answer.id}], function(err, res) {
                console.log("New stock: " + newStock);
                calculateCost(answer);
            });
        }
    })
}

function calculateCost(answer) {
    var query = "SELECT price FROM products WHERE ?";
    connection.query(query, {item_id: answer.id}, function(err, res) {
        var cost = res[0].price * answer.quantity;
        cost = Math.round((cost + 0.00001) * 100) / 100
    console.log("Total: $" + cost + '\n');
});
    displayTable(); 
}