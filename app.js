//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Yash:yash@cluster0.sbtkf.mongodb.net/todolistDB", {useNewUrlParser: true});





const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to aff a new item."
});

const item3 = new Item({
  name: "<--Hit this to delete an item."
});


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);





app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to database");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // create the list
        const list = new List({
          name: customListName,
          items: defaultItems
        })

        list.save();
        res.redirect("/" + customListName);
      } else {
        // list which is already exist
        res.render("list",  {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;


    const item = new Item ({
      name: itemName
    });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }
});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(id, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted checked ID !");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: id}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});

let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully !");
});
