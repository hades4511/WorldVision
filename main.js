const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoConnect = require('./util/database').MongoConnect;
const compression = require('compression');
const helmet = require('helmet');

const server = express();

server.set('view engine', 'ejs');
server.set('views', 'views');

server.use(helmet());
server.use(compression());

const homeroutes = require('./routes/home');
const footerRoutes = require('./routes/footer');
const authenticationRoutes = require('./routes/auth');
const authorRoutes = require('./routes/author');
const errorcontroller = require('./controllers/errors');
// const { Server } = require('http');
// const { compareSync } = require('bcrypt');

server.use(bodyParser.urlencoded({extended: false}));
server.use(express.static(path.join(__dirname, 'public')));

server.use('/author', authenticationRoutes);
server.use('/author', authorRoutes);
server.use(footerRoutes);
server.use(homeroutes);

server.get('/500', errorcontroller.get500);
server.use(errorcontroller.get404);


mongoConnect(() => {
    console.log("server");
    server.listen(process.env.port || 3000);
});