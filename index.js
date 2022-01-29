const express=require('express');
const app=express();
const cors=require('cors');
const bodyParser=require('body-parser');
const nodemailer=require('nodemailer');
require('dotenv').config();
app.use(cors({origin:"*"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/',(req,res)=>{
    res.send({message:"request successfull"});
})
const isValidEmail=(data)=>{
    const {name,email,subject,message}=data;
    const errors={exist:false,name:{valid:true,message:""},email:{valid:true,message:""},subject:{valid:true,message:""},message:{valid:true,message:""}};
    if(name===""){
        errors.exist=true
        errors.name={valid:false,message:"Name is required"};
    }
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email===""){
        errors.exist=true;
        errors.email={valid:false,message:"Please Enter Email"}
    }
    else if(re.test(String(email).toLowerCase())){
        errors.exist=false;
        errors.email={valid:true,message:""};
    }
    else{
        errors.exist=true;
        errors.email={valid:false,message:"Invalid Email"}
    }
    if(subject===""){
        errors.exist=true;
        errors.subject={valid:false,message:"Subject is empty"};
    }
    if(message===""){
        errors.exist=true;
        errors.message={valid:false,message:"Message is empty"};
    }
    return errors;
}
app.post('/',(req,res)=>{
    const errors=isValidEmail(req.body);
    console.log(req.body);
    if(errors.exist){
        console.log(errors);
        res.status(400);
        res.send({error:true,errors,message:"error occured"})
    }else{
        let transport=nodemailer.createTransport({
            service: process.env.SERVICE,
            port:process.env.SMTP_PORT,
            auth:{
                user:process.env.EMAIL,
                pass:process.env.PASSWORD
            }
        })
        const {name,email,subject,message}=req.body;
        let info={
            from:{
                name:name,
                address:email
            },
            to:process.env.EMAIL,
            subject:subject,
            html:'<p>'+message+'</p>'
        }
        transport.sendMail(info,function(err,result){
            if(err) {
                console.log(err);
                res.status(500).send({error:true,message:"server error",errors:err});
            }
            else {
                console.log(result);
                res.status(200).send({error:false,message:"message sent successfully"});
            }
        })
    }
    
})
app.listen(process.env.PORT||8000,()=>{
    console.log(`server is listening on port ${process.env.PORT||8000}`);
})