/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_CLINICLOUDSTORAGE_NAME
	STORAGE_CLINICLOUDSTORAGE_ARN
	STORAGE_CLINICLOUDSTORAGE_STREAMARN
Amplify Params - DO NOT EDIT */

const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const { response } = require("express");

//funçao que cria um id pro usuario baseado na data
function createId() {
  return Date.now().toString();
}

// post (create) a user
app.post("/user", function (req, res) {
  console.log(req);

  const params = {
    TableName: process.env.STORAGE_CLINICLOUDSTORAGE_NAME,
    Item: {
      id: createId(),
      cpf: req.body.cpf,
      name: req.body.name,
      birthdate: req.body.birthdate,
      email: req.body.email,
      address: req.body.address,
    },
  };
  docClient.put(params, function (err, data) {
    if (err) res.json(err);
    else res.json({ success: "User created" });
  });
});

// get all users
app.get("/user", async (req, res) => { 

  const params = {
    TableName: process.env.STORAGE_CLINICLOUDSTORAGE_NAME,
  }
  const resp = await docClient.scan(params).promise();
  res.json(resp)
  }
);

// get user by id
app.get("/user/:id", async (req, res) => {

  const id = req.params.id;

  const getUsersbyId = async (id) => {    
    const params = {
      TableName: process.env.STORAGE_CLINICLOUDSTORAGE_NAME,
      Key: {
        id
      }
    }
    return await docClient.get(params).promise();
  }

  const resp = await getUsersbyId(id)
  res.json(resp)
  }
);

// put user by id
app.put("/user/:id",  async function (req, res) {  
  const id = req.params.id
  const user = req.body;
  user.id = id;
  
  const updateUser = async (user) => {
    const params = {
      TableName: process.env.STORAGE_CLINICLOUDSTORAGE_NAME,
      Item: user
    }
    return await docClient.put(params).promise();
  }

  const updatedUser = await updateUser(user);
  res.json(updatedUser);
});

// delete user by id
app.delete("/user/:id", async function (req, res) {
  const id = req.params.id;

  const deleteUser = async (id) => {
    const params = {
      TableName: process.env.STORAGE_CLINICLOUDSTORAGE_NAME,
      Key: {
        id
      }
    }
    return await docClient.delete(params).promise();
  }

  res.json(await deleteUser(id))
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
