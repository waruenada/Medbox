
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');
const port = config.get('PORT') || 9000;

const botmenu = require('./botmenu');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/botmenu', botmenu(config.get('BOTID'), config.get('AUTHORIZATION'), config.get('LOGSERVER')));

app.get('/', (req, res, next) => {
  console.log(req);
})

app.get('*', (req, res, next) => {
	console.log(req.body)
	res.send('bot server v1.0.0');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
