const Product = require("../../models/productmodel");
const catchAsyncError = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorhandler");
const ApiFeatures = require("../../utils/apifeatures");
const cloudinary = require("cloudinary").v2;

// create product -- Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
  let images = [];
  const regex = /data:image\/[a-zA-Z+.-]+;base64,[^,]+/g;

  images = req.body.images.match(regex);

  req.body.keywords = req.body.keywords.split(",");
  const imagesLink = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLink.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLink;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
  next();
});

// get all products
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  const { sort } = req.query;
  const productsCount = await Product.countDocuments();
  const apifeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apifeatures.query.clone();
  let filteredCount = products.length;
  apifeatures.pagination(process.env.RESPERPAGE);
  if (sort) {
    let sortfix = sort.replace(",", " ");
    const newFeature = new ApiFeatures(
      Product.find().sort(sortfix),
      req.query
    ).pagination(process.env.RESPERPAGE);
    products = await newFeature.query;
    filteredCount = productsCount;
  } else {
    products = await apifeatures.query;
  }
  if (!products) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res
    .status(200)
    .json({ success: true, products, productsCount, filteredCount });
});
// exports.getAllProducts = catchAsyncError(async (req, res, next) => {
//   const { sort } = req.query;
//   const productsCount = await Product.countDocuments();
//   const apifeatures = new ApiFeatures(Product.find(), req.query)
//     .search()
//     .filter()
//     .pagination(process.env.RESPERPAGE);

//   let products = await apifeatures.query.clone();

//   if (sort) {
//     let sortfix = sort.replace(",", " ");
//     products = await apifeatures.query.sort(sortfix);
//   }

//   if (!products) {
//     return next(new ErrorHandler("Product not found", 404));
//   }

//   res.status(200).json({
//     success: true,
//     products,
//     productsCount,
//     filteredCount: products.length,
//   });
// });

// get all products -- Admin
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({ success: true, products });
});

// Update product -- Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  let images = [];
  const regex = /data:image\/[a-zA-Z+.-]+;base64,[^,]+/g;

  images = req.body.images.match(regex);

  req.body.keywords = req.body.keywords.split(",");

  if (images !== undefined) {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLink;
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, product });
});

// delete product -- Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.uploader.destroy(product.images[i].public_id);
  }
  await Product.deleteOne(product);
  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully" });
});

// get product details
exports.getdetailsProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({ success: true, product });
});

// Create New Review or Update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numofReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});
// Get all reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// delete review
exports.deleteProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  // const pcopy = { ...product.reviews };
  // let toCompare = null;
  // for (let i = "0"; i < `${product.reviews.length}`; i++) {
  //   if (pcopy[i].user.toString() === req.user._id.toString()) {
  //     toCompare = i;
  //   }
  // }
  // if (req.user._id.toString() !== pcopy[toCompare].user.toString()) {
  //   return next(new ErrorHandler("you can only delete your reviews", 400));
  // }
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  let ratings = 0;
  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = product.reviews.length == 1 ? 0 : avg / reviews.length;
  }
  const numofReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      numofReviews,
      ratings,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
  });
});
