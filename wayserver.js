const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const { json } = require('body-parser');

let PORT=process.env.PORT || 3000;

// Create express app and multer instance
const app = express();
const upload = multer({ dest: 'uploads/' });

let gare;
let buttonValue;
let cars_id;
let prak;
let hour;
let email;

// Set up mysql connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: `${process.env.DB_PASSWORD}`,

  database: `${process.env.DB_NAME}`,
});

// Use express middleware to parse JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route to receive button value
app.post("/sendButtonValue", (req, res) => {
  gare = req.body.value;
  console.log(gare);
  res.send("Button value received");
});

// Route to receive selected hour
app.post("/sendhour", (req, res) => {
  hour = req.body.value;
  console.log(hour);

  connection.connect((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to connect to the database." });
    }
  connection.query(`SELECT hour,cars_id FROM ${buttonValue} where hour=?`, [hour], (err, result) => {
    if (err) {
      console.error(`Error retrieving data from table "${buttonValue}": ${err}`);
      return res.status(500).json({ error: "Failed to retrieve data from the database." });
    }
    cars_id = result[0].cars_id;
    console.log(`The id is: ${cars_id}`);
  });
  connection.connect((err) => {
    if (err) {
      console.error(err);
      return;
    }
    // Check if email and password match in the database
    connection.query(`SELECT*FROM cars where cars_id=?`,[cars_id], (err, result) => {
      if (err) {
        console.log(cars_id)
        console.error(`Error retrieving data from table "${buttonValue}": ${err}`);
        return res.status(500).json({ error: "Failed to retrieve data from the database." });
      }
  //prak y imodoka
    });
     })

  });
 
});

// Route to receive selected button value
app.post("/getValue", (req, res) => {
  buttonValue = req.query.value;
  console.log(`Button value received: ${buttonValue}`);
});

// Serve login form on root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join('F:/special dox/pp/location.html'));
});

// Route to receive email
app.post('/getemail', (req, res) => {
  res.sendFile(path.join('F:/special dox/pp/message.html'));
});

// Route to send email after finishing
app.post('/finish', (req, res) => {
  email = req.body.email;
  sendEmail(email);
  res.sendFile(path.join('F:/special dox/pp/lastmsg.html'));
  console.log(email);
});
// 
//Route to retrieve data about ways
app.post('/getways', upload.single('profileImage'), (req, res) => {
  connection.connect((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to connect to the database." });
    }
    connection.query(
      `SELECT * FROM ${gare}`, (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: "Failed to retrieve data from the database." });
        }

        if (results.length > 0) {
          console.log(results);
          // Serve data endpoint
          app.post('/data', (req, res) => {
            res.json(results);
          });

          // Redirect to ways page
          res.status(200).sendFile(path.join('F:/special dox/pp/ways.html'));
        } else {
          res.status(404).json({ error: "No data found." });
        }
      }
    );
  });
});

app.get('/cars.html', (req, res) => {
  res.sendFile(path.join('F:/special dox/pp/cars.html'));
});

app.post("/get-names", (req, res) => {
  connection.query(`SELECT hour,cars_id FROM ${buttonValue}`, (err, result) => {
    if (err) {
      console.error(`Error retrieving data from table "${buttonValue}": ${err}`);
      return res.status(500).json({ error: "Failed to retrieve data from the database." });
    }
   // console.log(`Data retrieved successfully from table "${buttonValue}":`, result);
    if (result.length > 0) {
      res.json(result.map(row => row.hour));
    } else {
      res.status(404).json({ error: "No data found." });
    }
  });
});





function sendEmail(address){

  let transporter = nodemailer.createTransport({
    service: 'hotmail',
    secure: false,
    auth: {
        user:'starlingways@outlook.com',
        pass: 'Starlingway'
    }
});


let mailOptions = {
    from: `Starling way <starlingways@outlook.com>`, 
    to:`${address}`, 
    subject: '---- Ticket Booking---------------', 
    html: `Mukkiriya wacu turakumenyesha ko Wafashe umwanya mu Modoka irahaguruka saa: ifite Prak ya Mukore kuburyo muhagerera mbere y iminota 15. kugihe Imodoka itarahaguruka`
, 
};


transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(`message was not sent because of `+error);
    }
    console.log(`Message sent: %s to ${email}`, info.messageId);
});
}


app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}. to..`);
});