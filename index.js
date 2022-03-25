const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const app = express()
const port = 3001
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended:true}))


// setup connection to local mysql db
const connection =  mysql.createPool({
  host: 'localhost',
  user:'root',
  database: 'smartCampus',
})

// test db connection status
const test_connection = async () =>  {
  const result = await connection.query('show tables')
  console.log(result)
  
}

const auth = async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '')
      const decoded = jwt.verify(token, 'comp499')

      console.log(decoded)
      
      next()

    } catch (error) {
      res.status(401).send("Error: Please authenticate")
    }

}


// test_connection()

// connection.query(
//   'show tables', 
//   (err, results, fields) => {
//     if(results){
//       console.log('Database connect successfully')
//     }

//     if(err){
//       console.log(err)
//     }
// })

app.get('/', auth,  (req, res) => {
  res.send('Hello World!')
})
 
/**
 * TODO
 * endpoints: 
 *  1. SignIn
 *  2. AddComment
 *  3. SearchUser/[UserID] SearchUser/7
 */

// user regisration endpoint
app.post('/SignUp', async (req, res) => {
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const email = req.body.email
  const password = req.body.password
  
  // insert 
  connection.query(
      'INSERT INTO User (`FirstName`, `LastName`, `Email`, `Password`) \
      VALUES (?,?,?,?)',[firstName, lastName, email, password],
      (err, result) => {
        if (err){
          console.log(err)
          res.sendStatus(500)
        }
  })
    

    res.sendStatus(201)
    // console.log(firstName);
  
})

app.post('/SignIn', async(req, res) => {

  const email = req.body.email;
  const password = req.body.Password;

  //verify Sign-In
  const results = await connection.execute(
    'SELECT * FROM `User`  \
    WHERE `Email` = ? AND `Password` = ?' , 
    [email,password]
    // (err, results) => {
    //   console.log(results)
    // }
  )
  console.log(results[0])

  // if user validated
  if(results[0].length){
    const token = jwt.sign({User: results[0][0]}, 'comp499',{expiresIn: 300})
    const UserInfo = {
      user: results[0][0],
      token
    }

    res.json(UserInfo)
  }else{
    res.status(400).send("Email or Password Not Correct")
  }
})

// localhost:3001/commentls/pageNum
app.get('/commentls/:pageNum', async(req,res)=>{
  const pageNum = req.params.pageNum;
  try {
    
    const results = await connection.execute(
      "SELECT FirstName, LastName, content FROM comment \
        LEFT JOIN user ON comment.userId = user.userId \
        WHERE `pageNum` = ? ",
      [pageNum]
    )
    console.log(results[0])

    res.json(results[0])
  } catch (error) {
    res.status(500).send(error)
  }

})

//Insert Comment into the Blog section
app.post('/commentInsert', auth, async(req, res) => {
  const pageNum = req.body.pageNum;
  const userId = req.body.UserId;
  const content = req.body.content;

  try {
    const results = await connection.execute(
      'INSERT INTO comment (`userID`,`pageNum`,`content`) VALUES(?,?,?)', 
      [userId,pageNum,content]
    )
  
    console.log(results)
    res.json(results[0])
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})