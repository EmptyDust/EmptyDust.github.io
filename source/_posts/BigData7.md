---
title: BigData7
date: 2025-12-11 16:01:29
tags:
---

数据在项目根目录下
By Gemini3 Pro Review
```py
import sys
import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count, desc, explode
from pyspark.ml.recommendation import ALS
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.sql.types import StructType, StructField, IntegerType, StringType, FloatType, LongType

# 1. Initialize Spark Session
spark = SparkSession.builder \
    .appName("MovieLensLab") \
    .master("local[*]") \
    .getOrCreate()

# 2. Define Schema for loading data
# Movies: MovieID::Title::Genres
# Ratings: UserID::MovieID::Rating::Timestamp
# Since the separator is '::', we read as text first then parse to avoid CSV delimiter issues.

# --- Load Movies ---
movies_rdd = spark.sparkContext.textFile("movies.dat") \
    .map(lambda line: line.split("::")) \
    .map(lambda x: (int(x[0]), x[1], x[2]))

movies_df = spark.createDataFrame(movies_rdd, ["MovieID", "Title", "Genres"])

# --- Load Ratings ---
ratings_rdd = spark.sparkContext.textFile("rating.dat") \
    .map(lambda line: line.split("::")) \
    .map(lambda x: (int(x[0]), int(x[1]), float(x[2]), int(x[3])))

ratings_df = spark.createDataFrame(ratings_rdd, ["UserID", "MovieID", "Rating", "Timestamp"])

print("Data loaded successfully.")

print("========== Task 1: Basic Recommendation ==========")

# 1. Group ratings by MovieID to get Count and Average Rating
movie_stats = ratings_df.groupBy("MovieID") \
    .agg(
        count("Rating").alias("review_count"),
        avg("Rating").alias("avg_rating")
    )

# 2. Join with the movies DataFrame to get Titles
result_df = movie_stats.join(movies_df, "MovieID")

# 3. Filter:
#    - Review count > 20 (to ensure statistical significance)
#    - Average rating > 4.0 (High quality)
filtered_movies = result_df.filter((col("review_count") > 20) & (col("avg_rating") > 4.0))

# 4. Sort by average rating descending and show top 10
print("Top 10 Movies (High Rating + Many Reviews):")
filtered_movies.orderBy(desc("avg_rating")).show(10, truncate=False)

print("========== Task 2: ALS Model Training & Evaluation ==========")

# 1. Split data into Training (80%) and Test (20%) sets
(training_data, test_data) = ratings_df.randomSplit([0.8, 0.2], seed=42)

# 2. Initialize ALS (Alternating Least Squares) Model
#    userCol: Column for User IDs
#    itemCol: Column for Movie IDs
#    ratingCol: Column for Ratings
#    coldStartStrategy="drop": Drop rows in dataframe where predictions produce NaN (unknown users/items)
als = ALS(maxIter=10,
          regParam=0.1,
          userCol="UserID",
          itemCol="MovieID",
          ratingCol="Rating",
          coldStartStrategy="drop")

# 3. Train the model
model = als.fit(training_data)
print("ALS Model trained.")

# 4. Generate predictions on the Test set
predictions = model.transform(test_data)

# 5. Evaluate the model using RMSE (Root Mean Square Error)
evaluator = RegressionEvaluator(metricName="rmse", labelCol="Rating", predictionCol="prediction")
rmse = evaluator.evaluate(predictions)

print(f"Root-mean-square error (RMSE) = {rmse}")
# Show some predictions vs actual ratings
predictions.select("UserID", "MovieID", "Rating", "prediction").show(5)

print("========== Task 3: Personalized Recommendation ==========")

# 1. Define a new user ID (0 is usually safe as IDs start at 1)
my_user_id = 0
time_now = 978300760 # Dummy timestamp

# 2. Create my personal ratings (I like Animation and Action, dislike Horror)
#    Format: (UserID, MovieID, Rating, Timestamp)
#    Note: You must ensure these MovieIDs exist in your movies.dat.
#    Examples: 1: Toy Story, 260: Star Wars IV
my_ratings_data = [
    (my_user_id, 1, 5.0, time_now),    # Toy Story
    (my_user_id, 260, 5.0, time_now),  # Star Wars IV
    (my_user_id, 1196, 5.0, time_now), # Star Wars V
    (my_user_id, 1210, 4.0, time_now), # Star Wars VI
    (my_user_id, 589, 5.0, time_now)   # Terminator 2
]

# 3. Convert to DataFrame
my_ratings_df = spark.createDataFrame(my_ratings_data, ["UserID", "MovieID", "Rating", "Timestamp"])

# 4. Combine original data with my new data
combined_ratings_df = ratings_df.union(my_ratings_df)

# 5. Retrain the ALS model on the new combined dataset
#    (We must retrain so the model learns the embedding for User 0)
new_model = als.fit(combined_ratings_df)

# 6. Generate top 5 movie recommendations for all users
user_recs = new_model.recommendForAllUsers(5)

# 7. Filter recommendations for MY User ID (0)
my_recs = user_recs.filter(col("UserID") == my_user_id)

# 8. Explode the recommendations array to show them nicely
my_recs_exploded = my_recs.select("UserID", explode("recommendations").alias("rec")) \
    .select("UserID", "rec.MovieID", "rec.rating")

# 9. Join with Movie Titles to see what was recommended
final_recs = my_recs_exploded.join(movies_df, "MovieID")

print("Recommendations for Me (User 0):")
final_recs.select("Title", "Genres", "rating").orderBy(desc("rating")).show(truncate=False)

# Stop Spark Session
spark.stop()
```