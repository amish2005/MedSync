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




app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("index", { user: req.session.user });
  } else {
    res.redirect("/");
  }
});






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
      res.redirect("/hosp-login?error=true");
    }
  });
});






app.get("/hos-dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/home");
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
    return res.redirect("/home");
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
  
    // Check if email or number already exists
    const checkQuery = "SELECT * FROM users WHERE email = ? OR number = ?";
    db.query(checkQuery, [email, number], async (err, results) => {
      if (err) throw err;
  
      if (results.length > 0) {
        // Email or number already registered
        res.redirect("/signup?error=true");
      } else {
        // Insert new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql =
          "INSERT INTO users (name, number, email, age, gender, password) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [name, number, email, age, gender, hashedPassword], (err, result) => {
          if (err) throw err;
          res.redirect("/");
        });
      }
    });
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
        res.redirect("/?error=incorrect-password");
      }
    } else {
      res.redirect("/?error=user-not-found");
    }
  });
});













app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("index", { user: req.session.user });
  } else {
    res.redirect("/home");
  }
});

  









// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});













app.get("/home", (req, res) => {
  res.render("home");
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






















app.get('/dashboard/bed-availability', (req, res) => {
    if (!req.session.user) {
      return res.redirect("/home/bed-availability");
    }
  
    // First query: Retrieve hospital names
    const hospitalQuery = 'SELECT hospital_name FROM hospital_details';
  
    db.query(hospitalQuery, (err, hospitalResults) => {
      if (err) throw err;
  
      // Second query: Retrieve bed availability summary
      const summaryQuery = "SELECT * FROM hospital_summary";
  
      db.query(summaryQuery, (err, summaryResults) => {
        if (err) throw err;
  
        if (summaryResults.length > 0) {
          const totalICU = summaryResults[0].total_ICU;
          const totalCCU = summaryResults[0].total_CCU;
          const totalICCU = summaryResults[0].total_ICCU;
          const totalMW = summaryResults[0].total_MW;
          const totalGW = summaryResults[0].total_GW;
          const totalEW = summaryResults[0].total_EW;
          const availableICU = summaryResults[0].available_ICU;
          const availableICCU = summaryResults[0].available_ICCU;
          const availableCCU = summaryResults[0].available_CCU;
          const availableGW = summaryResults[0].available_GW;
          const availableMW = summaryResults[0].available_MW;
          const availableEW = summaryResults[0].available_EW;
  
          // Pass the data to the EJS template, along with the user session data and hospital names
          res.render("index2", {
            user: req.session.user,
            hospitals: hospitalResults,
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
  });























  app.get('/dashboard/bed-availability/search', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/home/bed-availability");
      }
    // First query: Retrieve hospital names
    const hospitalQuery = 'SELECT hospital_name FROM hospital_details';
  
    db.query(hospitalQuery, (err, hospitalResults) => {
      if (err) throw err;
  
    
    const hospitalName = req.query.hospital;
    const sql = `
        SELECT available_beds_ICU, total_beds_ICU, available_beds_GW, total_beds_GW, available_beds_MW, total_beds_MW, available_beds_EW, total_beds_EW, available_beds_ICCU, total_beds_ICCU, available_beds_CCU, total_beds_CCU
        FROM hospital_details
        WHERE hospital_name = ?`;

    db.query(sql, [hospitalName], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.render('index3.ejs', { hospital: hospitalName, bedDetails: result[0], hospitals: hospitalResults });
        } else {
            res.send('No hospital found with that name');
        }
    });
});
});











app.get("/home/bed-availability", (req, res) => {
  const query = `SELECT * FROM hospital_summary ORDER BY id DESC 
  LIMIT 1;`;

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
















app.get('/dashboard/adm-pat/sub-adm-form', (req, res) => {
    if (req.session.user) {
    db.query('SELECT registration_no, hospital_name FROM hospital_details', (err, results) => {
      if (err) throw err;
      res.render('admform', { hospitals: results, user: req.session.user });
    });
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


  app.get("/hos-dashboard/admissions", (req, res) => {
    if (!req.session.user) {
      return res.redirect("/hosp-login");
    }
  
    const hospitalRegNo = req.session.user.registration_no;
    const hosName = req.session.user.hospital_name;
  
    const query =
      "SELECT * FROM admissions WHERE hospital = ?";
    db.query(query, [hospitalRegNo], (err, results) => {
      if (err) throw err;
  
      res.render("hos-pat-adm", { admissions: results,
                                user: req.session.user,
       });
    });
  });


  // Route to update the status of a patient admission request
app.post("/hos-dashboard/admissions/:id/accept", (req, res) => {

    const admissionId = req.params.id;

    if (!req.session.user) {
      return res.redirect("/hosp-login");
    }
  
    const status = 'accept';
    
    const query =
      "UPDATE admissions SET status = ? WHERE id = ? AND hospital = ?";
    db.query(query, [status, admissionId, req.session.user.registration_no], (err, result) => {
      if (err) throw err;
  
      res.redirect("/hos-dashboard/admissions");
    }); })

    app.post("/hos-dashboard/admissions/:id/reject", (req, res) => {

        const admissionId = req.params.id;
    
        if (!req.session.user) {
          return res.redirect("/hosp-login");
        }
      
        const status = 'reject';
        
        const query =
          "UPDATE admissions SET status = ? WHERE id = ? AND hospital = ?";
        db.query(query, [status, admissionId, req.session.user.registration_no], (err, result) => {
          if (err) throw err;
      
          res.redirect("/hos-dashboard/admissions");
        }); })


        app.post('/dashboard/adm-pat/adm-status/check-status', (req, res) => {
            const { applicationNumber, contactNumber } = req.body;
        
            const query = 'SELECT status FROM admissions WHERE patientID = ? AND contactNumber = ?';
            db.query(query, [applicationNumber, contactNumber], (err, results) => {
                if (err) throw err;
        
                if (results.length > 0) {
                    // If match found, render a page with the status
                    const status = results[0].status;
                    res.render('adm-status', { status }); // Ensure you have a status.ejs file to display the result
                } else {
                    // If no match found, render the form page with an error message
                    res.render('adm-status', { error: 'Invalid application number or contact number.' });
                }
            });
        });







// Serve the bed availability page
app.get('/hos-dashboard/manage-beds', (req, res) => {
    // const hospitalId = 1; // Replace with actual logic to get the hospital ID

    if (!req.session.user) {
        return res.redirect("/hosp-login");
      }

    db.query('SELECT * FROM hospital_details WHERE registration_no = ?', [req.session.user.registration_no], (err, results) => {
        if (err) throw err;
        const details = results[0];
        res.render('hos-manage-bed', {
            hospitalName: details.hospital_name,
            availableBedsICU: details.available_beds_ICU,
            totalBedsICU: details.total_beds_ICU,
            availableBedsGW: details.available_beds_GW,
            totalBedsGW: details.total_beds_GW,
            availableBedsMW: details.available_beds_MW,
            totalBedsMW: details.total_beds_MW,
            availableBedsEW: details.available_beds_EW,
            totalBedsEW: details.total_beds_EW,
            availableBedsICCU: details.available_beds_ICCU,
            totalBedsICCU: details.total_beds_ICCU,
            availableBedsCCU: details.available_beds_CCU,
            totalBedsCCU: details.total_beds_CCU
        });
    });
});

// Update bed availability
app.post('/update-beds', (req, res) => {
    const { department, action } = req.body;

    
    let field = '';
    if (department === 'ICU') field = 'available_beds_ICU';
    else if (department === 'General Ward') field = 'available_beds_GW';
    else if (department === 'Maternity Ward') field = 'available_beds_MW';
    else if (department === 'Emergency') field = 'available_beds_EW';
    else if (department === 'ICCU') field = 'available_beds_ICCU';
    else if (department === 'CCU') field = 'available_beds_CCU';

    const query = `UPDATE hospital_details SET ${field} = ${field} ${action === 'push' ? '+' : '-'} 1 WHERE registration_no = ?`;

    db.query(query, [req.session.user.registration_no], (err) => {
        if (err) throw err;
        res.redirect('/hos-dashboard/manage-beds');
    });
});
















































app.get('/dashboard/opd', (req, res) => {
    
        res.render('index-opd-home');
  
});








// Route to select hospital
app.get('/dashboard/opd/sel-hosp1', (req, res) => {
    const hospitalsQuery = 'SELECT registration_no, hospital_name FROM hospital_details';
    db.query(hospitalsQuery, (err, hospitals) => {
        if (err) throw err;
        res.render('index-opd-hosp', { hospitals });
    });
});



// Route to select doctor based on selected hospital
app.post('/dashboard/opd/sel-hosp1/sel-doct1', (req, res) => {
    const hospitalRegNo = req.body.hospital;
    const doctorsQuery = 'SELECT doctor_id, name FROM doctors WHERE hospital_reg_no = ?';
    db.query(doctorsQuery, [hospitalRegNo], (err, doctors) => {
        if (err) throw err;
        res.render('index-opd-doct', { doctors });
    });
});



// Route to view doctor's schedule
app.post('/dashboard/opd/sel-hosp1/sel-doct1/view-schedule', (req, res) => {
    const doctorId = req.body.doctor;
    const scheduleQuery = `
        SELECT 
            schedule_id, date, timings, contact, doctor_name 
        FROM 
            doctor_schedule_with_name
        WHERE 
            doctor_id = ?`;
    db.query(scheduleQuery, [doctorId], (err, schedule) => {
        if (err) throw err;
        res.render('index-opd-sch', { schedule});
    });
});

// Route to book appointment
app.get('/book-appointment/:scheduleId', (req, res) => {
    


        if (req.session.user) {
            const scheduleId = req.params.scheduleId;
    const bookQuery = `
        INSERT INTO appointments (patient_id, schedule_id, patient_name, patient_age, patient_gender, patient_contact) 
        VALUES (FLOOR(RAND()*100000), ?, ?, ?, ?, ?)`;
    db.query(bookQuery, [scheduleId, req.session.user.name, req.session.user.age, req.session.user.gender, req.session.user.number], (err, result) => {
        if (err) throw err;
        res.redirect('/book-appointment/:scheduleID/submitted');
        ; 
    });
          } else {
            res.redirect("/");
          }

});



app.get("/book-appointment/:scheduleID/submitted", (req, res) => {
    if (!req.session.user) {
        res.redirect('/hosp-login');

    }
    const query = `SELECT patient_id, patient_name, timings, patient_age, patient_gender, DATE_FORMAT(schedule_date, '%d-%m-%Y') AS formatted_date FROM appointment_date_timingss ORDER BY appointment_id DESC 
  LIMIT 1;`;

  db.query(query, (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
        const patientID = results[0].patient_id;
        const patientName = results[0].patient_name;
        const timings = results[0].timings;
        const patientAge = results[0].patient_age;
        const patientGender = results[0].patient_gender;
        const scheduleDate = results[0].formatted_date;
        
       


        res.render("index-app-booked", {
            patientID: patientID,
            patientName: patientName,
            patientAge: patientAge,
            patientGender: patientGender,
            scheduleDate: scheduleDate,
            timings: timings
        });
    } else {
        res.send("User not registered")
    }
});
});































app.get('/hos-dashboard/app-manage', (req, res) => {
    if (req.session.user) {
      
    const hospitalName = req.session.user.hospital_name;
    const sql = `SELECT appointment_timings, patient_contact, patient_name, patient_age, doctor_name
                 FROM appointment_date_timing_reg_name WHERE hospital_reg_no = ?`;



    db.query(sql, [req.session.user.registration_no], (err, results) => {
        if (err) throw err;
        res.render('hos-opd-manage', { appointments: results, hospitalName: hospitalName });
    });
}

      else {
        res.redirect('/hosp-login');
      }
});







  













// Fetch inventory data for a specific hospital
app.get('/hos-dashboard/inventory', (req, res) => {
    if (req.session.user) {
        const query = `SELECT id, medicine_name, salt, quantity, registration_no, DATE_FORMAT(expiry_date, '%d-%m-%Y') AS formatted_date FROM inventory WHERE registration_no = ?`;
    
    db.query(query, [req.session.user.registration_no], (err, result) => {
        if (err) throw err;
        res.render('inventory', { inventory: result, formattedDate: result.formatted_date });
    });
    }
    else {
        res.redirect('/hosp-login');
    }
});

// Add new medicine
app.post('/hos-dashboard/inventory/add', (req, res) => {
    
    if (req.session.user) {
        const { medicine_name, salt, quantity, expiry_date } = req.body;
        const query = 'INSERT INTO inventory (medicine_name, salt, quantity, expiry_date, registration_no) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [medicine_name, salt, quantity, expiry_date, req.session.user.registration_no], (err, result) => {
        if (err) throw err;
        res.send('Medicine added successfully');
    });
    }

    
});

// Update medicine quantity
app.post('/hos-dashboard/inventory/update', (req, res) => {
    const { id, change } = req.body;
    const query = 'UPDATE inventory SET quantity = quantity + ? WHERE id = ?';
    
    db.query(query, [change, id], (err, result) => {
        if (err) throw err;
        res.send('Quantity updated successfully');
    });
});



app.post('/inventory/delete/:id', (req, res) => {

    if (req.session.user) {
    const medicineId = req.params.id;
    const sql = `DELETE FROM inventory WHERE id = ? AND registration_no = ?`;

    db.query(sql, [medicineId, req.session.user.registration_no], (err, result) => {
        if (err) {
            return res.json({ success: false });
        }
        res.json({ success: true });
    });
}
});










