module.exports = function async(BOTID, AUTHORIZATION, LOGSERVER) {
  const express = require("express");
  const path = require("path");
  const axios = require("axios");
  const fs = require("fs");

  let app = express();

  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");

  app.get("/medicinebox", (req, res, next) => {
     try {
       if (req.query.onechat_token === undefined) {
         console.log("onechat_token of undifind");
         res.send({
           message: "onechat_token of undifind",
           status: "fail",
           data: "",
         });
       } else {
         let bot_id = BOTID; // *bot id
         let bearer = AUTHORIZATION; // *Token Service (Authorization)
         const onechat_token = req.query.onechat_token;
         console.log("onechat_token ===> ", onechat_token);
         var data = JSON.stringify({
           bot_id: bot_id,
           source: onechat_token,
         });

         var config = {
           method: "post",
           url: "https://chat-api.one.th/manage/api/v1/getprofile",
           headers: {
               Authorization: bearer,
               "Content-Type": "application/json",
           },
           data: data,
         };

         axios(config)
           .then(function (response) {
             console.log("data user ===> ", response.data);

             let oneID = response.data.data.one_id;
             console.log("oneID ====>", oneID);

             res.render("medicinebox", { oneID: oneID, logserver: LOGSERVER });
           })
           .catch(function (error) {
             console.log("error ===>", error);
             res
               .status(401)
               .send({
                 message: err.response.data.errorMessage,
                 status: "fail",
                 data: "",
               });
           });
       }
     } catch (error) {
       res
         .status(401)
         .send({ message: error.message, status: "fail", data: "" });
     }
  });

  app.get("*", (req, res, next) => {
    console.log("in all part");
    res.send("bot menu v1.0.0");
  });

  return app;
};
