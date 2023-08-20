const express  = require('express'); 
const app = express(); //app instance
const dotenv = require('dotenv'); //env variables
const path = require('path');
const {check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// const { link } = require('fs');
const  mongoose = require('mongoose');
dotenv.config({path:'./config/config.env'}); //dotenv path


const atlasConnectionString = process.env.ATLAS_CONN_STRING;
console.log(atlasConnectionString);
 
// Atlas connection string
mongoose.connect(atlasConnectionString)
.then((data) => {
    console.log(`connected with atlasDB ${data.connection.host}`);
})
.catch((err) => {
    console.log(err.message);
});

//Compass connection string
// mongoose.connect('mongodb://127.0.0.1:27017/sampleSignup')
// .then((data) => {
//     console.log(`connected with compassDB ${data.connection.host}`);
// })
// .catch((err) => {
//     console.log(err.message);
// });


app.use(express.urlencoded({extended:true})); //get user input in backend
app.use(cookieParser());

app.use(express.static('public'));
app.use(express.static('../client'));
app.use(express.static('../client/css'));
app.use(express.static('../client/images/fcards'));
app.use(express.static('../client/images'));


const infoPath = path.join(__dirname, '../client/info.html');
const signupPath = path.join(__dirname,'../client/signup.html');
const homePath = path.join(__dirname,'../client/index.html');
const loginPath = path.join(__dirname, '../client/login.html');


//internal DB array

const users = [
    {username:'sam', 
    password:'123', 
    email:'sam@gmail.com'},
];

//schema for signupInfo (Atlas)
const signupSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        // min: [3, 'minimum 3 characters']
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        // min: [4, 'min 4 characters']
    }
    
});

// schema for signupInfo (Compass)
// const signupSchemaC = new mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         // min: [3, 'minimum 3 characters']
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true,
//         // min: [4, 'min 4 characters']
//     }
    
// });

// model for Schema (Atlas)
const signupModel = mongoose.model('signupInfo', signupSchema);

//model for Schema (Compass)
// const signupModelC = mongoose.model('signupInfo', signupSchemaC);

var signupValidate = [
    check('userName').isLength({min:3}).withMessage('Username must be minimum 3 characters').trim(),
    check('email').isEmail().withMessage('must be a valid email address'),
    check('password').isLength({min:3, max:10}).withMessage('password must be between 3 and 10 characters!').trim()
]


//route signup 
app.get('/signup.html', (req, res) => {
    res.sendFile(signupPath);
});

app.post('/signup.html', signupValidate, (req, res) => {
    const { userName, email, password } = req.body;
    console.log(userName, email, password);
    //get errors if any
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()){
        return res.status(422).json({errors:errors.array()});
        
    
     } else {
        let newSignupInfo = new signupModel({
            username : req.body.userName,
            password : req.body.password,
            email : req.body.email,
        });
        newSignupInfo.save()
        .then(savedUser => {
            console.log(`saved user details : ${savedUser}`);
        })
        .catch(err => {
            console.log(`error saving user ! ${err.message}`);
        })
        // console.log(users);
        res.status(200).redirect('/login.html');
    } 
});

//login route 
app.get('/login.html', (req, res ) => {
    res.sendFile(loginPath);
} );

app.post('/login.html', (req, res) => {
    console.log(req.body);
    const loginUser = {
        userName : req.body.userName,
        password : req.body.password,
    }

    res.redirect('/index.html');
    //for jwt
    // const user = users.find((data) => data.username === loginUser.userName && data.password === loginUser.password);
    // if(user) {
    //     console.log('user found!');
    //     //create payload for token
    //     const data = {
    //         username:loginUser.userName,
    //         date:Date(),
    //     };

    //     //create token using sign()
    //     const token = jwt.sign(data, process.env.SECRET_KEY, ({expiresIn:"10min"}));
    //     console.log(token);


    //     res.cookie('token', token).redirect('index.html');
    // } else {
    //     console.log('User not found!');
    // }
})

// //error
// app.get('/errors', (req, res) => {
//     const error = errors;
// })


app.get('/info.html', (req, res) => {
    res.sendFile(infoPath);
});
app.get('/index.html', (req, res) => {
    res.redirect(homePath);
});




app.listen(process.env.PORT, () => {
    console.log(`Sever running on port ${process.env.PORT}`)
});