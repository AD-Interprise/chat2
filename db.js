const mongoose = require('mongoose');

//Database Connection
(() => {
  try {
    mongoose
      .connect(process.env.DB_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        // console.log("Database Connected....");
      });
  } catch (error) {
    //   console.log("error connecting database");
  }
})();
