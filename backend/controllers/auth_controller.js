require('dotenv').config();
const express=require('express');
const bycrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const db=require('../databaseconfig/data');
const router=express.Router();


router.post('/register',(req,res)=>{
    var {username,email,password}=req.body;
    const hashpwd=bycrypt.hashSync(password,10);
    password=hashpwd;
    const values={username,email,password};
    const sql=`INSERT INTO users(username,email,password) VALUES('${username}','${email}','${password}')`;
    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).send({error:err});
        }
        console.log(result);
        return res.status(200).send({message:'User registered successfully'});
    });
});

router.get('/protected',authenticateToken,(req,res)=>{
    const sql='SELECT * FROM users';
    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).send({error:err});
        }
        return res.status(200).send({result,username:req.user.username,userId:req.user.id});
    });
}
);

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


router.post('/refreshtoken',(req,res)=>{
    const refreshtoken=req.body.token;
    if(refreshtoken==null){
        return res.status(401).send({message:'Unauthorized'});
    }
    jwt.verify(refreshtoken,process.env.RefreshToken,(err,user)=>{
        if(err){
            return res.status(403).send({message:'Forbidden'});
        }
        const accesstoken=jwt.sign({id:user.id,username:user.username},process.env.AccessToken,{expiresIn:15});
        return res.status(200).send({accesstoken});
    });
}
);


router.post('/login',(req,res)=>{
    var {username,password}=req.body;
    const sql=`SELECT * FROM users WHERE username='${username}'`;
    db.query(sql,(err,result)=>{
        if(err){
            return res.status(500).send({error:err});
        }
        if(result.length>0){
            const match=bycrypt.compareSync(password,result[0].password);
            if(match){
                const accesstoken=jwt.sign({id:result[0].id,username:result[0].username},process.env.AccessToken,{expiresIn:105});
                const refreshtoken=jwt.sign({id:result[0].id,username:result[0].username},process.env.RefreshToken,{expiresIn:86400});
                return res.status(200).send({accesstoken,refreshtoken});
            }
            else{
                return res.status(401).send({message:'Invalid credentials'});
            }
        }
        else{
            return res.status(404).send({message:'User not found'});
        }
    });
}
);


module.exports=router;