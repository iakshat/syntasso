//YOU CAN'T INSTALL NODE IN LAB ;-(

//START WITH PYTHON .....!!!!!!


const fs = require("fs");

var standard_input = process.stdin;

standard_input.setEncoding('utf8');

console.log("Enter the path to ")
standard_input.on("data", (path) => {

    data = data.trim();

    if(data == "exit")
        process.exit();
    else
        console.log("input:", data);

});