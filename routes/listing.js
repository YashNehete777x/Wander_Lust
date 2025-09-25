const express = require("express");
const router = express.Router();
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");


const validateListing = (req,res,next)=>{
  // const result = listingSchema.validate(req.body);
  // console.log(result);
  // if(result.error){
  //   throw new ExpressError(400,result.error);
  // }
  const {error} = listingSchema.validate(req.body);
  if(error){
    throw new ExpressError(400,error);
  }
  else{
    next();
  }
}



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

router.get("/",
  wrapAsync(async (req,res,next)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//New Route(Ejs form for creating new listing)

// app.get("/listings/new", (req, res) => {
//   res.render("listings/new.ejs");
// });

router.get("/new",
  wrapAsync(async (req,res,next)=>{
    res.render("listings/new.ejs");
  })
);

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

router.get("/:id",
  wrapAsync(async (req,res,next)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
      req.flash("error","Listing trying to access does not exits");
      res.redirect("/listings");
    }
    else{
      res.render("listings/show.ejs", { listing });
    }
  })
);

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


// Commented things in the post method is the 1st way for schema validation(2nd best),second is Mongoose schema validation(not recommended),and third is joi schema validation(Best practice)
router.post("/",
  validateListing,
  wrapAsync(async (req,res,next)=>{
    // if(!req.body.listing){ // Thsis when we send a req by hoop/postman without a req body
    //   throw new ExpressError(400,"Send valid data for listing!");
    // }
    const newListing = new Listing(req.body.listing);
    // if(!newListing.title){
    //   throw new ExpressError(400,"Title is missing");
    // }
    // if(!newListing.description){
    //   throw new ExpressError(400,"Descrription is missing");
    // }
    // if(!newListing.price){
    //   throw new ExpressError(400,"price is missing");
    // }
    // if(!newListing.country){
    //   throw new ExpressError(400,"country is missing");
    // }
    // if(!newListing.location){
    //   throw new ExpressError(400,"location is missing");
    // }
    await newListing.save();
    req.flash("success","Listing Saved successfully");
    res.redirect("/listings");
  })
);

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

router.get("/:id/edit",
  wrapAsync(async (req,res,next)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing trying to Edit does not exits");
      res.redirect("/listings");
    }
    else{
      res.render("listings/edit.ejs", { listing });
    }
  })
);

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

router.put("/:id",
  validateListing,
  wrapAsync(async (req,res,next)=>{
    // if(!req.body.listing){ // Thsis when we send a req by hoop/postman without a req body
    //   throw new Error(400,"Send valid data for listing!");
    // }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // Spread operator used Here(...) 
    req.flash("success","Listing Edited successfully");
    res.redirect(`/listings/${id}`);
  })
);

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

router.delete("/:id",
  wrapAsync(async (req,res,next)=>{
    // let { id } = req.params;
    // let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    // res.redirect("/listings");

    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(listing.reviews.length > 0){
      await Review.deleteMany({
      _id: { $in: listing.reviews }
    });

    }
    // await Listing.deleteOne({_id:id});
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted successfully");

    res.redirect("/listings");
  })
);

module.exports = router;