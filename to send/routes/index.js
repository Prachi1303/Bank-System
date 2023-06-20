var express = require("express");
const pool = require("./pool");
var router = express.Router();
const { v4: uuid, parse } = require("uuid");

/* Function for the formatted date and time  */
function getFormattedDateTime() {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDateTime;
}

/* Rendering the home page */

router.get("/", (req, res) => {
  res.render("index");
});

/* Rendering the create user page */

router.get("/createUser", (req, res) => {
  let error = "";

  if (req.query.error) {
    error = req.query.error;
  }

  res.render("create_user", { error: error });
});

/* Rendering the history page */

router.get("/history", (req, res) => {
  pool.query("select * from transactions", (err, obj) => {
    if (err) {
      console.log(err);
      res.render("transaction_hist", { data: [] });
    } else {
      res.render("transaction_hist", { data: obj });
    }
  });
});

/* Creating user form */

router.post("/createUserForm", (req, res) => {
  const text = req.body;

  pool.query(
    `select * from customers where email = ?`,
    [text.email],
    (err, obj) => {
      if (err) {
        console.log(err);
        res.redirect("/createUser?errror=1");
      } else {
        if (obj.length == 0) {
          pool.query(
            "insert into customers (Name , email , Current_balance , address ) values (?,?,?,?)",
            [
              text.first_name + " " + text.last_name,
              text.email,
              text.balance,
              text.address,
            ],
            (err2, obj2) => {
              if (err2) {
                console.log(err2);
                res.redirect("/createUser?error=1");
              } else {
                res.redirect("/createUser?error=2");
              }
            }
          );
        } else {
          res.redirect("/createUser?error=3");
        }
      }
    }
  );
});

/* For Transfering the amount */

router.post("/transferAmount", (req, res) => {
  const text = req.body;

  pool.query(
    "select * from customers where account = ?",
    [text.sender],
    (err, obj) => {
      if (err) {
        console.log(err);
        res.send({ error: "A Server Error Has Occured !", eid: 0 });
      } else {
        if (obj.length != 0) {
          pool.query(
            "select * from customers where account = ?",
            [text.receiver],
            (err4, obj4) => {
              if (err4) {
                console.log(err4);

                res.send({ error: "A Server Error Has Occured !", eid: 0 });
              } else {
                if (obj4.length == 0) {
                  res.send({
                    error: "Receiver Account Does not Exists !",
                    eid: 0,
                  });
                } else {
                  if (parseInt(obj[0].Current_balance) < text.amount) {
                    res.send({
                      error: "Sender has Insufficient Balance !",
                      eid: 0,
                    });
                  } else {
                    pool.query(
                      "update customers u1, customers u2 set u1.Current_balance = u1.Current_balance - ? , u2.Current_balance = u2.Current_balance + ? where u1.account = ? and u2.account = ?",
                      [text.amount, text.amount, text.sender, text.receiver],
                      (err2, obj2) => {
                        if (err2) {
                          console.log(err2);

                          res.send({
                            error: "A Server Error Has Occured !",
                            eid: 0,
                          });
                        } else {
                          let ref = uuid();
                          let time = getFormattedDateTime();

                          pool.query(
                            `insert into transactions  ( sender, receiver, time, amount , refId , sendAcc, recAcc) values ((select email from customers where account = ${text.sender}) ,(select email from customers where account = ${text.receiver}),?,?,?,?,? )`,
                            [
                              time,
                              text.amount,
                              ref,
                              text.sender,
                              text.receiver,
                            ],
                            (err3, obj3) => {}
                          );

                          res.send({
                            error: `Amount Has Been Transfered Successfully ! Ref Id : ${ref}`,
                            eid: 1,
                          });
                        }
                      }
                    );
                  }
                }
              }
            }
          );
        } else {
          res.send({ error: "Sender's Account Does not Exists !", eid: 0 });
        }
      }
    }
  );
});

module.exports = router;
