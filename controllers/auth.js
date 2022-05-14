const jwt = require('jsonwebtoken');
//const db = require('../model/db');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const mysql = require("mysql");

const db = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASS,
    database : process.env.DATABASE
});

/*************************************/
/*LOGIN*/

exports.login = async (req, res) => {
    try {
        const { uname, password } = req.body;
        
        // check uname and password exist
        if ( !uname || !password ) {
            return res.status(400).render('login', {
                message: 'Please provide Username and Password'
            })
        }
        
        // check if credentials are correct
        db.query('SELECT * FROM user WHERE uname = ?', [uname], async (error, results) => {
            
            if( !results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'Username or Password is incorrect'
                })
            } else {
                // assign token to user
                const id = results[0].id;
                
                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn : process.env.JWT_EXPIRES_IN
                });
                
                console.log('Token is '+ token);
                
                const cookieOptions = {
                    expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 *60 
                    ),
                    httpOnly: true
                };
                res.cookie('jwt', token, cookieOptions );
                res.status(200).redirect('/home');
            }
        });
        
    } catch (error) {
        console.log(error);
    }
};

/*LOGIN*/
/*************************************/

/*************************************/
/*REGISTER*/

exports.register = (req, res) => {
    console.log(req.body);
    
  /*const uname = req.body.uname;
    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;*/
    
    const { uname, email, password, confirmpassword } = req.body;
    
    db.query('SELECT email FROM user WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error);
        }
        
        if( results.length > 0 ){
            return res.render('register', {
                message:'That email is already in use'
            })
        } else if( password !== confirmpassword ) {
            return res.render('register', {
                message:'Passwords did not match'
            });
        }
        
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);
        
        db.query('INSERT INTO user SET ?', {uname: uname, email: email, password: hashedPassword }, (error, results) =>{
            if(error) {
                console.log(error);
            } else {
                db.query('SELECT id FROM user WHERE email = ?', [email], (error,results) => {
                    const id = results[0].id;
                    console.log(id);
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn : process.env.JWT_EXPIRES_IN 
                });
                
                const cookieOptions = {
                    expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 *60 
                    ),
                    httpOnly: true
                };
                    
                res.cookie('jwt', token, cookieOptions );
                res.status(201).redirect('/home');
                
               });
            }
        });      
    });    
};

/*REGISTER*/
/*************************************/


/*************************************/
/*VERIFY*/

exports.isLoggedIn = async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
        try {
            // verify token 
            const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            process.env.JWT_SECRET
            );
            
            console.log('decoded');
            console.log(decoded);
            
            //if user still exists
            db.query('SELECT * FROM user WHERE id = ?', [decoded.id], (error, result) => {
                console.log(result);
                if(!result) {
                    return next();
                }
                // there is a logged user
                req.user = result[0];
                console.log('next');
                return next();
            });
        } catch (err) {
            return next();
        }
    } else {
        next();
    }
};

/*VERIFY*/
/*************************************/

/*logout write*/
