CREATE TABLE landscapes(
   id         serial PRIMARY KEY NOT NULL,
   name       varchar(100) UNIQUE,
   locked_by  varchar(100)
);
