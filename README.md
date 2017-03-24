# bc-library-application
Final project for Andela bootcamp 20

This is a Library Application for a local Library. It is built using the following technologies:
1. Nodejs Express module to handle the application's routing.
2. Mongoose DB is used to store the application's data.
3. Material Design Lite (MDL) is used to design the application's interface.

To run the app locally, follow the following steps:
1. Clone or download the application to your local device
2. Run npm install from the root directory
3. Start the application br running: SET DEBUG=LibApp:* & npm run devstart
4. Create a user account or login with the following admin details:
   email: admin@gmail.com
   password: password

The application has the following features:

1. A user can signup
2. A user can login
3. A user can borrow books
4. A user can view a list of books
5. A user can view a list of Authors
6. A user can view a list of books borrowed by him
7. A user can update his email and password
8. A user can view fees accrued
9. A user can view the list of books by a certain author
10. An admin can create authors
11. An admin can assign fees to users
12. An admin can create books
13. An admin can create categories
14. An admin can modify borrowed books instances
15. An admin can modify authors
16. An Admin can modify categories
17. An admin can modify Authors
18. An admin can modify books
19. An admin can modify user details
20. An admin can delete a borrowed instance
21. A user can borrow multiple books
22. A user is guarded from using an already existing email
23. A user is blocked from accessing unauthorized pages
24. A user is guarded from borrowing a book that out of stock
<<<<<<< HEAD
25. Admin can update borrowed instance
=======
25. A user recieves mail notification on borrow for 7 days
>>>>>>> bdecdcc... add mailing feature
