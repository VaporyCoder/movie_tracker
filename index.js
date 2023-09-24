const pg = require('pg');
const client = new pg.Client('postgres://localhost/movie_tracker_db');
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());

const homePage = path.join(__dirname, 'index.html');
app.get('/', (req, res)=> res.sendFile(homePage));

const reactApp = path.join(__dirname, 'dist/main.js');
app.get('/dist/main.js', (req, res)=> res.sendFile(reactApp));

const reactSourceMap = path.join(__dirname, 'dist/main.js.map');
app.get('/dist/main.js.map', (req, res)=> res.sendFile(reactSourceMap));

const styleSheet = path.join(__dirname, 'styles.css');
app.get('/styles.css', (req, res)=> res.sendFile(styleSheet));

app.get('/api/movies', async(req,res,next) => {
  try {
    const SQL = `
    SELECT *
    FROM movies
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.put('/api/movies/:id', async(req,res,next) => {
  try {
    if(req.body.stars < 1 || req.body.stars > 5){
      throw new Error("Invalid Rating");
    }
    const SQL = `
      UPDATE movies
      SET title = $1, stars = $2\
      WHERE id = $3
      RETURNING *
    `;
    const response = await client.query(SQL, [req.body.title, req.body.stars, req.params.id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
    }
  }
);

app.use((err,req,res,next) => {
  res.status(500).send(err.message);
});

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  const SQL = `
    DROP TABLE IF EXISTS movies;
    CREATE TABLE movies(
    ID SERIAL PRIMARY KEY,
    title VARCHAR(255),
    stars INT
    );
    INSERT INTO movies(title, stars) VALUES('Fast And The Furious: Tokyo Drift', 4);
    INSERT INTO movies(title, stars) VALUES('Elf', 5);
    INSERT INTO movies(title, stars) VALUES('Harry Potter And The Sorcerers Stone', 5);
    INSERT INTO movies(title, stars) VALUES('The Dark Knight', 5);
    INSERT INTO movies(title, stars) VALUES('Ponyo', 5);
    INSERT INTO movies(title, stars) VALUES('Spider-Man: No Way Home', 5);
    INSERT INTO movies(title, stars) VALUES('Home Alone', 4);
    INSERT INTO movies(title, stars) VALUES('Tron: Legacy', 4);
    INSERT INTO movies(title, stars) VALUES('Iron Man', 4);
    INSERT INTO movies(title, stars) VALUES('The Amazing Spider-Man', 4);
    INSERT INTO movies(title, stars) VALUES('Black Panther', 4);
    INSERT INTO movies(title, stars) VALUES('The Avengers', 4);
    INSERT INTO movies(title, stars) VALUES('Deadpool', 4);
    INSERT INTO movies(title, stars) VALUES('Spirited Away', 4);
    INSERT INTO movies(title, stars) VALUES('Ford v Ferrari', 5);
    INSERT INTO movies(title, stars) VALUES('Avengers: Endgame', 5);
    INSERT INTO movies(title, stars) VALUES('Akira', 4);
    INSERT INTO movies(title, stars) VALUES('Bubble', 3);
    INSERT INTO movies(title, stars) VALUES('Wolf Children', 1);
    INSERT INTO movies(title, stars) VALUES('A Silent Voice', 4);
    INSERT INTO movies(title, stars) VALUES('Sword Art Online Movie: Ordinal Scale', 3);
    INSERT INTO movies(title, stars) VALUES('Your Name', 4);
    INSERT INTO movies(title, stars) VALUES('I Want To Eat Your Pancreas', 4);
    INSERT INTO movies(title, stars) VALUES('Violet Evergarden: The Movie', 4);
    INSERT INTO movies(title, stars) VALUES('Demon Slayer: Kimetsu no Yaiba - The Movie: Mugen Train', 4);
    INSERT INTO movies(title, stars) VALUES('Jujutsu Kaisen 0', 2);
    INSERT INTO movies(title, stars) VALUES('The Tunnel to Summer, the Exit of Goodbyes', 4);
  `;
  await client.query(SQL);
  console.log('create your tables and seed data');

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> {
    console.log(`listening on port ${port}`);
  });
};

init();
