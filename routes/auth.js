const express = require('express');
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../Middleware/fetchuser')
const JWT_SECRET = 'hello';


// Route # 1: Create a user using POST: "/api/auth/createuser" does not require authentication. No Login required.
router.post('/createuser', [


  // Cheques 
  body('email', "Enter a valid email").isEmail(),
  body('password', "Choose a strong password").isLength({ min: 5 }),
  body('name', "Enter a valid username").isLength({ min: 3 }),

  
], async (req, res) => {
let success = false;
  // If there are errors then return bad requests and errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });

  }
  // Check whether the user is already existed
  try {


    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success,  error: "Sorry user with this email is already exists" })
    }

    // Secuirng the passsword using bcryptjs
     const salt = await bcrypt.genSalt(10);
    const secPass =  await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,

    })
const data = {
  user :{
    id :user.id
  }
}
   const authToken = jwt.sign(data, JWT_SECRET);
success = true;
    res.json({ success, authToken })

    // Catch Errors
  } catch (error) {
    console.error(error.message);
    res.status(500).send(" Ops! iNotebook got some error ")
  }
})

// LOGIN SECTION


//  Route # 2 : Authinticate a user  using POST: "/api/auth/login" does not require authentication. 
router.post('/login', [

  // Cheques 
  body('email', "Enter a valid email").isEmail(),
  body('password', "Password cannot be blank").exists(),
  

  // If there are errors then return bad requests and errors
], async (req, res) => {
let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });

  }

  // Cheking   user verification
const {email, password} = req.body;
try {
let user = await User.findOne({email});
if (!user){
 return res.status(400).json({error : "Please provide the correct credentials"})
}

// Comparing the providing password with the stored password

const passswordCompare =  await bcrypt.compare(password, user.password)
if (!passswordCompare){
  success= false;
 return res.status(400).json({success, error : "Please provide the correct credentials"})
}

const data = {
  user :{
    id :user.id
  }
}
const authToken = jwt.sign(data, JWT_SECRET);
success = true;
res.json({success, authToken })
} catch (error) {
  console.error(error.message);
  res.status(500).send(" Ops! iNotebook got some error ")
}

});
// Route # 3: Create a user using POST: "/api/auth/getuser. Login required.
router.post('/getuser', fetchuser,  async (req, res) => {
try {
 
  userId = req.user.id;
  const user = await User.findById(userId).select(req.body)
  res.send(user)
} catch (error) {
  console.error(error.message);
  res.status(500).send(" Ops! iNotebook got some error ")
}

});
module.exports = router






