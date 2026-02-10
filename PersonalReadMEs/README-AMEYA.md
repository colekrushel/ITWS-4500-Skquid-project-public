2/9/25:
Today I worked on the frontend of the main homepage. I felt that this wasn't too much of a challenge.
Using react, it was easy to seperate the navbar and the rest of the page. The only issue that I did have 
has with creating the svg. I couldn't figure out how to create the wave effect in React for a while. I found
a website that gave me the values for the wave, however because I am new to React, I was confused as to how to 
implement this in React. I then switched to work on my lab for this class, where I was creating buttons with 
specific values (such as setting type and value to different things). I used this logic, and applied it to creating 
a svg element using react. I also was confused for a while with figuring out how to position the various elements on my 
page. However, I realized that since I didn't need these elements to move at all, I could just use absolute positioning, 
and use top, bottom, and translate to move the divs around. 

2/15/25:
Today I worked on creating the navbar that will be used on all of our pages. Creating the navbar itself wasn't too bad,
as I just followed W3's implementaiton, but converted it into react. The hard part came when I tried to test it, by trying
to import it into another page. This is because since we aren't using the other method of implementing react, I am unable to
import a css file into my nav.js. Instead, I have to manually write the styling for each new element that I create in the nav.js.
Now it works when I just import the nav.js to other files.

2/16/25:
Today I worked more on the second homepage. Today was a bit challenging, because I was trying to create a toggle button that slid
from left to right, and right to left, depending on where it is when clicked. I was able to pretty quickly figure out how to move the
image left and right (I used react's useState, and just changed the class of the image on click). However, I had a lot of trouble 
figuring out how to make the image have a transition. I tried various different transition effects with margin, in order for the image 
to smoothly move left and right. However, I quickly realized using left was easier than using margins, as margins made the image's
movement clunky. After looking through various articles, I finally realized that I could just add a class to the existing class
of the image, and by doing so, I could add a transition on adding of class (found a stack overflow website that helped me figure this
out).

2/22/25:
Today I finished the second homepage. More specifically, I finished creating the about/how skquid works slider, and also the friends 
tab. I didn't have too much issue here, as I already knew how to work with useeffect a bit. This made it easier to figure out how 
to update the title text, and the content text, when I clicked the slider. Creating the friends tab was also easy. I made a friend 
card function in react. I then fetched data from a json file, and created a card for each friend, and then added these cards into 
the friends section of the page. 

3/20/25:
Today I worked on connecting server to MongoDB. I then created functionality for the server to pull data from the friends folder.
I then created a fake friend of the user, and edge cases based on if a specific user has any friends correlated to them. I also 
created the funtion that allows users to add friends. It checks to make sure the user isn't already a friend, and if so,
will add the friends userId to their friends list. I didn't have too much trouble here, as I was able to find a good document
that went over how to easily push items to an array. 

3/27/25:
Today I created an endpoint that allowed my frontend to display the user's friends list onto the second homepage. I also
worked on creating/finished creatng a section on the second homepage that display a short list of interests that related to the user. I had a lot of trouble trying to figure out how to properly display the events similar to the users interest. This was because after
displaying the similar interests, the overall height of the page would increase. But even though the height would incrase, the border
between the left and right side wouldn't go all the way down. To fix this, I tried to use vh instead of % for heigh. This worked, but 
for some reason shifted all the contents to the left a bit. I tried various different things, such as playing around with margins, but
with no success. Eventually, I found a documentation that showed me how to use flex in order to shift elements around. Today I also 
just overall worked on the css of the website. I also created the skills card, which displays events similar to the users skills.

3/29/25:
Today I worked on creating the functionality where if the user doesn't have any skills added, instead of recommending events related
to the skill, the box will ask the user to add skills before being able to be recommended events. 

4/8/25:
Today I worked on the functionality to use session data to get the logged in user's id. I also added the form that will allow users
to create a event to share. I also created ability to view your matched events. I had trouble figuring out how to use the session data
information, as I wasn't the one who implemented that. I was able to figure this out by asking my groupmate how to use the sesison 
data information. Other than that, I didn't really have issues. I also created the buttons to add/delete events, although I have not
currently added implementation for them yet. 

4/9/25:
Today I made the form for creating events work. I also added implementation that showed you the events you created. I also 
created the functionality to delete events from matches, along with delete events that you created. This part took me a long time,
because I had to work with various different fetch calls, and various different endpoints. What really elped me here was using the
react useeffects, as that helped me by realoding the page on change. 

4/10/25:
I made it so that when click on pfp it routes to the person’s pfp. Made pfp be the inputted pfp in the users's data. I changed the endpoint to get friends list to work with the new users document. I made an endpoint to get the friends friend request list. 
I also created functionality for adding friends from the pending friend request. This adds each user to the other users friends list.
And the friend who requested to be a friend gets removed from the current users's friend_request list.

4/13/25:
I made the view event functionality work on the second homepage. I also added the functionality to remove friend from friend request. 
I also worked on functionality to go to the messaging page when clicking on user's message button. I had trouble with figuring out how
to create a popup. However, I was easily able to fix this by looking online about how to use modals. 

4/20/25:
Today I worked on creating the mobile view page for the secondhomepage. I didn't have too muh trouble here, as I just looked up
on W3 schools and mozilla how to use hte media queries. I also worked on making the navbar mobile view. 

https://www.smashingmagazine.com/2015/12/generating-svg-with-react/

https://blog.logrocket.com/create-wavy-background-using-css-svg/

https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox

https://css-tricks.com/snippets/css/text-rotation/

https://www.w3schools.com/css/css_navbar.asp

https://www.w3schools.com/css/css3_flexbox.asp

https://stackoverflow.com/questions/22252472/how-can-i-change-the-color-of-an-svg-element

https://stackoverflow.com/questions/8722163/how-to-assign-multiple-classes-to-an-html-

https://stackoverflow.com/questions/572298/how-to-stop-text-from-taking-up-more-than-1-line

https://stackoverflow.com/questions/63541670/how-to-position-a-button-on-website-using-html-css

https://www.w3schools.com/cssref/css3_pr_transform.php

https://stackoverflow.com/questions/63211031/exporting-a-navbar-with-props-for-selected-page

https://react.dev/reference/react/useState

https://react.dev/learn/importing-and-exporting-components

https://www.browserstack.com/guide/how-to-resize-image-using-css

https://www.w3schools.com/css/tryit.asp?filename=trycss3_transition_transform

https://stackoverflow.com/questions/16176648/trying-to-do-a-css-transition-on-a-class-change

https://www.pluralsight.com/resources/blog/guides/applying-classes-conditionally-react

https://www.w3schools.com/css/css3_transitions.asp

https://stackoverflow.com/questions/59198952/using-document-queryselector-in-react-should-i-use-refs-instead-how

https://react.dev/reference/react/useEffect

https://www.mongodb.com/docs/manual/reference/operator/update/push/#:~:text=Append%20Multiple%20Values%20to%20an,values%20to%20the%20array%20field.

https://stackoverflow.com/questions/2279519/how-to-get-main-div-container-to-align-to-centre

https://developer.mozilla.org/en-US/docs/Web/CSS/flex

https://www.mongodb.com/docs/manual/reference/operator/aggregation/function/

https://www.w3schools.com/css/css_rwd_mediaqueries.asp

https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries