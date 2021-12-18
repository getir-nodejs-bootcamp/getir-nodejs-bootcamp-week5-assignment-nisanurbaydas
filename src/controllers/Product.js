const path = require('path');

const { list, insert, findOne, updateDoc } = require('../services/Product');
const { checkSecureFile } = require('../scripts/utils/helper');

const httpStatus = require('http-status');

const index = (req, res) => {
  list()
    .then((itemList) => {
      if (!itemList)
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ error: 'Something went wrong !' });
      res.status(httpStatus.OK).send(itemList);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const create = (req, res) => {
  req.body.user_id = req.user;
  insert(req.body)
    .then((createdDoc) => {
      if (!createdDoc)
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ error: 'Something went wrong !' });
      res.status(httpStatus.CREATED).send(createdDoc);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const update = (req, res) => {
  if (!req.params.id)
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: 'Missing information' });
  updateDoc(req.params.id, req.body)
    .then((updatedDoc) => {
      if (!updatedDoc)
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: 'Product not found' });
      res.status(httpStatus.OK).send(updatedDoc);
    })
    .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
};

const addComment = (req, res) => {
  if (!req.params.id)
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: 'Missing information' });
  findOne({ _id: req.params.id }).then((mainProduct) => {
    if (!mainProduct)
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: 'Product not found' });
    //console.log(mainProduct);
    const comment = {
      ...req.body,
      created_at: new Date(),
      user_id: req.user,
    };
    mainProduct.comments.push(comment);
    updateDoc(req.params.id, mainProduct)
      .then((updatedDoc) => {
        if (!updatedDoc)
          return res
            .status(httpStatus.NOT_FOUND)
            .send({ message: 'Product not found' });
        res.status(httpStatus.OK).send(updatedDoc);
      })
      .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
  });
};

const addMedia = (req, res) => {
  if (
    !req.params.id ||
    !req.files?.file ||
    !checkSecureFile(req?.files?.file?.mimetype)
  )
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: 'Missing information' });
  findOne({ _id: req.params.id }).then((mainProduct) => {
    if (!mainProduct)
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: 'Product not found' });

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
      updateDoc(req.params.id, mainProduct)
        .then((updatedDoc) => {
          if (!updatedDoc)
            return res
              .status(httpStatus.NOT_FOUND)
              .send({ message: 'Product not found' });
          res.status(httpStatus.OK).send(updatedDoc);
        })
        .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
    });
  });
};

module.exports = {
  index,
  create,
  update,
  addComment,
  addMedia,
};
