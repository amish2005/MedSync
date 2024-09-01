// app.js
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const db = require("./database");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.get("/hosp-login", (req, res) => {
  res.render("hos-login", { errorMessage: null });
});

app.post("/hos-login", (req, res) => {
  const { "hospital-number": reg_no, password } = req.body;

  const query =
    "SELECT * FROM hospital_details WHERE registration_no = ? AND password = ?";
  db.query(query, [reg_no, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // Successful login
      req.session.user = results[0];
      res.redirect("/hos-dashboard");
    } else {
      // Failed login
      res.send("Incorrect username or password");
    }
  });
});

app.get("/hos-dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  const query =
    "SELECT hospital_name FROM hospital_details WHERE registration_no = ?";
  db.query(query, [req.session.user.registration_no], (err, results) => {
    if (err) throw err;

    // Extract hospital_name and render the view
    const hospitalName =
      results.length > 0 ? results[0].hospital_name : "Hospital Name Not Found";
    res.render("hos-dashboard", { hospitalName: hospitalName });
  });
});

app.get("/hos-dashboard/bed-availability", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const query = "SELECT * FROM hospital_details WHERE registration_no = ?";
  db.query(query, [req.session.user.registration_no], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const hospitalName = results[0].hospital_name;
      const totalBedsICU = results[0].total_beds_ICU;
      const totalBedsICCU = results[0].total_beds_ICCU;
      const totalBedsCCU = results[0].total_beds_CCU;
      const totalBedsMW = results[0].total_beds_MW;
      const totalBedsGW = results[0].total_beds_GW;
      const totalBedsEW = results[0].total_beds_EW;
      const availableBedsICU = results[0].available_beds_ICU;
      const availableBedsICCU = results[0].available_beds_ICCU;
      const availableBedsGW = results[0].available_beds_GW;
      const availableBedsCCU = results[0].available_beds_CCU;
      const availableBedsMW = results[0].available_beds_MW;
      const availableBedsEW = results[0].available_beds_EW;

      // Render the view with totalBedsICU
      res.render("hos-bed", {
        hospitalName: hospitalName,
        totalBedsICU: totalBedsICU,
        totalBedsICCU: totalBedsICCU,
        totalBedsCCU: totalBedsCCU,
        totalBedsMW: totalBedsMW,
        totalBedsGW: totalBedsGW,
        totalBedsEW: totalBedsEW,
        availableBedsICU: availableBedsICU,
        availableBedsICCU: availableBedsICCU,
        availableBedsCCU: availableBedsCCU,
        availableBedsMW: availableBedsMW,
        availableBedsGW: availableBedsGW,
        availableBedsEW: availableBedsEW,
      });
    } else {
      res.send("Hospital details not found");
    }
  });
});

//The below code if you uncomment it, it will give you only one database that is live hospital bed availability, naam nahi print hoga.

// app.get('/dashboard/bed-availability', (req, res) => {
//     const query = 'SELECT * FROM hospital_summary';

//     db.query(query, (err, results) => {
//         if (err) throw err;

//         if (results.length > 0) {
//             const totalICU = results[0].total_ICU;
//             const totalCCU = results[0].total_CCU;
//             const totalICCU = results[0].total_ICCU;
//             const totalMW = results[0].total_MW;
//             const totalGW = results[0].total_GW;
//             const totalEW = results[0].total_EW;
//             const availableICU =results[0].available_ICU;
//             const availableICCU =results[0].available_ICCU;
//             const availableCCU =results[0].available_CCU;
//             const availableGW =results[0].available_GW;
//             const availableMW =results[0].available_MW;
//             const availableEW =results[0].available_EW;

//             // Pass the data to the EJS template
//             res.render('index2', {
//                 totalICU: totalICU,
//                 totalCCU: totalCCU,
//                 totalMW: totalMW,
//                 totalGW: totalGW,
//                 totalEW: totalEW,
//                 totalICCU: totalICCU,
//                 availableCCU: availableCCU,
//                 availableICCU: availableICCU,
//                 availableICU: availableICU,
//                 availableGW: availableGW,
//                 availableMW: availableMW,
//                 availableEW: availableEW
//             });
//         } else {
//             res.send('Hospital summary not found');
//         }
//     });
// });

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/home");
  });
});

// Session management
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { name, number, email, age, gender, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql =
    "INSERT INTO users (name, number, email, age, gender, password) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, number, email, age, gender, hashedPassword],
    (err, result) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? OR number = ?";
  db.query(sql, [username, username], async (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = user;
        res.redirect("/dashboard");
      } else {
        res.send("Incorrect password!");
      }
    } else {
      res.send("User not found!");
    }
  });
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("index", { user: req.session.user });
  } else {
    res.redirect("/");
  }
});

