// Basic Setup
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listings = require("./routes/listing");
const reviews = require("./routes/review");
const session = require("express-session");
const flash = require("connect-flash");


app.set("view engine","ejs");
app.engine("ejs",ejsMate);
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride("_method"));

const sessionOptions = {
  secret:"mysupersecretkey123",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge:7 * 24 * 60 * 60 * 1000
  }
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  next();
});

main()
.then((res)=>{
    console.log("Connection Successfull");
})
.catch((err)=>{
    console.log(err);
});
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


app.get("/", (req, res) => {
  // res.send("Hi, I am root");
  res.redirect("/listings");
});

app.use("/listings",listings);
app.use("/listings/:listingId/reviews",reviews);


app.use((req,res,next)=>{  // If our route dosent match to all the above routes then we will throw our custom error
  next(new ExpressError(404,"Page not found!"))
});

app.use((err,req,res,next)=>{
  const {status=500,message="something went wrong"} = err;
  // res.status(status).send(message);
  res.status(status).render("error",{err});
});



// Express default error handler also present Here


app.listen(port,(req,res)=>{
    console.log("Server is started and listning at port 3000");
});

