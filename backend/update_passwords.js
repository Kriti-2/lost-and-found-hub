require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostandfoundhub';
console.log("Connecting to " + URI);

mongoose.connect(URI).then(async () => {
    console.log("Connected...");
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({ password: { $exists: false } });
    console.log("Found " + users.length + " accounts without passwords.");
    
    if(users.length > 0) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('srmist123', salt);
        
        let c = 0;
        for(let u of users) {
            u.set('password', hash);
            await u.save();
            c++;
        }
        console.log('Updated ' + c + ' accounts to have default password "srmist123"');
    }
    
    process.exit(0);
}).catch(console.error);
