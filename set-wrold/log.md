started logging since 5/7/2023 too much to keep track of!!

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

