# node-api-test-one


<!-- Redis Flow -->
Request → Middleware
            ↓
        Redis GET
         ↓       ↓
      HIT        MISS
       ↓           ↓
   return data   run API
                     ↓
               store in Redis