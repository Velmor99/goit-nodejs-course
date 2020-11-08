const {Router} = require('express')
const userRouter = Router();
const UserController = require('./users.controller')

userRouter.get('/test', (req, res, next) => res.send('ok'));

userRouter.get('/verify/:verificationToken', UserController.verificationEmail)

userRouter.post('/register', UserController.validateCreateUser, UserController.register);

userRouter.put('/login', UserController.validateUserLogin, UserController.login);

userRouter.get('/all', UserController.authorize, UserController.getAllUsers);

userRouter.put('/logout', UserController.authorize, UserController.logout);

userRouter.get('/current', UserController.authorize, UserController.getCurrentUser)

module.exports = userRouter;
