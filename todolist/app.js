const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.connect("mongodb://127.0.0.1/todolistDB", {usenewUrlParser:true});
const itemSchema = {
  name: String
};
const Item = mongoose.model("Item",itemSchema);
  
 const item1 = new Item({
  name : "Welcome to do list!!"
 }) ;
const item2 = new Item({
   name : "Hit + to add entry"
});
const item3  = new Item({
  name: "<-- hit this to delete item"
});

const defultItems = [item1, item2 , item3];
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

 

app.get("/" , function(req,res)
{    
  Item.find({}).then(function (foundItems) {
    if(foundItems.length === 0){
      Item.insertMany(defultItems).then(function (foundItems) {
        console.log(foundItems);
        console.log("Successfully saved defult items to DB");
      }).catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    
    }else{ 
      res.render("list", {listTitle:"Today" , newListItems: foundItems});
     }
   
  });
}); 


app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;
  List.findOne({name : customListName}).then(function(foundList){
  if(!foundList){
    const list = new List({
        name : customListName,
    items: defultItems
    });
    
      list.save();
      res.redirect("/" + customListName);
  }else{
    res.render("list", {listTitle:foundList.name , newListItems: foundList.items})
  }
}).catch(function(err){
  console.log(err);
});

 
});

app.post("/" , function(req,res)
{
    const itemName = req.body.newItem;
    const listName = req.body.list;
   const item = new  Item({
    name: itemName
   });
   if(listName === "Today"){
    item.save();
   res.redirect("/");
   }else{
    List.findOne({name : listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }).catch(function(err){
      console.log(err);
    });
   };
   
});
app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){Item.findByIdAndDelete( checkedItemId).then(
    res => console.log("sucessfully delete"),
    err => console.error(err),
    
  );
  res.redirect("/");}else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then(
      res => console.log("sucessfully deleted"),
      err => console.log(err),
      res.redirect("/" + listName)
    )
  }
  
});

app.get("/work" , function(req,res){
  res.render("list" , {listTitle: "work list", newListItems:workItems});
});
app.get("/about" , function(req,res){
  res.render("about");
});
app.listen(5000,function()
{
    console.log("sever is at 5000");
});