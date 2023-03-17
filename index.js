import express from "express"
import cors from "cors"
import mongoose from "mongoose";
import UserSchema from "./Models/User.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import PostSchema from "./Models/Post.js";
import multer from 'multer'



mongoose.connect(
    'mongodb+srv://Admin:wwwwww@cluster0.fyci2ly.mongodb.net/shop?retryWrites=true&w=majority'
)
.then(()=>console.log("DB OK"))
.catch((err)=>console.log("DB error", err))

const app = express();

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads')
    },
    filename: (_, file, cb)=>{
        cb(null,file.originalname)
    }
})

const upload = multer({storage})


app.use(cors({
    origin: '*'}));

const data = [
    {
        'id': "1",
        "questions": [
            {
                id: "1",
                name: "Rate something",
                score: 3
            },
            {
                id: "2",
                name: "Rate something",
                score: 4
            },
            {
                id: "3",
                name: "Rate something",
                score: 1
            },
        ]
    },
    {
        'id': "2",
        "questions": [
            {
                id: "1",
                name: "Rate something",
                score: 3
            },
            {
                id: "5",
                name: "Rate something",
                score: 4
            },
            {
                id: "6",
                name: "Rate something",
                score: 1
            },
        ]
    },
    {
        'id': "3",
        "questions": [
            {
                id: "7",
                name: "Rate some thing",
                score: 3
            },
            {
                id: "8",
                name: "Rate some thing",
                score: 4
            },
            {
                id: "9",
                name: "Rate some thing",
                score: 1
            },
        ]
    },
    ]
app.use(express.json())
app.use('/uploads', express.static('uploads'))

const checkAuth = (req, res, next)=>{
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "")
    console.log(token)
    if(token){
        try {
            const decoded = jwt.verify(token, "secret1234")
            console.log(decoded)
            req.userId = decoded._id
            next()
        }catch (e){
            return res.status(403).json({
                message: "Нема доступу jwt",
            })
        }
    }else {
        return res.status(403).json({
            message: "Нема2 доступу",
        })
    }
}

app.get('/', (req, res)=>{
    res.send(data)
})


//Upload
app.post('/upload', upload.single("image"), (req, res)=>{
    res.json({
        url: `http://localhost:4444/uploads/${req.file.originalname}`
    })
})

//User
app.post('/auth/me',checkAuth,  async (req, res)=>{
    try {
        const user = await UserSchema.findById(req.userId)
        if(!user){
            return res.status(404).json({
                message: "Нема токаого користувача"
            })
        }
        const {passwordHash, ...userData} = user._doc
        res.json({
            ...userData
        })

    }catch (e) {
        return res.status(403).json({
            message: "Нема доступу",
        })
    }
})
app.post('/auth/login', async (req, res)=>{
    try {
        const user = await UserSchema.findOne({email: req.body.email})
        if(!user){
            return res.status(404).json({
                message: "Користувач не знайдений"
            })
        }
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)
        if(!isValidPass){
            return res.status(400).json({
                message: "Невірний логіч чи пароль"
            })
        }
        const  token = jwt.sign({
            _id: user._id
        }, 'secret1234',{
            expiresIn: '30d'
        })
        const {passwordHash, ...userData} = user._doc
        res.json({
            ...userData,
            token
        })
    }catch (err){
        console.log(err)
        res.status(500).json({
            message: "Не вийшло ввійти",
        })
    }
})
app.post('/auth/register', async (req, res)=>{
    //
    try {
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hash = await  bcrypt.hash(password, salt)
        const doc = new UserSchema({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash
        })
        const user = await doc.save()
        const  token = jwt.sign({
            _id: user._id
        }, 'secret1234',{
            expiresIn: '30d'
        })
        const {passwordHash, ...userData} = user._doc
        res.json({
            ...userData,
            token
        })

    }catch (err){
        console.log(err)
        res.status(500).json({
            message: "Не вийшло зареєструватись",
        })
    }

    // const  token = jwt.sign({
    //     email: req.body.email,
    //     fullName: "Qwe Qwe"
    // }, "secret123")
    // res.json({
    //     success: true,
    //     token,
    // })


})

//Post CRUD
//Get All
app.get('/posts', async (req, res)=>{
    try {
        const posts = await PostSchema.find().populate('user').exec()

        res.json(posts)
    }catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Не вийшло отримати пости"
        })
    }
})

//Create Post
app.post('/posts', checkAuth,async (req, res)=>{
    try {
        const doc = new PostSchema({

            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
        })
        const post = await doc.save()
        res.json(post)
    }catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Не вийшло створити пост"
        })

    }
})

//Get One
app.get('/post/:id', async (req, res)=>{
    try {
        const  postId = req.params.id
        await PostSchema.findOneAndUpdate({
            _id: postId
        },
        {
            $inc:{viewsCount: 1}
        },
        {
            returnDocument: 'after'
        })

        const post = await PostSchema.findOne({_id: postId})
        res.json(post)
    }catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Не вийшло отримати пост"
        })
    }
})

//Delete
app.delete('/post/:id',  async (req, res)=>{
    try {
          await PostSchema.findOneAndDelete({_id: req.params.id }).then(function (data, err) {
            if (!data){
                res.status(500).json({
                    message: "Такий пост не знайдено"
                })
                console.log(err)
            }
            else{
                res.json({
                    success: true
                })
            }
        });
    }catch (e){
        console.error(e)
        res.status(500).json({
            message: "Не вийшло видалити пост"
        })
    }
})

//Update
app.patch('/post/:id', checkAuth ,async (req, res)=>{
    try {
        await PostSchema.updateOne({_id: req.params.id},{
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
        })
        res.json({
            success: true
        })
    }catch (e){
        console.error(e)
        res.status(500).json({
            message: "Не вийшло Обновити пост"
        })
    }
})







app.listen(4444, (err)=>{
    if(err){
        return console.log(err)
    }
    console.log("Server OK")
})