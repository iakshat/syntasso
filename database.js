var fs = require("fs");

class database{

    constructor(path) {

        this.path = path;
        this.data = fs.readFileSync(this.path, 'utf8');
        this.data = JSON.parse(this.data);

    }

    print_DB() {

        console.log("print code: ", this.data);

    }

    exists(key) {

        if(this.data.includes(key))
            return 1;
        return 0;

    }

    push(person) {

        // console.log("DB: ", this.data);
        this.data.push(person);
        fs.writeFile(this.path, JSON.stringify(this.data), (err) => {
            console.log(err);
        })
        // console.log("print frm db: ", this.data);

    }

}


module.exports.database = database;