# The Picnic Basket

A recipe web app that lets users browse recipes, create their own recipes, save favorites, and ask a chatbot for recipe help.
Deployed link to access application: thepicnicbasket.netlify.app

## Features 

- Browse official recipes
- Search for recipes
- View recipe details
- Create user-submitted recipes
- Save recipes
- View saved recipes
- Chatbot for recipe help, substitutions, and cooking instructions
- Firebase database support
- Image upload support through AWS S3
- Backend API built with Express

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/shrihan-vijay/forge-week3-recipechatbot.git
cd forge-week3-recipechatbot
```

### 2. Install backend dependencies 

```bash 
cd backend
npm install
```

### 3. Create backend .env file

```bash
PORT=5001

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
SPOONACULAR_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_api_key

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

### 4. Start backend 

```bash
npm start
```
The backend runs on http://localhost:5001

### 5. Install frontend dependencies

Open a new terminal and run
```bash
cd frontend
npm install
```
### 6. Start frontend
```bash
npm run dev
```
The frontend runs on the local Vite URL shown in the terminal.

## API Information

The backend handles requests for:

- Fetching official recipes from Spoonacular
- Reading and writing user recipes in Firebase
- Saving recipes
- Uploading recipe images
- Sending chatbot prompts to OpenAI

### API Endpoints

#### Spoonacular API
Used to:
- Search recipes
- Retrieve recipe details
- Fetch recipe images and ingredients
