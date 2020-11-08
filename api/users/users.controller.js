const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./user.model');
const nodemailer = require('nodemailer');
const {v4: uuid} = require('uuid');
const { ObjectId } = require('mongodb');


class UserController {
    async register(req, res, next) {
        try{
            const {email, password} = req.body;
            const user = await userModel.findOne({email});
            if(user) {
                return res.status(409).send({message: 'User is already exist'})
            }
            const hashPassword = await bcrypt.hash(password, 5);
            const createdUser = await userModel.create({
                email,
                password: hashPassword,
            });

            await UserController.sendVerifyEmail(createdUser)

            return res.send({user: {
                email,
            }})
        }catch(err) {
            next(err)
        }
    }

    async login(req, res, next) {
        try{
            const {email, password} = req.body;
            const user = await userModel.find({email});
            if(!user) {
                return res.status(404).send({message: 'User was not found'});
            }
            const isPasswordValid = await bcrypt.compare(password, user[0].password);

            if(!isPasswordValid) {
                return res.send({message: 'Authentefication failed.'})
            }


            if(user[0].status != 'verified') {
                return res.send({message: 'User was not verified'})
            }

            const token = await jwt.sign({id: user[0].id}, process.env.TOKEN_SECRET, {expiresIn: '12h'});
            const updateUser = await userModel.findByIdAndUpdate(user[0].id, {
                token
            }, {new: true});
            return res.send(UserController.validateUserResponce([updateUser]));
        }catch(err) {
            next(err)
        }
    }

    async verificationEmail(req, res, next) {
        try{
            const verifyString = req.params.verificationToken;
            const userToVerify = await userModel.findOne({verificationToken: verifyString});
            console.log(userToVerify)
            if(!userToVerify) {
                return res.send('User was not found');
            }
            await UserController.verifyUser(userToVerify._id);
            return res.send({message: 'User was verified'})
        }catch(err) {
            next(err)
        }
    }

    async authorize(req, res, next) {
        try{
            const authorizationHeader = req.get('Authorization') || '';

            let token;

            if(authorizationHeader) {
                token = authorizationHeader.split(' ')[1];
            }
            console.log(token)
            let userId
            try{
                userId = await jwt.verify(token, process.env.TOKEN_SECRET).id;
                console.log(userId)
            }catch(err) {
                console.log(err)
            }
            const user = await userModel.findById(userId);

            if(!user || user.token != token) {
                return res.status(401).send({message: 'Authorization failed'})
            }
            console.log(user)
            req.user = UserController.validateUserResponce([user])
            next();
        }catch(err) {
            next(err)
        }
    }

    async getAllUsers(req, res, next) {
        try{
            const email = req.query.email;
            console.log(req.user)
            const users = await userModel.find(email ? {email} : {}).select('-token')
            return res.send(UserController.validateUserResponce(users))
        }catch(err) {
            next(err)
        }
    }

    async logout(req, res, next) {
        try{
            await userModel.findByIdAndUpdate(req.user[0].id, {
                token: null
            }, {new: true});

            return res.send({message: 'success'});
        }catch(err) {
            next(err);
        }
    }

    async getCurrentUser(req, res, next) {
        try{
            const user = req.user;
            console.log(user);

            return res.send(user[0])
        }catch(err) {
            next(err)
        }
    }

    static validateUserResponce(users) {
        return users.map((user) => {
            return {
                id: user._id,
                email: user.email,
                token: user.token
            }
        });
    }

    validateCreateUser(req, res, next) {
        const rulesSchema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
        })

        UserController.checkValidationError(rulesSchema, req, res, next);
    }

    validateUserLogin(req, res, next) {
        const rulesSchema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
        });

        UserController.checkValidationError(rulesSchema, req, res, next)
    }

    static checkValidationError(schema, req, res, next) {
        const {error} = schema.validate(req.body)
        if(error) {
            return res.status(400).send({message: error.details[0].message})
        }
        next()
    }

    static async sendVerifyEmail(user) {
        const {id} = user._id
        const verificationString = await UserController.saveVerifyString(ObjectId(id))

        const transporter = nodemailer.createTransport({
            // service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 587, false for other ports
            requireTLS: true,
            auth: {
              user: process.env.MAIN_POST,
              pass: process.env.PASSWORD_POST,
            },
        });

        const verificationURL = `http://localhost:3000/api/auth/verify/${verificationString}`;

        const mailOptions = {
            from: process.env.MAIN_POST,
            to: user.email,
            subject: 'Email Verification Test',
            html: `<a href='${verificationURL}'>Click here for verification</a>`
        }

        return transporter.sendMail(mailOptions);
    }

    static async saveVerifyString(userId) {
        const string = uuid();
        console.log(userId)
        const {verificationToken} = await userModel.findByIdAndUpdate(userId, {
            verificationToken: string
        }, {new: true});

        return verificationToken
    }

    static async verifyUser(userId) {
        await userModel.findByIdAndUpdate(userId, {
            status: 'verified',
            verificationToken: null,
        })
        return 'success'
    }
}

module.exports = new UserController