// app.get('/dashboard/bed-availability', (req, res) => {
//   if (req.session.user) {
//     res.render('index2', { user: req.session.user });
//   } else {
//     res.redirect('/home/bed-availability');
//   }
// });

// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/hos-dashboard/bed-availability", (req, res) => {
  res.render("hos-bed.ejs");
});
// Log out functionality
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.redirect("/home");
  });
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("index");
  } else {
    res.redirect("/home");
  }
});

app.post("/logoutt", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.redirect("/home/bed-availability");
  });
});

app.get("/dashboard/bed-availability", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/home/bed-availability");
  }

  const query = "SELECT * FROM hospital_summary";

  db.query(query, (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const totalICU = results[0].total_ICU;
      const totalCCU = results[0].total_CCU;
      const totalICCU = results[0].total_ICCU;
      const totalMW = results[0].total_MW;
      const totalGW = results[0].total_GW;
      const totalEW = results[0].total_EW;
      const availableICU = results[0].available_ICU;
      const availableICCU = results[0].available_ICCU;
      const availableCCU = results[0].available_CCU;
      const availableGW = results[0].available_GW;
      const availableMW = results[0].available_MW;
      const availableEW = results[0].available_EW;

      // Pass the data to the EJS template, along with the user session data
      res.render("index2", {
        user: req.session.user,
        totalICU: totalICU,
        totalCCU: totalCCU,
        totalMW: totalMW,
        totalGW: totalGW,
        totalEW: totalEW,
        totalICCU: totalICCU,
        availableCCU: availableCCU,
        availableICCU: availableICCU,
        availableICU: availableICU,
        availableGW: availableGW,
        availableMW: availableMW,
        availableEW: availableEW,
      });
    } else {
      res.send("Hospital summary not found");
    }
  });
});

app.get("/home/bed-availability", (req, res) => {
  const query = "SELECT * FROM hospital_summary";

  db.query(query, (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const totalICU = results[0].total_ICU;
      const totalCCU = results[0].total_CCU;
      const totalICCU = results[0].total_ICCU;
      const totalMW = results[0].total_MW;
      const totalGW = results[0].total_GW;
      const totalEW = results[0].total_EW;
      const availableICU = results[0].available_ICU;
      const availableICCU = results[0].available_ICCU;
      const availableCCU = results[0].available_CCU;
      const availableGW = results[0].available_GW;
      const availableMW = results[0].available_MW;
      const availableEW = results[0].available_EW;

      // Pass the data to the EJS template
      res.render("home-index2", {
        totalICU: totalICU,
        totalCCU: totalCCU,
        totalMW: totalMW,
        totalGW: totalGW,
        totalEW: totalEW,
        totalICCU: totalICCU,
        availableCCU: availableCCU,
        availableICCU: availableICCU,
        availableICU: availableICU,
        availableGW: availableGW,
        availableMW: availableMW,
        availableEW: availableEW,
      });
    } else {
      res.send("Hospital summary not found");
    }
  });
});

app.get("/dashboard/adm-pat", (req, res) => {
  if (req.session.user) {
    res.render("pat-adm", { user: req.session.user });
  } else {
    res.redirect("/");
  }
});

app.get("/dashboard/adm-pat/sub-adm-form", (req, res) => {
  if (req.session.user) {
    res.render("admform", { user: req.session.user });
  } else {
    res.redirect("/");
  }
});

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const upload = multer({ storage: storage
    
});

// Routes
//   app.get('/patient-admission-form', (req, res) => {
//     res.render('patient-admission-form');
//   });

app.post(
  "/dashboard/adm-pat/sub-adm-form/submit-admission",
  upload.fields([{ name: "report" }, { name: "prescription" }]),
  (req, res) => {
    const { patientName, age, gender, contactNumber, address, hospital } =
      req.body;
    const report = req.files["report"][0].filename;
    const prescription = req.files["prescription"][0].filename;

    const sql =
      "INSERT INTO admissions (patientID ,patientName, age, gender, contactNumber, address, hospital, report, prescription) VALUES (FLOOR(RAND()*1000000000000),?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [
        patientName,
        age,
        gender,
        contactNumber,
        address,
        hospital,
        report,
        prescription,
      ],
      (err, result) => {
        if (err) throw err;
        res.redirect("/dashboard/adm-pat/sub-adm-form/form-submitted");
      }
    );
  }
);




app.get("/dashboard/adm-pat/sub-adm-form/form-submitted", (req, res) => {
    const query = `SELECT * FROM admissions ORDER BY id DESC 
  LIMIT 1;`;

  db.query(query, (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
        const patientID = results[0].patientID;
        res.render("admformsub", {
            patientID: patientID,
        });
    } else {
        res.send("Patient ID not found")
    }
});
});

    
app.get("/dashboard/adm-pat/adm-status", (req, res) => {
    if (req.session.user) {
      res.render("checkstatus", { user: req.session.user });
    } else {
      res.redirect("/");
    }
  });