const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

 //   router.get('/home', (req,res) => {
 //      res.render('home');
 //   });

router.get('/home', authController.isLoggedIn, (req, res) => {
    console.log('inside');
    console.log(req.user);
    res.render('home', {
        user: req.user
    });
});

/********************write /profile part */


router.get('/', (req,res) => {
    res.render('index');
});

router.get('/register', (req,res) => {
    res.render('register');
});

router.get('/login', (req,res) => {
    res.render('login');
});

module.exports = router;