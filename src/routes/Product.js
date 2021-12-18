const express = require("express")
const {index,create, update, addComment,addMedia} = require("../controllers/Product");
const { createProduct, updateProduct, createComment } = require("../validations/Product");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/authenticate");
const authenticateAdmin = require("../middlewares/authenticateAdmin");

const router = express.Router();

router.get("/", index);
router.route("/:id/add-comment").post(authenticate ,validate(createComment, "body"), addComment);

router.route("/").post(authenticateAdmin ,validate(createProduct, "body"), create);
router.route("/:id").patch(authenticateAdmin ,validate(updateProduct, "body"), update);
router.route("/:id/add-media").post(authenticate, addMedia);

module.exports = router;