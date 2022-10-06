const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "datapeace.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/id/", async (request, response) => {
  let data = null;
  let getUsersQuery = "";
  const { search_q = "", first_name, age } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getUsersQuery = `
      SELECT
        *
      FROM
        user
      WHERE
        user LIKE '%${search_q}%'
        AND status = '${first_name}'
        AND priority = '${age}';`;
      break;
    case hasPriorityProperty(request.query):
      getUsersQuery = `
      SELECT
        *
      FROM
        user
      WHERE
        user LIKE '%${search_q}%'
        AND priority = '${first_name}';`;
      break;
    case hasStatusProperty(request.query):
      getUsesQuery = `
      SELECT
        *
      FROM
        user
      WHERE
        user LIKE '%${search_q}%'
        AND status = '${age}';`;
      break;
    default:
      getUsersQuery = `
      SELECT
        *
      FROM
        user
      WHERE
        user LIKE '%${search_q}%';`;
  }

  data = await database.all(getUsersQuery);
  response.send(data);
});

app.get("/users/:usersId/", async (request, response) => {
  const { usersId } = request.params;

  const getUserQuery = `
    SELECT
      *
    FROM
      user
    WHERE
      id = ${usersId};`;
  const user = await database.get(getUserQuery);
  response.send(user);
});

app.post("/users/", async (request, response) => {
  const { id, first_name, last_name, company_name,citystate,zip,email,web,age } = request.body;
  const postUserQuery = `
  INSERT INTO
    user (id,first_name, last_name, company_name,citystate,zip,email,web,age)
  VALUES
  (${id}, '${first_name}', '${last_name}', '${company_name}', '${citystate}', '${zip}', '${citystate}', '${zip}', '${email}', '${web}', '${age});`;
  await database.run(postUserQuery);
  response.send("User Successfully Added");
});

app.put("/users/:usersId/", async (request, response) => {
  const { userId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "FirstName";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Age";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Id";
      break;
  }
  const previousUserQuery = `
    SELECT
      *
    FROM
      user
    WHERE 
      id = ${id};`;
  const previousUser = await database.get(previousUserQuery);

  const {
    id = previousUser.id,
    first_name = previousUser.first_name,
    age = previousUser.age,
  } = request.body;

  const updateUserQuery = `
    UPDATE
      user
    SET
      Id='${user}',
      firstname='${priority}',
      age='${age}'
    WHERE
      id = ${userId};`;

  await database.run(updateUserQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/users/:userId/", async (request, response) => {
  const { userId } = request.params;
  const deleteUserQuery = `
  DELETE FROM
    user
  WHERE
    id = ${id};`;

  await database.run(deleteUserQuery);
  response.send("User Deleted");
});

module.exports = app;