# Kanji Study App

A personalized application to help you study Japanese kanji characters based on elementary school grade levels.

## Features

- Select kanji sets by elementary school grade (1-5)
- Choose study mode (meaning to kanji or kanji to meaning)
- Track your progress with a 5-level proficiency system
- View detailed statistics about your learning progress
- Filter and browse all kanji in the database
- Expandable architecture to support words containing kanji

## Tech Stack

- Frontend: React.js with React Router
- Backend: Node.js with Express
- Database: SQLite

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Server Setup

1. Navigate to the server directory:
   ```
   cd kanji-study/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

The server will run on port 3001 by default.

### Client Setup

1. Navigate to the client directory:
   ```
   cd kanji-study/client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The client will run on port 3000 by default.

## Usage

1. **Home Screen**: View your overall statistics and quick access to study features.

2. **Study Settings**: Configure your study session:
   - Select kanji grades to include
   - Set the number of kanji to review
   - Choose the study mode (meaning to kanji or kanji to meaning)

3. **Quiz Mode**: Review the kanji one by one:
   - Answer whether you knew the kanji or not
   - Progress through all kanji in the set

4. **Results**: At the end of each quiz:
   - See your accuracy for the session
   - Review the kanji you got wrong

5. **Kanji List**: Browse and filter all kanji:
   - Filter by grade level
   - Filter by proficiency level

6. **Stats**: View detailed statistics about your study progress.

## Database Structure

The application uses SQLite with the following tables:

- `kanji`: Stores kanji characters, meanings, grades, and proficiency levels
- `words`: For future expansion to support words containing kanji
- `word_kanji`: Junction table for the word-kanji relationship
- `review_history`: Tracks your review history and results

## Expanding the App

The app is designed to be expanded in the future to include:

1. **Words containing kanji**: The database structure already includes tables for words and their relationship to kanji.

2. **Additional study modes**: You can add new modes in the frontend and backend.

3. **More kanji data**: You can add more kanji to the database by modifying the sample data in `server/db.js`.

## Customizing Kanji Data

To add your own kanji data, modify the `insertSampleData` function in `server/db.js`. The current structure provides a sample of 10 kanji, but you can add more as needed.