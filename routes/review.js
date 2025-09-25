const express = require("express");
const router = express.Router({mergeParams:true});
const {reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");


const validateReview = (req,res,next)=>{
  const {error} = reviewSchema.validate(req.body);
  if(error){
    throw new ExpressError(400,error);
  }
  else{
    next();
  }
}


router.post("/",validateReview,wrapAsync(async (req,res,next)=>{
  const {listingId} = req.params;
  const newReview = new Review(req.body.review);
  const listing = await Listing.findById(listingId);
  listing.reviews.push(newReview);
  await newReview.save();
  req.flash("success","Review Saved successfully");
  await listing.save();

  res.redirect(`/listings/${listingId}`);
}));

router.delete("/:reviewId",wrapAsync(async (req,res,next)=>{
  const {listingId,reviewId} = req.params;
  await Listing.findByIdAndUpdate(listingId,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review deleted successfully");
  res.redirect(`/listings/${listingId}`);
}));

module.exports = router;