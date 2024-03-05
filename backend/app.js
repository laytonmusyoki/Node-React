const express=require('express');
const nodemailer=require('nodemailer');
const bodyParser=require('body-parser');
const router=require('./controllers/auth_controller')
const db=require('./databaseconfig/data');
const cors=require('cors');

const app=express();

app.use(bodyParser.json());
app.use('/',router);
app.use(bodyParser.urlencoded({extended:true}));

const transporter = nodemailer.createTransport(
    {
        service:'gmail',
        auth:{
            user:'laytonmatheka7@gmail.com',
            pass:'qamfnggyldkpbhje'
        }
    }
);

const corsOptions={
    origin:'http://localhost:4200',
    optionsSuccessStatus:200
};

app.use(cors(corsOptions));


function authenticateToken(req,res,next){
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];
    if(token==null){
        return res.status(401).send({message:'Unauthorized'});
    }
    jwt.verify(token,process.env.AccessToken,(err,user)=>{
        if(err){
            return res.status(403).send({message:'Forbidden'});
        }
        req.user=user;
        next();
    });
}



app.get('/send-email',(req,res)=>{
    const {email,subject,text}=req.body;
    const mailOptions={
        email,
        to:'laytonmatheka7@gmail.com',
        subject,
        text
    };
    try{
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error);
                res.status(500).send({error});
            }
            else{
                console.log('Email sent: '+info.response);
                res.status(200).send({message:'Email sent'});
            }
        });
    }
    catch(error){
        return res.status(500).send({error})
    }
});

    



app.listen(3000,()=>{
    console.log('Server is running on port 3000');
}   );