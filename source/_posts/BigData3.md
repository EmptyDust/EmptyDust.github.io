---
title: BigData3
date: 2025-11-13 13:48:53
tags:
---

# 作业

## 热门问题：老师，我作业数据呢？

在希冀平台实验2中，找到它的作业那一栏，能注意到左上角突然出现了 `实验数据` 一栏。
![1763436689806.png](https://bu.dusays.com/2025/11/18/691be893cb2d5.png)

然后就可以载入数据了。



疑似hive不支持使用##作为分隔符，因此我采取了正则匹配成功加载了数据。

first edition was made by deepseek
fix by fengling
thank for zc.
```sql
-- =============================================
-- 1. Create Tables and Import Data
-- =============================================

set hive.cli.print.header=true;

-- Create users table
CREATE TABLE users (
    userid BIGINT,
    gender STRING,
    age INT,
    occupation STRING,
    zipcode STRING
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.RegexSerDe'
WITH SERDEPROPERTIES (
    'input.regex' = '(\\d+)::(\\w)::(\\d+)::(\\d+)::(\\S+)'
)
STORED AS TEXTFILE;

-- Create movies table
CREATE TABLE movies (
    movieid BIGINT,
    title STRING,
    genres STRING
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.RegexSerDe'
WITH SERDEPROPERTIES (
    'input.regex' = '(\\d+)::(.+)::(.+)'
)
STORED AS TEXTFILE;

-- Create ratings table
CREATE TABLE ratings (
    userid BIGINT,
    movieid BIGINT,
    rating DOUBLE,
    timestamped STRING
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.RegexSerDe'
WITH SERDEPROPERTIES (
    'input.regex' = '(\\d+)::(\\d+)::(\\d+)::(\\d+)'
)
STORED AS TEXTFILE;

-- LOAD DATA LOCAL INPATH '/mnt/cgshare/ratings.dat' OVERWRITE INTO TABLE ratings;--

-- Load data into tables
LOAD DATA LOCAL INPATH '/mnt/cgshare/users.dat' INTO TABLE users;
LOAD DATA LOCAL INPATH '/mnt/cgshare/movies.dat' INTO TABLE movies;
LOAD DATA LOCAL INPATH '/mnt/cgshare/ratings.dat' INTO TABLE ratings;

-- Verify data loading
SELECT 'Users count: ' || COUNT(*) FROM users;
SELECT 'Movies count: ' || COUNT(*) FROM movies;
SELECT 'Ratings count: ' || COUNT(*) FROM ratings;

-- =============================================
-- 2. Top 10 Most Rated Movies
-- =============================================

SELECT 
    m.title AS movie_name,
    COUNT(*) AS rating_count
FROM 
    ratings r
JOIN 
    movies m ON r.movieid = m.movieid
GROUP BY 
    m.title
ORDER BY 
    rating_count DESC
LIMIT 10;

-- =============================================
-- 3. Top 10 Movies by Gender
-- =============================================

-- For males
SELECT 
    'M' AS gender,
    m.title AS movie_name,
    AVG(r.rating) AS avg_rating
FROM 
    ratings r
JOIN 
    movies m ON r.movieid = m.movieid
JOIN 
    users u ON r.userid = u.userid
WHERE 
    u.gender = 'M'
GROUP BY 
    m.title
ORDER BY 
    avg_rating DESC
LIMIT 10;

-- For females
SELECT 
    'F' AS gender,
    m.title AS movie_name,
    AVG(r.rating) AS avg_rating
FROM 
    ratings r
JOIN 
    movies m ON r.movieid = m.movieid
JOIN 
    users u ON r.userid = u.userid
WHERE 
    u.gender = 'F'
GROUP BY 
    m.title
ORDER BY 
    avg_rating DESC
LIMIT 10;

-- =============================================
-- 4. Average Rating for Movie ID 2116 by Age Group
-- =============================================

SELECT 
    u.age AS age_group,
    AVG(r.rating) AS avg_rating
FROM 
    ratings r
JOIN 
    users u ON r.userid = u.userid
WHERE 
    r.movieid = 2116
GROUP BY 
    u.age
ORDER BY 
    u.age;

-- =============================================
-- 5. Top 10 Highest Rated Movies by Most Active Female User
-- =============================================

WITH top_female_reviewer AS (
    SELECT
        u.userid,
        COUNT(r.rating) AS review_count
    FROM
        users u
    JOIN
        ratings r ON u.userid = r.userid
    WHERE
        u.gender = 'F'
    GROUP BY
        u.userid
    ORDER BY
        review_count DESC
    LIMIT 1
),
top_10_movies_by_her AS (
    SELECT
        r.movieid,
        r.rating,
        r.timestamped 
    FROM
        ratings r
    JOIN
        top_female_reviewer tfr ON r.userid = tfr.userid
    ORDER BY
        r.rating DESC, r.timestamped DESC
    LIMIT 10
)
SELECT
    tfr.userid AS reviewer_id,
    m.title,
    AVG(r.rating) AS overall_avg_rating
FROM
    ratings r
JOIN
    movies m ON r.movieid = m.movieid
JOIN
    top_10_movies_by_her t10 ON r.movieid = t10.movieid
CROSS JOIN 
    top_female_reviewer tfr
GROUP BY
    tfr.userid, m.title
ORDER BY
    overall_avg_rating DESC;

-- =============================================
-- 6. Top 10 Best Movies from Year with Most High-Rated Movies (Rating >= 4.0)
-- =============================================

WITH movie_with_year AS (
    SELECT
        movieid,
        title,
        regexp_extract(title, '.*\\((\\d{4})\\).*', 1) AS year
    FROM
        movies
),
year_with_good_ratings_count AS (
    SELECT
        mwy.year,
        COUNT(1) as good_rating_count
    FROM
        ratings r
    JOIN
        movie_with_year mwy ON r.movieid = mwy.movieid
    WHERE
        r.rating >= 4.0 AND mwy.year IS NOT NULL AND mwy.year != ''
    GROUP BY
        mwy.year
),
best_year AS (
    SELECT
        year,
        good_rating_count
    FROM
        year_with_good_ratings_count
    ORDER BY
        good_rating_count DESC
    LIMIT 1
)
SELECT
    mwy.title,
    AVG(r.rating) AS avg_rating
FROM
    ratings r
JOIN
    movie_with_year mwy ON r.movieid = mwy.movieid
JOIN
    best_year byear ON mwy.year = byear.year
GROUP BY
    mwy.title
ORDER BY
    avg_rating DESC
LIMIT 10;

-- =============================================
-- 7. Top 10 Comedy Movies from 1997
-- =============================================

SELECT 
    m.title AS movie_name,
    AVG(r.rating) AS avg_rating
FROM 
    ratings r
JOIN 
    movies m ON r.movieid = m.movieid
WHERE 
    m.title LIKE '%(1997)%'
    AND m.genres LIKE '%Comedy%'
GROUP BY 
    m.title
ORDER BY 
    avg_rating DESC
LIMIT 10;

-- =============================================
-- 8. Top 5 Movies for Each Genre
-- =============================================

WITH exploded_genres AS (
    SELECT
        m.movieid,
        m.title,
        single_genre
    FROM
        movies m
    LATERAL VIEW explode(split(m.genres, '\\|')) t AS single_genre
),
movie_avg_ratings AS (
    SELECT
        eg.single_genre,
        eg.title,
        AVG(r.rating) as avg_rating
    FROM
        ratings r
    JOIN
        exploded_genres eg ON r.movieid = eg.movieid
    GROUP BY
        eg.single_genre, eg.title
)
SELECT
    single_genre,
    title,
    avg_rating
FROM (
    SELECT
        single_genre,
        title,
        avg_rating,
        ROW_NUMBER() OVER(PARTITION BY single_genre ORDER BY avg_rating DESC) as rn
    FROM
        movie_avg_ratings
) ranked_movies
WHERE
    rn <= 5;

-- =============================================
-- 9. Highest Rated Genre by Year
-- =============================================


WITH movie_with_year_and_genre AS (
    SELECT
        regexp_extract(m.title, '.*\\((\\d{4})\\).*', 1) AS year,
        single_genre,
        m.movieid
    FROM
        movies m
    LATERAL VIEW explode(split(m.genres, '\\|')) t AS single_genre
    WHERE
        regexp_extract(m.title, '.*\\((\\d{4})\\).*', 1) != ''
),
yearly_genre_ratings AS (
    SELECT
        myg.year,
        myg.single_genre,
        AVG(r.rating) as avg_rating
    FROM
        ratings r
    JOIN
        movie_with_year_and_genre myg ON r.movieid = myg.movieid
    GROUP BY
        myg.year, myg.single_genre
)
SELECT
    year,
    single_genre,
    avg_rating
FROM (
    SELECT
        year,
        single_genre,
        avg_rating,
        ROW_NUMBER() OVER(PARTITION BY year ORDER BY avg_rating DESC) as rn
    FROM
        yearly_genre_ratings
) ranked_genres
WHERE
    rn = 1
ORDER BY
    year DESC;

-- =============================================
-- 10. Highest Rated Movie by Region (Zipcode) - Save to HDFS
-- =============================================

SET hive.cli.print.header=true;

WITH region_movie_ratings AS (
    SELECT
        u.zipcode,
        m.title,
        AVG(r.rating) AS avg_rating
    FROM
        ratings r
    JOIN
        users u ON r.userid = u.userid
    JOIN
        movies m ON r.movieid = m.movieid
    WHERE u.zipcode IS NOT NULL AND u.zipcode != ''
    GROUP BY
        u.zipcode, m.title
),
ranked_region_movies AS (
    SELECT
        zipcode,
        title,
        avg_rating,
        ROW_NUMBER() OVER(PARTITION BY zipcode ORDER BY avg_rating DESC) as rn
    FROM
        region_movie_ratings
)
INSERT OVERWRITE DIRECTORY '/user/hive/movielens_output/top_movie_by_region'
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
SELECT
    zipcode,
    title,
    avg_rating
FROM
    ranked_region_movies
WHERE
    rn = 1;

-- =============================================
-- 11. 分区表设计与数据加载 
-- =============================================

SET hive.exec.dynamic.partition=true;
SET hive.exec.dynamic.partition.mode=nonstrict;

CREATE TABLE movies_partitioned (
    MovieID BIGINT,
    Title STRING,
    Genres STRING
)
PARTITIONED BY (release_year INT)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '::'
STORED AS TEXTFILE;INSERT OVERWRITE TABLE movies_partitioned PARTITION(release_year)
SELECT
    MovieID,
    Title,
    Genres,
    CAST(regexp_extract(title, '.*\\((\\d{4})\\).*', 1) AS INT) as release_year
FROM
    movies
WHERE
    regexp_extract(title, '.*\\((\\d{4})\\).*', 1) != '';

-- =============================================
-- 12. 桶表创建与数据存储 
-- =============================================

SET hive.enforce.bucketing = true;


CREATE TABLE ratings_bucketed (
    UserID BIGINT,
    MovieID BIGINT,
    Rating DOUBLE,
    Timestamped STRING
)
CLUSTERED BY (UserID) SORTED BY (MovieID) INTO 8 BUCKETS
ROW FORMAT DELIMITED FIELDS TERMINATED BY '::'
STORED AS TEXTFILE;

INSERT OVERWRITE TABLE ratings_bucketed
SELECT
    UserID,
    MovieID,
    Rating,
    Timestamped
FROM
    ratings;

-- =============================================
-- 13. 抽样分析实践 
-- =============================================


SELECT
    AVG(Rating) AS avg_rating,
    MAX(Rating) AS max_rating,
    MIN(Rating) AS min_rating
FROM
    ratings_bucketed TABLESAMPLE (10 PERCENT);

SELECT
    SUM(CASE WHEN Rating >= 4.0 THEN 1 ELSE 0 END) / COUNT(1) AS high_rating_ratio
FROM
    ratings_bucketed TABLESAMPLE (BUCKET 3 OUT OF 8 ON UserID);

SELECT
    UserID,
    MovieID,
    Rating
FROM
    ratings_bucketed TABLESAMPLE (BUCKET 3 OUT OF 8 ON UserID)
ORDER BY
    Rating DESC
LIMIT 3;

```