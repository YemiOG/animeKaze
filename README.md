# animeKaze

Building a great community for all anime lovers

## Backend
Step1: Enter the backend directory and create and activate your environment:

- For mac/unix users: 

  **create:** ```python3 -m venv env```

  **activate:** `source env/bin/activate`

- For windows users: 

  **create:** `py -m venv env`

  **activate:** `.\env\Scripts\activate`


Step2: Then install the requirements using:
`pip install -r requirements.txt`

Step3: Run migrations to make the database up to date
  - Run `flask db migrate`
  - Then `flask db upgrade`

## Frontend
- Return to the base directory and run: `npm install` before running the scripts below.

## Running the application with the available scripts
- Step 1: run `npm run start-backend` to start the flask backend server.

- Step 2: run `npm start` to start the frontend section of the application.

- Step 3: [http://localhost:3000](http://localhost:3000) to view it in the browser.

