const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');
app.use(express.static("public"));


mongoose.set('useFindAndModify', false); 
mongoose.connect("mongodb://localhost:27017/mydbs",{useNewUrlParser: true,useUnifiedTopology: true});


var date = new Date();
    const options = { weekday: 'long',month: 'long', day: 'numeric' };
    var event = date.toLocaleDateString("en-US",options);

const listSchema ={
    name:String
};
const List = mongoose.model("List",listSchema);

const typeSchema = {
    name:String,
    items: [listSchema]
};
const Type = mongoose.model("type",typeSchema);

const item1 = new List({
    name:"Read"
});

const item2 = new List({
    name:"Write"
});

const defaultdata =[item1,item2];

app.get("/",function (req,res) {

    List.find({},function (err,data) {

        if(data.length==0)
        {
            List.insertMany(defaultdata,function (err) {
                console.log("sucessfully saved");
            });
            res.redirect("/");
        }
        else
        {
            res.render("home",{title:event,arr:data});
        }

    }); 
});


app.post("/",function (req,res) {
    
   const itemdata = req.body.name;
   const listname = req.body.but;

   const item = new List({
        name:itemdata
   });

   if(listname == event)
   {
    item.save();
    res.redirect("/");
   }else{
       Type.findOne({name:listname},function (err,data) {
           data.items.push(item);
           data.save();
           res.redirect("/"+ listname);
       });
   }

  
});

app.post("/delete",function (req,res) {
    const value = req.body.check;
    const lname =req.body.listname;
    if(lname == event)
    {
        List.findByIdAndRemove(value,function (err) {
            console.log("sucessfully deleted");
            res.redirect("/"); 
        });
    }else
    {
        Type.findOneAndUpdate({name:lname},{$pull:{items:{_id:value}}},function (err,data) {
            res.redirect("/" +lname);
        });
    }
});


app.get("/:paraname",function (req,res) {
    const para = _.capitalize(req.params.paraname);

    Type.findOne({name:para},function (err,data) {
        if(!data)
        {
            const item = Type({
                name:para,
                items:defaultdata
            });
            item.save();
            res.redirect("/"+ para);
        }
        else{
            res.render("home",{title:data.name , arr:data.items});
        }
    }); 
});

app.listen(3000,function () {
    console.log("Sever started port:3000");
});
