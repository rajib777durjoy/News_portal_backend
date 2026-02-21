import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const app = express ();
const port = process.env.PORT || 8000 ;
app.use(cors());


app.get('/',(req,res)=>{
    res.send("server is running")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
