//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB").catch(error => handleError(error));

const itemSchema ={
  name:String
};
const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"welcome"
});
const item2 = new Item({
  name:"olol"
});
const item3 = new Item({
  name:"bololo"
});
const defaultItem = [item1,item2,item3];
const listScema = {
  name: String,
  items:[itemSchema]
};
const List = mongoose.model("List",listScema);
app.get("/", function(req, res) {


Item.find({}).then(function(found){
  if(found.length === 0){
    Item.insertMany(defaultItem);
    res.redirect("/");
  }
  else{
  res.render("list", {listTitle: "Today", newListItems: found});}
});
});
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then(function(foundlist){
    if(!foundlist){
      const list = new List({
        name: customListName,
        items:defaultItem
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});}
    
  });
});
 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname= req.body.list;

  const item = new Item({
    name:itemName
  });
  if(listname === "Today"){
  item.save();
  res.redirect("/");}
  else{
    List.findOne({name:listname}).then(function(foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+ listname);
    })
  }
});
app.post("/delete",function(req,res){

  const checkedid = req.body.checkbox.trim();
  const listName = req.body.listname;
if(listName == "Today"){
  Item.findByIdAndRemove(checkedid).then(function(){
    console.log("Data deleted"); // Success
  }).catch(function(error){
    console.log(error); // Failure
  });
  res.redirect("/");
}
else{
  List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedid}}}).then(function(foundlist){
    res.redirect("/"+listName);
  }).catch(function(error){
    console.log(error); // Failure
  });
}
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
