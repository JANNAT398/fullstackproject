require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();

const securityMaintain = require('./middleware/security');
const mongodbConnect = require('./config/mongodbConfig');

const { registrationController } = require('./controllers/authentiCation');
const  {loginController}  = require('./controllers/loginController')
const User = require('./models/schemaModels');

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongodbConnect();

app.post('/login', loginController);
// Multer Storage Configuration
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './uploads');
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }

});


// Multer Upload Middleware
const upload = multer({ storage: storage });


// Create Todo
app.post('/registration', upload.single('profile'), registrationController);


// Get All Todo
app.get('/all/todo', securityMaintain, async (req, res) => {

    let data = await User.find({});

    res.send(data);

});


// Delete Todo
app.delete('/delete/:id', async (req, res) => {

    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.send("delete");

});


// Update Todo
app.post('/update/:id', async (req, res) => {

    let { id } = req.params;

    let update = await User.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
    );

    res.send(update);

});


// Server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});