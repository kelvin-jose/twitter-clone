const mongoose = require('mongoose')
const VerReq = mongoose.model('VerReq')
const User = mongoose.model('User')


let allReqs = [];

exports.showRequest = (req,res) => {
    VerReq.find({},function(err,reqs){
       if(err) 
           res.redirect('/admin/') 
        else {

            for(i=0;i<reqs.length;i++) {
                User.findOne({_id: reqs[i].user},function(err,user){
                    if(user) {
                        allReqs.push(user)
                    }
                });
            }
            
            res.render('pages/superuser-verification',{allReqs: allReqs})    
            allReqs = []
        }
    });
}

exports.getVerified = (req,res) => {
    console.log('landed')
    User.findById(req.params.userId,function(err,user){
        if(err) res.redirect('/admin/verification')
        else {
            user.verified = 'true'
            user.save(function(err,user){
                if(err) res.redirect('/admin/verification')
                else res.redirect('/admin/verification')
            })
        }
    })
}

let verified = [];
exports.showOfficials = (req,res) => {
        User.find({verified: 'true'},function(err,users){
            if(err) {
                        res.redirect('/admin/')
                    }
            else {
                console.log(users)
                res.render('pages/superuser-verification',{users: users})      
        }
    });
}
        


