const mongoose = require("mongoose");
const Blog = require("../model/Blog.js");
const User = require("../model/User.js");
const path = require('path');


module.exports.getAllBlogs = async (req, res, next) => {
  let blogs;
  try {
    blogs = await Blog.find().populate("user");
  } catch (err) {
    return console.log(err);
  }
  if (!blogs) {
    return res.status(404).json({ message: "No Blogs Found" });
  }
  return res.status(200).json({ blogs });
}


module.exports.addBlog = async (req, res, next) => {
  const { title, description, userID } = req.body;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(404).json({ message: "Image Does not Exist" });
}

const { image } = req.files;

let uploadPath;
let date = new Date()
let newFileName = "img_" +
    date.getDate() +
    (date.getMonth() + 1) +
    date.getFullYear() +
    date.getHours() +
    date.getMinutes() +
    date.getSeconds() +
    date.getMilliseconds() +
    '.jpg';

uploadPath = path.join(__dirname, '..', '/upload', newFileName);

  let existingUser = null;
  try {
    existingUser = await User.findById(userID);
  } catch (err) {
    return console.log(err);
  }
  if (!existingUser) {
    return res.status(400).json({ message: "Unable TO Find User By This ID" });
  }
  console.log("Completed User Validation");
  const blog = new Blog({
    title,
    description,
    image: '/photo/' + newFileName,
    user: userID,
  });
  console.log(newFileName);
  try {
    image.mv(uploadPath, (err) => {
        if (err) return res.status(500).json({ message: "Backend: Image could not be uploaded" });
    });
    const session = await mongoose.startSession();
    session.startTransaction({ session });
    await blog.save({ session });
    existingUser.blogs.push(blog);
    await existingUser.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }

  return res.status(200).json({ blog });
}


module.exports.updateBlog = async (req, res, next) => {
  const { title, description } = req.body;
  const { image } = req.files;
  const blogId = req.params.id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were Found.');
}
let uploadPath;
let date = new Date()
let newFileName = "img_" +
    date.getDate() +
    (date.getMonth() + 1) +
    date.getFullYear() +
    date.getHours() +
    date.getMinutes() +
    date.getSeconds() +
    date.getMilliseconds() +
    '.jpg';
//  uploadPath = __dirname + '/upload/' + newFileName;
uploadPath = path.join(__dirname, '..', '/upload', newFileName);
console.log(uploadPath);

  let blog;
  try {
    await Blog.updateOne({ "_id": blogId },  {
      "title": title,
      "description": description,
      image: '/photo/' + newFileName,
    });
    blog = await Blog.findById(blogId);
    image.mv(uploadPath, (err) => {
        if (err) return res.status(500).json({ msg: "Image could not be uploaded" });
    });
  } catch (err) {
    return console.log(err);
  }
  if (!blog) {
    return res.status(500).json({ message: "Unable To Update The Blog" });
  }
  return res.status(200).json({ blog });
};


module.exports.getById = async (req, res, next) => {
  const id = req.params.id;
  let blog;
  try {
    blog = await Blog.findById(id).populate('user');
  } catch (err) {
    return console.log(err);
  }
  if (!blog) {
    return res.status(404).json({ message: "No Blog Found" });
  }
  return res.status(200).json({ blog });
}


module.exports.deleteBlog = async (req, res, next) => {
  const id = req.params.id;

  let blog;
  try {
    blog = await Blog.findByIdAndDelete(id).populate("user");
    await blog.user.blogs.pull(blog);
    await blog.user.save();
  } catch (err) {
    console.log(err);
  }
  if (!blog) {
    return res.status(500).json({ message: "Unable To Delete" });
  }
  return res.status(200).json({ message: "Successfully Delete" });
}


module.exports.getByUserId = async (req, res, next) => {
  const userId = req.params.id;
  //console.log(userId);
  let user;
  try {
    user = await User.findById(userId).populate("blogs");
    console.log(user);
  } catch (err) {
    return console.log(err);
  }
  if (!user) {
    return res.status(404).json({ message: "No Blog Found" });
  }
  return res.status(200).json({ user });
};