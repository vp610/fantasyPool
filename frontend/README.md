# README.md

# Frontend Project with Auth0 Authentication

This project is a React application that provides a landing page for users to log in or register using Auth0 for authentication.

## Project Structure

```
frontend-project
├── public
│   ├── index.html          # Main HTML file
├── src
│   ├── components
│   │   ├── Auth
│   │   │   ├── Login.tsx   # Login component
│   │   │   ├── Register.tsx # Registration component
│   │   └── LandingPage.tsx  # Landing page component
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point for the React application
│   └── auth_config.json     # Auth0 configuration settings
├── package.json             # npm configuration file
├── tsconfig.json            # TypeScript configuration file
└── README.md                # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd frontend-project
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure Auth0:**
   - Create an Auth0 account and set up a new application.
   - Update the `src/auth_config.json` file with your Auth0 domain and client ID.

4. **Run the application:**
   ```
   npm start
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:3000` to view the landing page.

## Usage

- Users can choose to log in or register from the landing page.
- The application uses Auth0 for secure authentication.

## License

This project is licensed under the MIT License.