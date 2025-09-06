// Basic Setup
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static("public"));
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
  res.send("Hi, I am root");
});

//Index Route(Shows all listings)
// Correct syntax of handling promise by async-await is try and catch block
app.get("/listings", async (req, res) => {
  try{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }catch(err){
    console.log(err);
  }
});

//New Route(Ejs form for creating new listing)
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route(Shows particular listing)
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  try{
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  }catch(err){
    console.log(err);
  }
});

//Create Route(After new.ejs form submission creating new listing in db)
app.post("/listings", async (req, res) => {
    // const {title,description,image,...} = req.body; oR
  const newListing = new Listing(req.body.listing);
  try{
    await newListing.save();
    res.redirect("/listings");
  }catch(err){
    console.log(err);
  }
});

//Edit Route(Form for editing)
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  try{
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }catch(err){
    console.log(err);
  }
});

//Update Route(Taking data of edit forma and updating)
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  try{
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // Spread operator used Here(...) 
    res.redirect(`/listings/${id}`);
  }catch(err){
    console.log(err);
  }
});

//Delete Route(deleting particular listing)
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
    try{
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        res.redirect("/listings");
    }
    catch(err){
        console.log(err);
    }
});


app.listen(port,(req,res)=>{
    console.log("Server is started and listning at port 3000");
})

