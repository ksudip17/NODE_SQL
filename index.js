const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override")

app.use(methodOverride("_method"))
app.use(express.urlencoded({extended : true}))
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'demo_app',
  password: 'Sudip.17'
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),  
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

//Home Route
app.get("/" , (req, res) => {
    let q = `SELECT count(*) FROM user`;

    try {
  connection.query(q,  (err, result) => {
    if (err) throw err;
    let count = result[0] ["count(*)"];
    res.render("home.ejs", {count});
  });
} catch (err) {
  console.log(err);
  res.send("ERROR IN DATABASE")
}
})

//GET or SHOW Users Route
app.get("/users" , (req, res) => {
  q = `SELECT * FROM user`;

  try {
    connection.query(q,  (err, users) => {
      if (err) throw err;
      res.render("showusers.ejs", {users})
    });
  } catch (err) {
    console.log(err);
    res.send("ERROR IN DATABASE")
  }

})

//EDIT Route
app.get("/users/:id/edit" , (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q,  (err, result) => {
      if (err) throw err;
      let user = result[0]
      res.render("edit.ejs", {user})
    });
  } catch (err) {
    console.log(err);
    res.send("ERROR IN DATABASE")
  }
  
})

//UPDATE (DATABASE) Route
app.patch("/users/:id" , (req, res) => {

  let {id} = req.params;
  let {password : formPass, username : newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q,  (err, result) => {
      if (err) throw err;
      let user = result[0]

      if (formPass != user.password) {
        res.send("WRONG PASSWORD")
      } else {
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
        connection.query(q2, (err, result)=> {
          if (err) throw err;
          res.redirect("/users");
        })
      }
    });
  } catch (err) {
    console.log(err);
    res.send("ERROR IN DATABASE")
  }
  
})

//ADDING A NEW USER
app.get("/users/new", (req, res) => {
  res.render("newuser.ejs");
});

app.post("/users", (req, res) => {
  let { username, email, password } = req.body;
  let id = faker.string.uuid();
  let q = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;

  try {
    connection.query(q, [id, username, email, password], (err, result) => {
      if (err) throw err;
      res.redirect("/users");
    });
  } catch (err) {
    console.log(err);
    res.send("ERROR IN DATABASE");
  }
});

//DELETING A USER FROM DB
app.get("/users/:id/delete", (req, res) => {
  let { id } = req.params;
  res.render("delete.ejs", { id });
});

app.delete("/users/:id", (req, res) => {
  let { id } = req.params;
  let { username, password } = req.body;

  let q = `SELECT * FROM user WHERE id = ?`;

  connection.query(q, [id], (err, result) => {
    if (err) throw err;
    let user = result[0];

    if (!user || user.username !== username || user.password !== password) {
      return res.send("Invalid credentials. User not deleted.");
    }

    let q2 = `DELETE FROM user WHERE id = ?`;
    connection.query(q2, [id], (err, result) => {
      if (err) throw err;
      res.redirect("/users");
    });
  });
});



app.listen("8080", () => {
    console.log("Server is listening in Port 8080");
})

