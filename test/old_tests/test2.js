zombie = require("zombie")
zombie.visit("http://www.google.com", function(err, browser,status){
 console.log("estt")
 if (err) {
   console.log("there was an error")
   console.log(err.message)
   return
 }
})

  
