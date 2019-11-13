var express = require("express");
const bodyParser = require("body-parser");
var fs = require("fs");
var database = require("./database.js");
var exec = require("child_process").exec;
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var session = require("express-session");

// process.env.PORT = 2000;


app.use(express.json());
app.use(bodyParser({ extended : false }));
app.use(session({
    resave: false,
    secret: "cookie secret",
    saveUninitialized: false,
    cookie: {secure: false}
}));

var database = new database.database(__dirname + "/database.json");


app.get("/", (req, res) => {

    res.sendFile(__dirname + "/statics/index.htm");

})

app.get("/downloadClient", (req, res) => {

    res.download(__dirname+"/client.py", (err) => {
        if(err)
            console.log(err);
    })

});


async function compile(nick) {

    let p = new Promise((resolve, reject) => {
        exec(`cd ./users/${nick}/ && g++ code.cpp`, (error, stdout, stderr) => {

            // console.log("this one: ",stderr);

            resolve(stderr);

        });

    });

    return p;

}



async function run(nick) {

    let p = new Promise((resolve, reject) => {

        exec(`cd ./users/${nick}/ && ./a.out < input.txt`,{encoding: "utf8"} ,(err, stdout, stderr) => {

            // if(err)
            //     console.log(err)

            var data = {
                output: stdout,
                running_error: stderr
            }

            resolve(data);

        });
    });

    return p;

}

async function render(nick) {

    // console.log("started");

    let p = new Promise((resolve, reject) => {

        compile(nick).then( (compilation_error) => {

            // console.log("ce: ",compilation_error);

            if(compilation_error == ""){
                run(nick).then( (data) => {

                    resolve(data);

                })

            }
            else{

                var output = {};

                output["compilation_error"] = compilation_error
                // console.log("output from render: ", output);

                resolve(output);
            }
        });


    })

    return p;

};

app.get("/scripts/:name", (req, res) => {

    res.sendFile(__dirname + "/scripts/" + req.params.name);

})



app.get("/startuser", (req, res) => {

    console.log("nick query: ",req.query.nick);

    if(database.exists(req.query.nick))
        res.send({status: "taken:-("});
    else{
        res.send({status: "available"});

        database.push( req.query.nick );

        fs.mkdir(__dirname+"/users/"+req.query.nick, (err) => {
            if(err)
                console.log(err);
            else
                console.log("directory made!!");
        });

    }
});

app.post("/codeupdate", (req, res) => {

    // console.log(req.body);
    fs.writeFileSync(__dirname+`/users/${req.body.nick}/code.cpp`, req.body.code ,{ encoding: "utf8" })
    fs.writeFileSync(__dirname+`/users/${req.body.nick}/input.txt`, "" ,{ encoding: "utf8" })
    res.send("success")

    render(req.body.nick).then((output) => {

        console.log("code update by nick: ", req.body.nick);
        console.log("output: ", output);
        io.emit("code update", output);
        // console.log("code update sent");

    });

});


app.get("/:nick", (req, res) => {

    res.sendFile(__dirname + "/statics/home.htm");

    console.log("nick connected: " + req.params.nick);

    req.session.nick = req.params.nick;

});


io.on("connection", (socket) => {

    socket.on("change in input", (input) => {

        console.log("input updated by nick: ", input.nick);
        fs.writeFileSync(__dirname +`/users/${input.nick}/input.txt`, input.ip, {encoding: "utf8"});
        render(input.nick).then((output) => {

            console.log("code update by nick: ", input.nick);
            console.log("output: ", output);
            io.emit("code update", output);
            // console.log("code update sent");

        });

    })

})



http.listen(8080, () => {

    console.log("server running at port "+8080);

})