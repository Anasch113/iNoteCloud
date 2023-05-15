const express = require('express');
const router = express.Router();
const fetchuser = require('../Middleware/fetchuser')
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note')


// Route # 1: Fetch all notes using get: "/api/notes/fetchallnotes". Login required.



router.get('/fetchallnotes', fetchuser, async (req, res) => {
   try {
      const notes = await Note.find({ user: req.user.id })
      res.json(notes)
// Catch Errors
   } catch (error) {
      console.error(error.message);
      res.status(500).send(" Ops! iNotebook got some error ")
   }
})


// Route # 2: Add a note using post: "/api/notes/addnote". Login required.
router.post('/addnote', [

   // Cheques 

   body('title', "Choose a valid title").isLength({ min: 5 }),
   body('description', "Description must be atleast 3 chracters").isLength({ min: 3 }),


], fetchuser, async (req, res) => {
   try {



      const { title, description, tag } = req.body;
      // If there are errors then return bad requests and errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });

      }

      // Add a New Note
      const note = new Note({
         title, description, tag, user: req.user.id
      })
      const saveNote = await note.save()
      res.json(saveNote)

// Catch Errors
   } catch (error) {
      console.error(error.message);
      res.status(500).send(" Ops! iNotebook got some error ")
   }
})


// Route # 3: Update  an existing note using put: "/api/notes/updatenote". Login required.
router.put('/updatenote/:id',  fetchuser, async (req, res) =>{
const {title, description, tag} = req.body;

try {
   

// Create a newNote project
const newNote = {}
if(title){newNote.title = title}
if(description){newNote.description = description}
if(tag){newNote.tag = tag}

// Find a note that needs to be  updated and update it

let note = await Note.findById(req.params.id);
if(!note){ return res.status(404).send("Not found")}

// Allow to update only when it belongs to original owner
if(note.user.toString() !== req.user.id){
   return res.status(401).send("Not Allowed")
}

note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new : true})
res.json({note});


// Catch Errors
} catch (error) {
   console.error(error.message);
      res.status(500).send(" Ops! iNotebook got some error ")
}
})


// Route # 4: Deleting a note using delete: "/api/notes/deletenote". Login required.
router.delete('/deletenote/:id',  fetchuser, async (req, res) =>{
   const {title, description, tag} = req.body;
   
   try {
      
   
   
   // Find a note that needs to be  delete and delete it
   let note = await Note.findById(req.params.id);
   if(!note){ return res.status(404).send("Not found")}

   // Allow to delete only when it belongs to original owner
   if(note.user.toString() !== req.user.id){
      return res.status(401).send("Not Allowed")
   }
   
   note = await Note.findByIdAndDelete(req.params.id)
   res.json({"Success" : "Note has been deleted", note : note});

   // Catch Errors
} catch (error) {
   console.error(error.message);
   res.status(500).send(" Ops! iNotebook got some error ")
}
   })
module.exports = router
