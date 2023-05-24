started logging since 5/7/2023 too much to keep track of!!

5/23-24/2023
implemented:
    - html/css for find friends page

todo:
    - add set element to game play
    - add friends, request friends, multi player gae
    - Log in and keeping track of users
    - Add friends, message friends?, see friends scores history
    - Character creation screen (eel or not eel, implement different speeds for eel / not eel, then color)
    - Game levels (faster obstacles, now requires set-skills)
    - Menu: leader board, add friends, volume toggle, back to main page, user score history
    - Add set board to in-game screen
    - (If I have time) E-commerce component: in-game clothing store ( also want eventually actual money to buy additional in-game coins)

    - Main view: see friends! Single view: view friends stats. Contact dev. Cart for friend pendings/clothes to buy?
    - Back-end chosen features:
    - Loyal customers past a certain score/level
    - Customizable characters (can also purchase skin color, etc)



5/8/2023
implemented:
    - fixed bug after end game things sliding around by using recursive settimeout instead of loop
    - game over messages and back button
    - changed welcome view bg gradient color
    - changeMusic() function, now plays different song when game end
    - menu button construction message, fixed bug of welcome song restarting when dismissing menu
    - twinkling sparkles animation around goal
    - restart game obstacle count reset
    - space bar to start game/blinking messages before game starts
    - fixed bugs in timer, etc, in restarting game after going back to welcome screen
    - factored out keyframes.css

todo:
    x make sound buttons clickable during popups/ but not during #sound-menu (z-index refactoring)
    - jumping / discontinuous hindground (recalculate css animation)


5/7/2023
implemented:
    - background in-game obstacle count down
    - game play sprites, goal, random obstacles
    - change music buttons to divs to use class to toggle bg
    - game play soundtrack change / play music if not muted
    - collision detection
    - collision handling for goal

todo:
    x collision handling obstacle flash avatar/bounce back
    - set board
    - press space to start
    v twinkle animation around goal

    v menu button does nothing rn 
    - create character screen
    - lints
    - files organize media files?
    x making a music class to keep track of buttons and time gaps and stuff??
