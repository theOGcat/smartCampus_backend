const express = require('express')
const mysql = require('mysql2')

const app = express()
const port = 3001

app.use(express.json())
app.use(express.urlencoded({extended:true}))


// setup connection to local mysql db
const connection =  mysql.createConnection({
  host: 'localhost',
  user:'root',
  database: 'smartCampus',
})

// test db connection status
connection.query(
  'show tables', 
  (err, results, fields) => {
    if(results){
      console.log('Database connect successfully')
    }

    if(err){
      console.log(err)
    }
})

app.get('/', (req, res) => {
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
    
  connection.query()
    res.sendStatus(201)
    // console.log(firstName);
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})