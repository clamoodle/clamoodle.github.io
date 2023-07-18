started logging since 5/7/2023 too much to keep track of!!

# 7/18/2023:

## implemented:

-   In-game count-down

# 7/16/2023:

## implemented:

-   Azure web app compatibility (index.ejs, routes and views directories)

## todo:

-   In-game count-down
-   pause button
-   (BUG) clear cookies upon reload
-   multiplayer
-   factor out end points completely
-   (BUG) Currently leaderboard doesn't include current user (add query param in get users endpoint for
    whether to include current user)
-   (BUG) Min score filter in find friends
-   session ID (cs253 lec 3)

# 6/16/2023:

(wdym ofc 12:01 am is yesterday)

## implemented:

-   specific user details page, for curr user and all other users
-   update curr-high-score when posting score after each game
-   add friends, rn just immediately (can later implement "send friend request" using email and/or adding another entry to users.json for friend requests and display notification if logged in)
-   wrote APIDOC.md
-   now friends filter won't show curr-user (app.js)
-   reflection PDF added
-   toggle visibility of message/add-friend buttons depending on if users are friends

# 6/15/2023:

## implemented:

-   registration username uniqueness
-   remove create/login/guest buttons after login to replace with start game
-   credits LMAO
-   friends.js to make search filter usable and display users using fetch
-   fix bug of unending game
-   score post after each game
-   fix avatar img src user-specific for pw login
-   leaderboard get request and display users
-   html auto complete search bar

## todo:

-   specific user details page
-   add friends (can implement email and/or add another entry to users.json for friend requests and display notification if logged in)
-   api doc

# 6/14/2023:

## implemented:

-   login cookies running
-   character select backend post newUser
-   error message popup for 2 seconds (handleError in utils.js)

## todo:

-   !! messaging between users (https://socket.io/docs/v3/#how-does-that-work)
-   find library for sending email/friend request
-   multiplayer
-   err message css fade out animation
-   pause game feature
-   encrypt passwords using database

# 6/13/2023:

## implemented:

-   organized image folders in media
-   change in game avatar from div bg image to img src
-   2 space indentation instead of 4 lol, and formatted log.md
-   characater select frontend buttons omg, make character in game match that selected
-   made sprites for all avatars
-   app.js check username uniqueness, at least 1 character, pw at least 1 character
-   validate input frontend for character register

# 6/12/2023:

## implemented:

-   app.get users filter info (friends, species, min-highscore)
-   app.post for updateScore and newUser

# 6/2/2023:

## implemented:

-   fixed bugs from last time of z-index and click card

## todo:

-   level select (slider for obstacle frequency, which also affects SCORE_INCREMENT_INTERVAL_MS)
-   character creation screen
-   leaderboard (POST everytime game finishes)
-   messaging, friends API w. passwords
-   at some point: password/img privacy (also for avg face)
-   multiplayer? race of 2 tracks (left/right screens or top/bottom screens or main/thumb screens)
    and/or colab mode (where one user jumps and one user clicks cards)

# 5/30/2023:

## implemented:

SET IS PLAYABLE NOW!!!

-   fixed z-index set board bug
-   added keyboard card select
-   added score count
    -   increment with each set found
    -   increase with timer (like chrome dino game)
-   sped up walk rate (like chrome dino)
-   factored out z-index and color palette for css
-   tried to add obstacle pushes avatar back but style.left not working
-   guarantee sets in board, refresh with penalty
-   disabling card select after game ends and before game starts

## todo:

-   z-index of foregroudn grass bug (passing behind doggo)
-   click card not selecting bug

# 5/26/2023:

## implemented:

-   factor out pop-up style
-   close button for popups and js
-   style for leaderboard, menu, friends, message
    -   friends search bar filter
-   buttons/js directions for those pages
-   close popup button
-   added set board to in-game

## todo:

-   set board bug

# 5/23-24/2023

## implemented:

-   html/css for find friends page

## todo:

-   add set element to game play
-   add friends, request friends, multi player gae
-   Log in and keeping track of users
-   Add friends, message friends?, see friends scores history
-   Character creation screen (eel or not eel, implement different speeds for eel / not eel, then color)
-   Game levels (faster obstacles, now requires set-skills)
-   Menu: leader board, add friends, volume toggle, back to main page, user score history
-   Add set board to in-game screen
-   (If I have time) E-commerce component: in-game clothing store ( also want eventually actual money to buy additional in-game coins)
-   Main view: see friends! Single view: view friends stats. Contact dev. Cart for friend pendings/clothes to buy?
-   Back-end chosen features:
-   Loyal customers past a certain score/level
-   Customizable characters (can also purchase skin color, etc)

# 5/8/2023

## implemented:

-   fixed bug after end game things sliding around by using recursive settimeout instead of loop
-   game over messages and back button
-   changed welcome view bg gradient color
-   changeMusic() function, now plays different song when game end
-   menu button construction message, fixed bug of welcome song restarting when dismissing menu
-   twinkling sparkles animation around goal
-   restart game obstacle count reset
-   space bar to start game/blinking messages before game starts
-   fixed bugs in timer, etc, in restarting game after going back to welcome screen
-   factored out keyframes.css

## todo:

-   [x] make sound buttons clickable during popups/ but not during #sound-menu (z-index refactoring)
-   [ ] jumping / discontinuous hindground (recalculate css animation)

# 5/7/2023

## implemented:

-   background in-game obstacle count down
-   game play sprites, goal, random obstacles
-   change music buttons to divs to use class to toggle bg
-   game play soundtrack change / play music if not muted
-   collision detection
-   collision handling for goal

## todo:

-   [x] collision handling obstacle flash avatar/bounce back
-   set board
-   press space to start
-   [x] twinkle animation around goal
-   [x] menu button does nothing rn
-   create character screen
-   lints
-   files organize media files?
-   [x] making a music class to keep track of buttons and time gaps and stuff??
