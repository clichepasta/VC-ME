const express = require('express');
const app = express();
const server = require('http').Server(app);

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', async (req,res) => {
    const { v4: uuidv4 } = await import('uuid');
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req, res) => {
    console.log(req.params);
    
    res.render('room', { roomId: req.params.room});
})



server.listen(3030);
