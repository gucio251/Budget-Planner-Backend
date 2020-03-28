import jwt from 'jsonwebtoken'
import db from '../db'
import bcrypt from 'bcrypt'

export const newToken = user => {
    return jwt.sign({id: user.id}, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXP
    })
}

export const verifyToken = token =>
    new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
            if(err){
            return reject(err)
            }
            resolve(payload)
        })
    })

export const signin = async (req, res) => {
    if(!req.body.login || !req.body.password){
        return res.status(400).send({message: "There is login/password missing"})
    }

    let user = await getUserByLogin(req.body.login)

    if(!user){
        return res.status(400).send({message: `${req.body.login} does not exist in database`})
    }

    if(bcrypt.compareSync(req.body.password, user.password)){
        const token = newToken(user)
        return res.status(201).send({token})
    }else{
        return res.status(400).send({message: "Given password is incorrect"})
    }
}

export const signup = async (req, res) =>{
    if(!req.body.login || !req.body.password || !req.body.email){
        return res.status(400).send({message: "There is no login/password/email"})
    }

    let userInDb = await getUserByLogin(req.body.login)

    if(userInDb){
        return res.status(400).send({message: "This login is already taken. Cannot add user"})
    }

    try{
        const user = await addUser(req.body)
        const token = newToken(user)
        return res.status(201).send({token})
    } catch(error){
        return res.status(400).send({message: "Email is not unique. You cannot have two accounts registered on one email"})
    }
}

export const protect = async (req, res, next) =>{
    const bearer = req.headers.authorization

    if(!bearer || !bearer.startsWith('Bearer ')){
        return res.status(401).end()
    }

    const token = bearer.split(" ")[1].trim()

    let decoded

    try{
        decoded = await verifyToken(token)
    }catch(e){
        res.status(401).send({message: "You're not authorized to use api"})
    }

    const user = await getUserById(decoded.id)

    if(!user){
        return res.status(401).end()
    }

    req.user = {id: decoded.id}
    next()
}

async function getUserByLogin(login){
    const queryText = 'SELECT * FROM budget.users WHERE login = $1'

    try {
        const {rows} = await db.query(queryText, [login])
        return rows[0]
    } catch(error){
        return error
    }
}

async function getUserById(id){
    const queryText = "SELECT * from budget.users WHERE id = $1"

    try{
        const {rows} = await db.query(queryText, [id])
        return rows[0]
    } catch(error){
        return error
    }
}

async function addUser (user){
    const {login, password, email} = user

    const hashPassword = bcrypt.hashSync(password, 10)

    const queryText = 'INSERT INTO budget.users VALUES(DEFAULT, $1, $2, $3)'

    const queryValues = [
        login,
        hashPassword,
        email
    ]

    try {
        await db.query(queryText, queryValues)
        const addedUser = await getUserByLogin(login)
        return addedUser
    } catch(e){
        throw new Error(e.detail)
    }
}