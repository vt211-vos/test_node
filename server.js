


const  express = require("express")
const cors = require('cors')
const app = express();
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

app.get('/', (req, res)=>{
    res.send(data)
})

app.listen(4444, (err)=>{
    if(err){
        return console.log(err)
    }
    console.log("Server OK")
})