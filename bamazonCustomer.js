var mysql = require("mysql");
var prompt = require("prompt");

let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mjordan2",
    database: "amazonCustomer"
});

connection.connect(function (err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');

    let schema = {
        properties: {
            ID: {
                message: "Please enter the ID of the product you would like to buy.",
                // pattern: /^[0-9][0-9]$|^[0-9]$/,
                required: true
            },
            howMany: {
                message: "Please enter how many items you would like to buy.",
                // pattern: /^[0-9][0-9]$|^[0-9]$/,
                required: true
            }
        
        }
    };
    let schema2 = {
        properties: {
            AnotherPurchase: {
                message: "Would you like to buy any more items?.",
                pattern: /(no|n|yes|y)/,
                required: true
            },
        }
    };

    let stopApp = function () {
       return beginApp(err);
       
    }

    let beginApp = function () {
        connection.query("SELECT * FROM Products", function (err, result,next) {
            if (err) throw err;
            return (getamazonCustomerProducts(result));

        });
    }

    let getamazonCustomerProducts = function (products) {
        console.log("Hello, Welcome to Bamazon! Here are all of the products, their costs, and current stock.");
        for (let i = 0; i < products.length; i++) {
            let productsResults = "\r\n" +
                "ItemID: " + products[i].ItemID + "\r\n" +
                "Product Description: " + products[i].ProductName + "\r\n" +
                "Department: " + products[i].DepartmentName + "\r\n" +
                "Price: $ " + products[i].Price + "\r\n" +
                "Current Stock: " + products[i].StockQuantity;
            console.log(productsResults);
        }
        userSelectID();
    }

    let userSelectID = function () {
        prompt.start();
        console.log("Please enter the ID of the product you would like to buy.");

        prompt.get(schema, function (err, result, next) {
            if (err) {
                console.log(err)
            }

            let userChoiceID = parseInt(result.ID);
            let userChoiceHowMany = parseInt(result.howMany);

            let checkInventory = function () {
                connection.query('SELECT * FROM Products WHERE ItemID =' + userChoiceID, function (err, result) {
                    if (err) throw err;


                    let userWantsToBuy = userChoiceHowMany;
                    let productInventory = result[0].StockQuantity;
                    let productsPrice = result[0].Price;
                    let isInStock = productInventory - userWantsToBuy;
                    let totalCost = productsPrice * userWantsToBuy;

                    if (userWantsToBuy > productInventory || productInventory === 0) {
                        console.log("Apologies but there isn't enough in stock to complete your order. Please try again." + "\r\n" + "\r\n");
                        userSelectID();
                    } else {
                        console.log("There are " + result[0].StockQuantity + " of " + result[0].ProductName);
                        console.log("You are purchasing " + userWantsToBuy + " " + result[0].ProductName + "s at $" + result[0].Price + " per item.");
                        console.log("Your total is $" + totalCost);
                        connection.query('UPDATE Products SET StockQuantity = ' + isInStock + ' WHERE ItemID =' + userChoiceID, function (err, result) {
                            if (err) throw err;
                            connection.query('SELECT ItemID, ProductName, DepartmentName, Price, StockQuantity FROM products WHERE ItemID =' + userChoiceID, function (err, result) {
                            });
                        });
                        prompt.get(schema2, function (err, result, next) {
                            if (err) {
                                console.log(err)
                            }
                            console.log(result);
                            let userAnswer = result.AnotherPurchase;
                            if (userAnswer === "n" || userAnswer === "no") {
                                stopApp();
                            } else {
                                beginApp();
                            }
                        });
                    }
                });
            };
            checkInventory();
        });
    }

    beginApp();
});