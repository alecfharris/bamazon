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
            "View Product Sales by Department",
            "Create New Department"
        ]
    })
    .then(function(answer) {
        switch (answer.menu) {
            case "View Product Sales by Department":
            departmentSearch();
            break;

            case "Create New Department":
            createNewDepartment();
            break;
        }
    });
}

function departmentSearch(){
    var query = "SELECT * FROM departments";
    var salesQuery = "SELECT product_sales FROM products WHERE ?"
    var department = {
        name: [],
        sales: []
    };
    var salesTotal = 0;
    connection.query(query, function(err, res) {
        var mainRes = res;
        // Add department names to an array
        for (var i = 0; i < res.length; i++) {
            department.name.push(res[i].department_name)
        }
        // Increase Sales Total
        for (let i = 0; i < department.name.length; i++) {
            connection.query(salesQuery, {department_name: department.name[i]}, function (err, res) {
                for (let j = 0; j < res.length; j++) {
                    if (res[j].product_sales != 0) {
                        salesTotal = salesTotal + res[j].product_sales;
                    }

                    else {
                        salesTotal = parseInt(salesTotal + 0);
                    }
                    
                }
            // Push Sales Total to sales array
            department.sales.push(salesTotal);
            salesTotal = 0;
            console.log("ID: " + mainRes[i].department_id + " || Department Name: " + department.name[i] + " || Overhead Costs: " + mainRes[i].over_head_costs +
                " || Product Sales: " + department.sales[i] + " || Total Profit: " + parseInt(department.sales[i] - mainRes[i].over_head_costs));
            })    
        }
    });
    menuQuestions();
}

function createNewDepartment() {
    inquirer.prompt([
    {
        name: "departmentName",
        type: "input",
        message: "Please input the name of the department: "
    },
    {
        name: "overhead",
        type: "input",
        message: "Please input the overhead costs: ",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
    }
    ])
    .then(function(answer) {
        var query = "INSERT INTO departments (department_name, over_head_costs) VALUES (?)";
        var values = [answer.departmentName, answer.overhead];
        connection.query(query, [values], function(err, res) {
            if (err) throw err;
            console.log("Department added!")
        });
        menuQuestions();
    });
}