
const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abhisek:pintulitu2000@cluster0.qofnjuu.mongodb.net/todolistDB?retryWrites=true&w=majority",{}).catch((err)=>{
    console.log(err);
}).then(()=>console.log("Successfully connected to database"));


const itemSchema= {
  name:{
         type:String,
         required:[true,"Name Must Required."],
       }
};

const Item= mongoose.model("Item",itemSchema);

const item1= new Item({
  name:"Abhisek",
});
const item2= new Item({
  name:"Litu",
});
const item3= new Item({
  name:"Raja",
});

const defaultlist=[item1,item2,item3];

//new schema for custome list

const listSchema= {
  name:String,
  items:[itemSchema], //it establishing relationship
};

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {



Item.find().catch(err=>console.log(err)).then((items)=>{
    if(! items){
      Item.insertMany(defaultlist).catch(err=>console.log(err)).then(()=>console.log("Insert Successfully."));
      res.redirect("/");
    }else{
      res.render("list.ejs", {listTitle:"Today", newListItems: items});
    }

});

});

app.get("/:customeListName",function(req,res){

  const CustomeName= _.capitalize(req.params.customeListName); //It Convert the First character to Upper Case.

List.findOne({name:CustomeName}).catch(err=>console.log(err)).then((customeItem)=>{
        if(!customeItem){
          const list= new List({
            name:CustomeName,
            items:defaultlist,
          });
          list.save();
          res.redirect("/"+CustomeName);
        }else{
          res.render("list.ejs",{listTitle:customeItem.name,newListItems:customeItem.items});
        }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const newItem= new Item({
        name:itemName,
  });
  if(listName ==="Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then((foundList)=>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});
app.post("/delete",function(req,res){
  const itemId=req.body.checkbox;
 const listName=req.body.listName;

if(listName === "Today"){
Item.findByIdAndRemove(itemId).catch(err=>console.log(err)).then(()=>console.log("Successfully deleted one item."));
res.redirect("/");
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}}).catch(err=>console.log(err)).then(()=>{
    console.log(`Successfully deleted one item from ${listName}`);
    res.redirect("/"+listName);
  });
}

});


app.listen(process.env.PORT || 3000, ()=> {
  console.log("Server started Successfully...");
});
