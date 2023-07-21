const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getdetailsProduct,
  createProductReview,
  getProductReviews,
  deleteProductReviews,
} = require("./controller/Productcontroller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/isAuth");
const router = express.Router();

router.route("/products").get(getAllProducts);
router
  .route("/admin/products/create")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.route("/products/:id").get(getdetailsProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);
router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteProductReviews);

module.exports = router;
