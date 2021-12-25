const Product = require("../controllers/Product");
const { createProduct, updateProduct, createComment } = require("../validations/Product");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/authenticate");
const authenticateAdmin = require("../middlewares/authenticateAdmin");
const idChecker = require("../middlewares/idChecker");

const express = require("express");

const router = express.Router();

router.get("/", Product.index);
router.route("/:id/add-comment").post(idChecker, authenticate ,validate(createComment, "body"), Product.addComment);

router.route("/").post(authenticateAdmin ,validate(createProduct, "body"), Product.create);
router.route("/:id").patch(idChecker, authenticateAdmin ,validate(updateProduct, "body"), Product.update);
router.route("/:id/add-media").post(idChecker, authenticate, Product.addMedia);

module.exports = router;