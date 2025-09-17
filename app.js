// Basic Setup
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

app.set("view engine","ejs");
app.engine("ejs",ejsMate);
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride("_method"));

main()
.then((res)=>{
    console.log("Connection Successfull");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/", (req, res) => {
  // res.send("Hi, I am root");
  res.redirect("/listings");
});

//Index Route(Shows all listings)
// Correct syntax of handling promise by async-await is try and catch block

// app.get("/listings", async (req,res,next) => {
//   try{
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
//   }catch(err){
//     // console.log(err);
//     next(err);
//   }
// });

app.get("/listings",
  wrapAsync(async (req,res,next)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
)

//New Route(Ejs form for creating new listing)

// app.get("/listings/new", (req, res) => {
//   res.render("listings/new.ejs");
// });

app.get("/listings/new",
  wrapAsync(async (req,res,next)=>{
    res.render("listings/new.ejs");
  })
)

//Show Route(Shows particular listing)

// app.get("/listings/:id", async (req,res,next) => {
//   let { id } = req.params;
//   try{
//     const listing = await Listing.findById(id);
//     res.render("listings/show.ejs", { listing });
//   }catch(err){
//     // console.log(err);
//     next(err);
//   }
// });

app.get("/listings/:id",
  wrapAsync(async (req,res,next)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  })
)

//Create Route(After new.ejs form submission creating new listing in db)

// app.post("/listings", async (req, res,next) => {
//     // const {title,description,image,...} = req.body; oR
//   const newListing = new Listing(req.body.listing);
//   try{
//     await newListing.save();
//     res.redirect("/listings");
//   }catch(err){
//     // console.log(err);
//     next(err);
//   }
// });

app.post("/listings",
  wrapAsync(async (req,res,next)=>{
    if(!req.body.listing){ // Thsis when we send a req by hoop/postman without a req body
      throw new Error(400,"Send valid data for listing!");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
)

//Edit Route(Form for editing)

// app.get("/listings/:id/edit", async (req, res ,next) => {
//   let { id } = req.params;
//   try{
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
//   }catch(err){
//    // console.log(err);
//    next(err);
//   }
// });

app.get("/listings/:id/edit",
  wrapAsync(async (req,res,next)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
)

//Update Route(Taking data of edit forma and updating)

// app.put("/listings/:id", async (req, res ,next) => {
//   let { id } = req.params;
//   try{
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // Spread operator used Here(...) 
//     res.redirect(`/listings/${id}`);
//   }catch(err){
//     // console.log(err);
//     next(err);
//   }
// });

app.put("/listings/:id",
  wrapAsync(async (req,res,next)=>{
    if(!req.body.listing){ // Thsis when we send a req by hoop/postman without a req body
      throw new Error(400,"Send valid data for listing!");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // Spread operator used Here(...) 
    res.redirect(`/listings/${id}`);
  })
)

//Delete Route(deleting particular listing)

// app.delete("/listings/:id", async (req, res ,next) => {
//   let { id } = req.params;
//     try{
//         let deletedListing = await Listing.findByIdAndDelete(id);
//         console.log(deletedListing);
//         res.redirect("/listings");
//     }
//     catch(err){
//         console.log(err);
//         next(err);
//     }
// });

app.delete("/listings/:id",
  wrapAsync(async (req,res,next)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  })
)


app.use((req,res,next)=>{  // If our route dosent match to all the above routes then we will throw our custom error
  next(new ExpressError(404,"Page not found!"))
})

app.use((err,req,res,next)=>{
  const {status=500,message="something went wrong"} = err;
  res.status(status).send(message);
})

// Express default error handler also present Here

app.listen(port,(req,res)=>{
    console.log("Server is started and listning at port 3000");
})

