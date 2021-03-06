var PostModel = require('../models/PostModel.js');
var FileUploader = require("../util/FileUploader");
var FileController = require("./FileController");


module.exports = {


    list: function(req, res) {
        if (req.error) {
            return res.status(403).json(req.error);
        }
        PostModel.find({ "created_by": req["me"]["__id"] })
            .populate({ path: 'files', select: "_id name size url type" })
            .populate({ path: 'created_by', select: "_id name photoURL" })
            .populate({
                path: 'comments',
                select: "description user_id",
                model: "Comment",
                populate: {
                    path: 'user_id',
                    select: "_id name photoURL",
                    model: "User"
                }
            }).exec(function(err, Posts) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Post.',
                        error: err
                    });
                }
                return res.json({status:true,result:Posts});
            });
    },

    show: function(req, res) {
        if (req.error) {
            return res.status(403).json(req.error);
        }
        var id = req.params.id;
        PostModel.findOne({ _id: id }, function(err, Post) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Post.',
                    error: err
                });
            }
            if (!Post) {
                return res.status(404).json({
                    message: 'No such Post'
                });
            }
            return res.json(Post);
        });
    },
    _create: function(req, res) {
        var Post = new PostModel({
            title: req.body.title,
            description: req.body.description,
            files: req.body.files,
            created_by: req["me"]["__id"],
            created_at: Date.now(),
            like_count: 0,
            comment_count: 0
        });

        Post.save(function(err, Post) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Post',
                    error: err
                });
            }
            return res.status(201).json(Post);
        });
    },

    create: function(req, res) {
        if (req.error) {
            return res.status(403).json(req.error);
        }
        var self = this;
        FileUploader.store.single('files')(req, res, function(err) {
            console.log(req.body);
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Post',
                    error: err
                });
            }

            if (req.file && req.file != '') {
                var data = {
                    name: req.file.originalname,
                    type: req.file.mimetype,
                    size: req.file.size,
                    url: req.file.path,
                    created_by: req["me"]["__id"]
                };
                FileController._create(data, function(s, r) {
                    if (s) {
                        req.body.files = r._id;
                        self._create(req, res);
                    } else {
                        return res.status(500).json({
                            message: 'Error when creating Post',
                            error: err
                        });
                    }
                });
            } else {
                self._create(req, res);
            }
        });
    },

    update: function(req, res) {
        if (req.error) {
            return res.status(403).json(req.error);
        }
        var id = req.params.id;
        PostModel.findOne({ _id: id }, function(err, Post) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Post',
                    error: err
                });
            }
            if (!Post) {
                return res.status(404).json({
                    message: 'No such Post'
                });
            }

            Post.title = req.body.title ? req.body.title : Post.title;
            Post.description = req.body.description ? req.body.description : Post.description;
            Post.files = req.body.files ? req.body.files : Post.files;
            Post.created_by = req.body.created_by ? req.body.created_by : Post.created_by;
            Post.created_at = req.body.created_at ? req.body.created_at : Post.created_at;
            Post.like_count = req.body.like_count ? req.body.like_count : Post.like_count;
            Post.comment_count = req.body.comment_count ? req.body.comment_count : Post.comment_count;

            Post.save(function(err, Post) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Post.',
                        error: err
                    });
                }

                return res.json(Post);
            });
        });
    },


    remove: function(req, res) {
        if (req.error) {
            return res.status(403).json(req.error);
        }
        var id = req.params.id;
        PostModel.findByIdAndRemove(id, function(err, Post) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Post.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
