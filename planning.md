**User data collection**

1. upfront name, email and photos
2. Progressive Profiling for preferences and interests

**Convention**

1. use _snake_case_ for models
2. use _camelCase_ for module imports
3. use _camelCase_ for function names
4. use _snake_case_ for variables
5. use _CAPITAL_SNAKE_CASE_ for constants

**Ideations**
load the potential matches id in redis when user opens the app and update every 1hr/30mins, and query this data everytime the user calls the swipe API, send the data to kafka with an extra key called matched, kafka will check the key if matched save it to mongodb otherwise push it to batch process. remove the match id from redis data,
redis data expiry at 1hr or 30min
