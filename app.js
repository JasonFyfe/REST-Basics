var expressSanitizer = require('express-sanitizer'),
    methodOverride = require('method-override'),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    express        = require('express'),
    app            = express(),
    port           = 3000;
// Global Vars

// Database & App config
mongoose.set("useFindAndModify", false);                                               // Removes deprecation warning for findandupdate
mongoose.set('useUnifiedTopology', true);                                              // Removes deprecation warning for old topology
mongoose.connect("mongodb://localhost:27017/restful_blog", { useNewUrlParser: true }); // Create or connect to our DB, useNewUrlParser - removes deprecation warning
app.use(bodyParser.urlencoded({ extended: true }));                                    // Sets URL encoding for retreiving form data
app.set("view engine", "ejs");                                                         // Sets the view engine to EJS
app.use(express.static("public"));                                                     // Sets our app to find CSS in public folder
app.use(methodOverride("_method"));                                                    // Tells express to find '_method' in the url
app.use(expressSanitizer());                                                           // Tells express to use sanitizer module

// Mongoose/Model Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }                                          // {type: dataType, default: Placeholder or Default data if no input} 
});
var Blog = mongoose.model("Blog", blogSchema);                                         // Use Blog Schema to create a blog object we can use

// RESTFUL ROUTES
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", (req, res) => {
    res.render("new");
});

// CREATE ROUTE 
app.post("/blogs", (req, res) => {
    // Create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err){
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//  UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updateBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect(`/blogs/${req.params.id}`);
        }
    })
});

// DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

// Node Listening init
app.listen(port, () => {
    console.log(`Blog listening on port ${port}`);
});