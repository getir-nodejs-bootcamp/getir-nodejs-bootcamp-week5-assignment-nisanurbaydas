const path = require('path');

const { checkSecureFile } = require('../scripts/utils/helper');
const ProductService = require('../services/ProductService');
const ApiError = require('../errors/ApiError');

const httpStatus = require('http-status');

class ProductController {
  index(req, res, next) {
    ProductService.list()
      .then((itemList) => {
        if (!itemList) return next(new ApiError('Problem occured'));
        res.status(httpStatus.OK).send(itemList);
      })
      .catch((e) => next(new ApiError(e?.message)));
  }
  create(req, res) {
    req.body.user_id = req.user;
    ProductService.create(req.body)
      .then((createdDoc) => {
        if (!createdDoc)
          return next(
            new ApiError(
              'Something went wrong',
              httpStatus.INTERNAL_SERVER_ERROR
            )
          );
        res.status(httpStatus.CREATED).send(createdDoc);
      })
      .catch((e) => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
      });
  }
  update(req, res) {
    ProductService.update(req.params.id, req.body)
      .then((updatedDoc) => {
        if (!updatedDoc)
          return next(new ApiError('Product not found', httpStatus.NOT_FOUND));
        res.status(httpStatus.OK).send(updatedDoc);
      })
      .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
  }
  addComment(req, res) {
    if (!req.params.id)
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: 'Missing information' });
    ProductService.findOne({ _id: req.params.id }).then((mainProduct) => {
      if (!mainProduct)
        return next(new ApiError('Product not found', httpStatus.NOT_FOUND));
      //console.log(mainProduct);
      const comment = {
        ...req.body,
        created_at: new Date(),
        user_id: req.user,
      };
      mainProduct.comments.push(comment);
      ProductService.update(req.params.id, mainProduct)
        .then((updatedDoc) => {
          if (!updatedDoc)
            return next(
              new ApiError('Product not found', httpStatus.NOT_FOUND)
            );
          res.status(httpStatus.OK).send(updatedDoc);
        })
        .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
    });
  }
  addMedia(req, res) {
    if (!req.files?.file || !checkSecureFile(req?.files?.file?.mimetype))
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: 'Missing information' });
    ProductService.findOne({ _id: req.params.id }).then((mainProduct) => {
      if (!mainProduct)
        return next(new ApiError('Product not found', httpStatus.NOT_FOUND));

      const extension = path.extname(req.files.file.name);
      const fileName = `${mainProduct._id?.toString()}${extension}`;
      const folderPath = path.join(
        __dirname,
        '../',
        'uploads/products',
        fileName
      );

      req.files.file.mv(folderPath, function (err) {
        if (err) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
        mainProduct.media = fileName;
        ProductService.update(req.params.id, mainProduct)
          .then((updatedDoc) => {
            if (!updatedDoc)
              return next(
                new ApiError('Product not found', httpStatus.NOT_FOUND)
              );
            res.status(httpStatus.OK).send(updatedDoc);
          })
          .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
      });
    });
  }
}

module.exports = new ProductController();
